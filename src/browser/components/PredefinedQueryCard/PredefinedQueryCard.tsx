import { default as React, Dispatch } from 'react'
import { connect } from 'react-redux'
import { withBus } from 'react-suber'
import { Action } from 'redux'
import {
  commandSources,
  executeCommand
} from 'shared/modules/commands/commandsDuck'
import styled from 'styled-components'

type Props = {
  readonly title: string
  readonly description: string
  readonly cypher: string
  readonly executeCommand: (cmd: string, source: string) => void
}

const StyledButton = styled.button`
  padding: 1em;
  background-color: #008cc1;
  color: #fff;
  border-radius: 4px;
  border: 0;
  display: inline-block;
`

const StyledCard = styled.div`
  margin: 0.5em;
  padding: 10px;
  border: 0;
  border-radius: 4px;
  height: 270px;
  float: left;
  width: 100%;
  position: relative;
  box-shadow: 0px 0px 2px rgba(52, 58, 67, 0.1),
    0px 1px 2px rgba(52, 58, 67, 0.08), 0px 1px 4px rgba(52, 58, 67, 0.08);
`

const PredefinedQueryCard = ({
  title,
  description,
  cypher,
  executeCommand
}: Props): JSX.Element => {
  const runCypher = () => executeCommand(cypher, commandSources.favorite)

  return (
    <StyledCard>
      <h4>{title}</h4>
      <p className="lead">{description}</p>
      <div className="icon-holder">
        <div className="clearfix" />
      </div>
      <StyledButton onClick={runCypher}>Run Query</StyledButton>
    </StyledCard>
  )
}

const mapDispatchToProps = (dispatch: Dispatch<Action>) => {
  return {
    executeCommand: (cmd: string, source: string) => {
      dispatch(executeCommand(cmd, { source }))
    }
  }
}

export default withBus(connect(null, mapDispatchToProps)(PredefinedQueryCard))
