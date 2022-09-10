/*
 * Copyright (c) "Neo4j"
 * Neo4j Sweden AB [http://neo4j.com]
 *
 * This file is part of Neo4j.
 *
 * Neo4j is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */
import { useMutation } from '@apollo/client'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { CypherEditor } from 'neo4j-arc/cypher-language-support'
import { QueryResult } from 'neo4j-driver'
import React, { Dispatch, useEffect, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { Action } from 'redux'

import { Bus } from 'suber'

import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import {
  FrameButton,
  StyledEditorButton,
  StyledMainEditorButtonsContainer
} from 'browser-components/buttons'
import {
  CloseIcon,
  ContractIcon,
  ExpandIcon,
  FavoriteIcon,
  FileIcon,
  RunIcon,
  UpdateFileIcon
} from 'browser-components/icons/LegacyIcons'
import {
  ADD_PROJECT_FILE,
  REMOVE_PROJECT_FILE
} from 'browser-components/ProjectFiles/projectFilesConstants'
import { getProjectFileDefaultFileName } from 'browser-components/ProjectFiles/projectFilesUtils'
import { defaultNameFromDisplayContent } from 'browser-components/SavedScripts'
import { isMac } from 'neo4j-arc/common'
import {
  CurrentEditIconContainer,
  EditorContainer,
  FlexContainer,
  Header,
  MainEditorWrapper,
  ScriptTitle
} from './styled'

import { base } from 'browser-styles/themes'
import { NEO4J_BROWSER_USER_ACTION_QUERY } from 'services/bolt/txMetadata'
import { GlobalState } from 'shared/globalState'
import { getProjectId } from 'shared/modules/app/appDuck'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import { applyParamGraphTypes } from 'shared/modules/commands/helpers/cypher'
import { getUseDb } from 'shared/modules/connections/connectionsDuck'
import { CYPHER_REQUEST } from 'shared/modules/cypher/cypherDuck'
import {
  EDIT_CONTENT,
  EXPAND,
  FOCUS,
  SET_CONTENT
} from 'shared/modules/editor/editorDuck'
import {
  REMOVE_FAVORITE,
  updateFavoriteContent
} from 'shared/modules/favorites/favoritesDuck'
import { getHistory } from 'shared/modules/history/historyDuck'
import { getParams } from 'shared/modules/params/paramsDuck'
import {
  codeFontLigatures,
  shouldEnableMultiStatementMode
} from 'shared/modules/settings/settingsDuck'

import { LoadingButton } from '@mui/lab'
import {
  Alert,
  Autocomplete,
  Checkbox,
  Chip,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
  Snackbar,
  TextField,
  Typography
} from '@mui/material'

import { H3, H4 } from 'browser-components/headers'
import { RequestConfig } from 'browser/models/pipeline-config'
import {
  FULLSCREEN_SHORTCUT,
  printShortcut
} from 'browser/modules/App/keyboardShortcuts'
import { staticDiseases } from 'browser/static/diseases'

type EditorFrameProps = {
  bus: Bus
  codeFontLigatures: boolean
  enableMultiStatementMode: boolean
  executeCommand: (cmd: string, source: string) => void
  history: string[]
  projectId?: string
  updateFavorite: (id: string, value: string) => void
  useDb: null | string
  params: Record<string, unknown>
  isConnected: boolean
}

type SavedScript = {
  content: string
  directory?: string
  id: string
  isProjectFile: boolean
  isStatic: boolean
  name?: string
}

type Pipeline = 'pubmed' | 'ner' | 'medGen' | 'uniProt'

interface PipelineConfiguration {
  [key: string]: boolean
}

const defaultRequestState: RequestConfig = {
  disease: '',
  numberOfArticles: 150,
  deleteGraph: false,
  deleteGraphPassword: '',
  pipelines: {
    medGen: {
      clinicalFeatures: true,
      run: true,
      Snomed: true
    },
    ner: {
      entityLinks: true,
      run: true
    },
    pubmed: {
      meshTerms: true,
      run: true
    },
    uniProt: {
      run: true
    }
  }
}

export function MainEditor({
  bus,
  codeFontLigatures,
  enableMultiStatementMode,
  isConnected,
  executeCommand,
  history,
  projectId,
  updateFavorite,
  useDb,
  params
}: EditorFrameProps): JSX.Element {
  const [addFile] = useMutation(ADD_PROJECT_FILE)
  const [unsaved, setUnsaved] = useState(false)
  const [isRequestLoading, setIsRequestLoading] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [isFullscreen, setFullscreen] = useState(false)
  const [currentlyEditing, setCurrentlyEditing] = useState<SavedScript | null>(
    null
  )
  const [activeSearchTerms, setActiveSearchTerms] = useState<string[]>([])
  const [requestConfiguration, setRequestConfiguration] =
    useState<RequestConfig>(defaultRequestState)

  const editorRef = useRef<CypherEditor>(null)

  const toggleFullscreen = () => {
    setFullscreen(fs => !fs)
  }

  useEffect(() => {
    editorRef.current?.resize(isFullscreen)
  }, [isFullscreen])

  useEffect(() => bus && bus.take(EXPAND, toggleFullscreen), [bus])
  useEffect(
    () =>
      bus &&
      bus.take(REMOVE_FAVORITE, ({ id }) => {
        if (id === currentlyEditing?.id) {
          setCurrentlyEditing(null)
          editorRef.current?.setValue('')
        }
      }),
    [bus, currentlyEditing]
  )
  useEffect(
    () =>
      bus &&
      bus.take(REMOVE_PROJECT_FILE, ({ name }) => {
        if (name === currentlyEditing?.name) {
          setCurrentlyEditing(null)
          editorRef.current?.setValue('')
        }
      }),
    [bus, currentlyEditing]
  )

  useEffect(
    () =>
      bus &&
      bus.take(
        EDIT_CONTENT,
        ({ message, id, isProjectFile, name, directory, isStatic }) => {
          setUnsaved(false)
          setCurrentlyEditing({
            content: message,
            id,
            isProjectFile,
            name,
            directory,
            isStatic
          })
          editorRef.current?.setValue(message)
        }
      ),
    [bus]
  )

  useEffect(() => {
    bus.take(FOCUS, () => {
      editorRef.current?.focus()
    })
  }, [bus])

  useEffect(
    () =>
      bus &&
      bus.take(SET_CONTENT, ({ message }) => {
        setUnsaved(false)
        setCurrentlyEditing(null)
        editorRef.current?.setValue(message)
      }),
    [bus]
  )

  useEffect(() => {
    fetchSearchTerms()
  }, [])

  function discardEditor() {
    editorRef.current?.setValue('')
    setCurrentlyEditing(null)
    setFullscreen(false)
  }

  const fetchSearchTerms = async () => {
    const response = await fetch('https://dzkj.fordo.de/searchTerms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ token: 'gTROnCD7nMeifPU' })
    })
    const json = await response.json()
    const searchterms = json['searchTerms']
    if (searchterms !== undefined) {
      setActiveSearchTerms(searchterms)
    }
  }

  const buttons = [
    {
      onClick: toggleFullscreen,
      title: `${
        isFullscreen ? 'Close fullscreen ' : 'Fullscreen'
      } (${printShortcut(FULLSCREEN_SHORTCUT)})`,
      icon: isFullscreen ? <ContractIcon /> : <ExpandIcon />,
      testId: 'fullscreen'
    },
    {
      onClick: discardEditor,
      title: 'Clear',
      icon: <CloseIcon />,
      testId: 'discard'
    }
  ]

  function createRunCommandFunction(source: string) {
    return () => {
      executeCommand(editorRef.current?.getValue() || '', source)
      editorRef.current?.setValue('')
      setCurrentlyEditing(null)
      setFullscreen(false)
    }
  }

  function getName({ name, content, isProjectFile }: SavedScript) {
    if (name) {
      return name
    }
    if (isProjectFile) {
      return getProjectFileDefaultFileName(content)
    }

    return defaultNameFromDisplayContent(content)
  }

  const showUnsaved = !!(
    unsaved &&
    currentlyEditing &&
    !currentlyEditing?.isStatic
  )

  const pipelineConfig = requestConfiguration.pipelines

  const handleSubmit = () => {
    setIsRequestLoading(true)
    const requestJSON = buildRequestJSON(requestConfiguration)
    ;(async () => {
      await fetch('https://dzkj.fordo.de/buildGraph', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: requestJSON
      })

      setIsRequestLoading(false)
      setShowSnackbar(true)
      fetchSearchTerms()
    })()
  }

  const handlePipelineChange = (config: Object) => {
    setRequestConfiguration({
      ...requestConfiguration,
      pipelines: {
        ...requestConfiguration.pipelines,
        ...config
      }
    })
  }

  return (
    <MainEditorWrapper isFullscreen={isFullscreen} data-testid="activeEditor">
      {isConnected && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls="panel1a-content"
              id="panel1a-header"
            >
              <H3>{'Configure Graph'}</H3>
            </AccordionSummary>
            <AccordionDetails>
              <div style={{ padding: 8 }}>
                <H4>Active Searchterms</H4>
                <Paper style={{ padding: 8 }}>
                  {activeSearchTerms.map(term => (
                    <Chip
                      color="primary"
                      style={{ marginRight: 4, marginTop: 4 }}
                      label={term}
                      key={term}
                    />
                  ))}
                </Paper>
                <H4 style={{ marginTop: 16 }}>1. Select Disease</H4>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Autocomplete
                      freeSolo
                      id="free-solo-2-demo"
                      disableClearable
                      style={{ width: '100%' }}
                      options={staticDiseases}
                      onChange={(evt, value) =>
                        setRequestConfiguration({
                          ...requestConfiguration,
                          disease: value
                        })
                      }
                      renderInput={params => (
                        <TextField
                          {...params}
                          label="Disease"
                          key={params.id}
                          InputProps={{
                            ...params.InputProps,
                            type: 'search',
                            onChange: evt =>
                              setRequestConfiguration({
                                ...requestConfiguration,
                                disease: evt.currentTarget.value
                              })
                          }}
                        />
                      )}
                    />
                  </Grid>
                  <Grid item xs={2}>
                    <TextField
                      id="outlined-basic"
                      label="Number of Articles"
                      type="number"
                      onChange={evt =>
                        setRequestConfiguration({
                          ...requestConfiguration,
                          numberOfArticles: parseInt(evt.currentTarget.value)
                        })
                      }
                      variant="outlined"
                      value={requestConfiguration.numberOfArticles}
                    />
                  </Grid>
                </Grid>
                <H4 style={{ marginTop: 16 }}>2. Configure Pipelines</H4>
                <Grid container spacing={2}>
                  <Grid item xs={3}>
                    <Paper style={{ padding: 16 }}>
                      <Typography variant="h6">Pubmed</Typography>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={pipelineConfig.pubmed.run}
                              name="run"
                              disabled={isPipelineDisabled(
                                requestConfiguration,
                                'pubmed'
                              )}
                              onChange={evt =>
                                handlePipelineChange({
                                  pubmed: {
                                    ...requestConfiguration.pipelines.pubmed,
                                    run: evt.currentTarget.checked
                                  }
                                })
                              }
                            />
                          }
                          label="Run"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={pipelineConfig.pubmed.meshTerms}
                              name="meshterms"
                              onChange={evt =>
                                handlePipelineChange({
                                  pubmed: {
                                    ...requestConfiguration.pipelines.pubmed,
                                    meshTerms: evt.currentTarget.checked
                                  }
                                })
                              }
                            />
                          }
                          label="Meshterms"
                        />
                      </FormGroup>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper style={{ padding: 16 }}>
                      <Typography variant="h6">NER</Typography>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={pipelineConfig.ner.run}
                              disabled={isPipelineDisabled(
                                requestConfiguration,
                                'ner'
                              )}
                              onChange={evt =>
                                handlePipelineChange({
                                  ner: {
                                    ...requestConfiguration.pipelines.ner,
                                    run: evt.currentTarget.checked
                                  }
                                })
                              }
                              name="ner-run"
                            />
                          }
                          label="Run"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={pipelineConfig.ner.entityLinks}
                              name="ner-entity-links"
                              onChange={evt =>
                                handlePipelineChange({
                                  ner: {
                                    ...requestConfiguration.pipelines.ner,
                                    entityLinks: evt.currentTarget.checked
                                  }
                                })
                              }
                            />
                          }
                          label="Entity Links"
                        />
                      </FormGroup>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper style={{ padding: 16 }}>
                      <Typography variant="h6">MedGen</Typography>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={pipelineConfig.medGen.run}
                              disabled={isPipelineDisabled(
                                requestConfiguration,
                                'medGen'
                              )}
                              onChange={evt =>
                                handlePipelineChange({
                                  medGen: {
                                    ...requestConfiguration.pipelines.medGen,
                                    run: evt.currentTarget.checked
                                  }
                                })
                              }
                              name="run"
                            />
                          }
                          label="Run"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={pipelineConfig.medGen.Snomed}
                              name="snomed"
                              onChange={evt =>
                                handlePipelineChange({
                                  medGen: {
                                    ...requestConfiguration.pipelines.medGen,
                                    Snomed: evt.currentTarget.checked
                                  }
                                })
                              }
                            />
                          }
                          label="Snomed"
                        />
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={pipelineConfig.medGen.clinicalFeatures}
                              name="clinicalFeatures"
                              onChange={evt =>
                                handlePipelineChange({
                                  medGen: {
                                    ...requestConfiguration.pipelines.medGen,
                                    clinicalFeatures: evt.currentTarget.checked
                                  }
                                })
                              }
                            />
                          }
                          label="Clinical Features"
                        />
                      </FormGroup>
                    </Paper>
                  </Grid>
                  <Grid item xs={3}>
                    <Paper style={{ padding: 16 }}>
                      <Typography variant="h6">uniProt</Typography>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={pipelineConfig.uniProt.run}
                              name="run"
                              disabled={isPipelineDisabled(
                                requestConfiguration,
                                'uniProt'
                              )}
                              onChange={evt =>
                                handlePipelineChange({
                                  uniProt: {
                                    ...requestConfiguration.pipelines.uniProt,
                                    run: evt.currentTarget.checked
                                  }
                                })
                              }
                            />
                          }
                          label="Run"
                        />
                      </FormGroup>
                    </Paper>
                  </Grid>
                </Grid>

                <H4 style={{ marginTop: 16 }}>3. Configure Graph Merge</H4>
                <Paper style={{ padding: 16, width: '50%' }}>
                  <Typography>
                    Specify whether the newly created graph should replace the
                    existing graph (only possible with correct password) or if
                    it should be merged with the existing graph.
                  </Typography>
                  <FormGroup>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={requestConfiguration.deleteGraph}
                          name="Delete Graph"
                          onChange={evt =>
                            setRequestConfiguration({
                              ...requestConfiguration,
                              deleteGraph: evt.currentTarget.checked
                            })
                          }
                        />
                      }
                      label="Delete Graph"
                    />
                  </FormGroup>
                  {requestConfiguration.deleteGraph && (
                    <TextField
                      id="outlined-basic"
                      label="Password"
                      type="password"
                      onChange={evt =>
                        setRequestConfiguration({
                          ...requestConfiguration,
                          deleteGraphPassword: evt.currentTarget.value
                        })
                      }
                      variant="outlined"
                      value={requestConfiguration.deleteGraphPassword}
                    />
                  )}
                </Paper>

                <LoadingButton
                  onClick={handleSubmit}
                  type="submit"
                  disabled={
                    isRequestLoading || requestConfiguration.disease == ''
                  }
                  loading={isRequestLoading}
                  loadingPosition="end"
                  variant="contained"
                  style={{ width: 200, marginTop: 16 }}
                >
                  {isRequestLoading ? 'Creating Graph...' : 'Search'}
                </LoadingButton>
              </div>
            </AccordionDetails>
          </Accordion>
        </>
      )}
      {currentlyEditing && (
        <ScriptTitle data-testid="currentlyEditing" unsaved={showUnsaved}>
          {currentlyEditing.isProjectFile ? (
            <CurrentEditIconContainer>
              <FileIcon width={12} />
            </CurrentEditIconContainer>
          ) : (
            <CurrentEditIconContainer>
              <FavoriteIcon width={12} />
            </CurrentEditIconContainer>
          )}

          {currentlyEditing.isProjectFile ? ' Project file: ' : ' Favorite: '}
          {getName(currentlyEditing)}
          {showUnsaved ? '*' : ''}
          {currentlyEditing.isStatic ? ' (read-only)' : ''}
        </ScriptTitle>
      )}

      <FlexContainer>
        <Header>
          <EditorContainer>
            <CypherEditor
              enableMultiStatementMode={enableMultiStatementMode}
              fontLigatures={codeFontLigatures}
              history={history}
              id={'main-editor'}
              isFullscreen={isFullscreen}
              onChange={() => {
                setUnsaved(true)
              }}
              onDisplayHelpKeys={() =>
                executeCommand(':help keys', commandSources.editor)
              }
              onExecute={createRunCommandFunction(commandSources.editor)}
              ref={editorRef}
              toggleFullscreen={toggleFullscreen}
              useDb={useDb}
              sendCypherQuery={(text: string) =>
                new Promise((res, rej) =>
                  bus.self(
                    CYPHER_REQUEST,
                    {
                      query: text,
                      queryType: NEO4J_BROWSER_USER_ACTION_QUERY,
                      params: applyParamGraphTypes(params)
                    },
                    (response: { result: QueryResult; success?: boolean }) => {
                      if (response.success === true) {
                        res(response.result)
                      } else {
                        rej(response.result)
                      }
                    }
                  )
                )
              }
            />
          </EditorContainer>
          {currentlyEditing && !currentlyEditing.isStatic && (
            <StyledEditorButton
              data-testid="editor-Favorite"
              onClick={() => {
                setUnsaved(false)
                const editorValue = editorRef.current?.getValue() || ''

                const { isProjectFile, name } = currentlyEditing
                if (isProjectFile && projectId && name) {
                  addFile({
                    variables: {
                      projectId,
                      fileUpload: new File([editorValue], name),
                      overwrite: true
                    }
                  })
                } else {
                  updateFavorite(currentlyEditing.id, editorValue)
                }
                setCurrentlyEditing({
                  ...currentlyEditing,
                  content: editorValue
                })
              }}
              key={'editor-Favorite'}
            >
              {currentlyEditing.isProjectFile ? (
                <UpdateFileIcon width={16} title={'Update project file'} />
              ) : (
                <FavoriteIcon width={16} title={'Update favorite'} />
              )}
            </StyledEditorButton>
          )}
          <StyledEditorButton
            data-testid="editor-Run"
            onClick={createRunCommandFunction(commandSources.playButton)}
            key="editor-Run"
            color={base.primary}
          >
            <RunIcon
              width={16}
              title={isMac ? 'Run (⌘↩)' : 'Run (ctrl+enter)'}
            />
          </StyledEditorButton>
        </Header>
        <StyledMainEditorButtonsContainer>
          {buttons.map(({ onClick, icon, title, testId }) => (
            <FrameButton
              key={`frame-${title}`}
              title={title}
              onClick={onClick}
              dataTestId={`editor-${testId}`}
            >
              {icon}
            </FrameButton>
          ))}
        </StyledMainEditorButtonsContainer>
      </FlexContainer>
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ horizontal: 'center', vertical: 'bottom' }}
      >
        <Alert
          onClose={() => setShowSnackbar(false)}
          severity="success"
          sx={{ width: '100%' }}
        >
          Successfully created Graph!
        </Alert>
      </Snackbar>
    </MainEditorWrapper>
  )
}

const mapStateToProps = (state: GlobalState) => {
  return {
    codeFontLigatures: codeFontLigatures(state),
    enableMultiStatementMode: shouldEnableMultiStatementMode(state),
    history: getHistory(state),
    projectId: getProjectId(state),
    useDb: getUseDb(state),
    params: getParams(state),
    isConnected: state.connections.connectionState === 1
  }
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    updateFavorite: (id: string, cmd: string) => {
      dispatch(updateFavoriteContent(id, cmd))
    },
    executeCommand: (cmd: string, source: string) => {
      dispatch(executeCommand(cmd, { source }))
    }
  }
}

export default withBus(connect(mapStateToProps, mapDispatchToProps)(MainEditor))

function buildRequestJSON(requestConfiguration: RequestConfig) {
  const requestObject = {
    requestSpecs: { ...requestConfiguration },
    token: 'gTROnCD7nMeifPU'
  }

  let tempJSON = JSON.stringify(requestObject)

  // adjust to needed string Format
  tempJSON = tempJSON.replace('requestSpecs', 'request_specs')
  tempJSON = tempJSON.replace('numberOfArticles', 'n_articles')
  tempJSON = tempJSON.replace('deleteGraphPassword', 'delete_graph_password')
  tempJSON = tempJSON.replace('deleteGraph', 'delete_graph')

  return tempJSON
}
function isPipelineDisabled(
  requestConfig: RequestConfig,
  pipeline: Pipeline
): boolean | undefined {
  let disabledPipelines: Array<Pipeline> = ['ner', 'medGen', 'uniProt']
  //sorry for the terrible code here..

  if (requestConfig.pipelines.pubmed.run) {
    disabledPipelines = ['medGen', 'uniProt']
  }
  if (requestConfig.pipelines.ner.run) {
    disabledPipelines = ['pubmed', 'uniProt']
  }
  if (requestConfig.pipelines.medGen.run) {
    disabledPipelines = ['pubmed', 'ner']
  }
  if (requestConfig.pipelines.uniProt.run) {
    disabledPipelines = ['pubmed', 'ner', 'medGen']
  }

  return disabledPipelines.includes(pipeline)
}
