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
import React from 'react'

import FrameBodyTemplate from '../Frame/FrameBodyTemplate'
import AutoExecButton from './auto-exec-button'
import { errorMessageFormater } from './errorMessageFormater'
import {
  StyledCypherErrorMessage,
  StyledDiv,
  StyledErrorH4,
  StyledHelpContent,
  StyledHelpDescription,
  StyledHelpFrame,
  StyledPreformattedArea
} from './styled'
import { UnknownCommandError, createErrorObject } from 'services/exceptions'

export const ErrorView = ({ frame }: any) => {
  if (!frame) return null
  const error = frame.error || false
  let errorContents = error.message || 'No error message found'
  const errorCode: string = error.type || error.code || 'UndefinedError'
  if (
    !error.message &&
    errorCode &&
    typeof createErrorObject(errorCode as any, error) !== 'undefined'
  ) {
    const eObj = createErrorObject(errorCode as any, error)
    errorContents = eObj.message
  }
  const fullError = errorMessageFormater(null, errorContents)
  return (
    <StyledHelpFrame>
      <StyledHelpContent>
        <StyledHelpDescription>
          <StyledCypherErrorMessage>ERROR</StyledCypherErrorMessage>
          <StyledErrorH4>{errorCode}</StyledErrorH4>
        </StyledHelpDescription>
        <StyledDiv>
          <StyledPreformattedArea>{fullError.message}</StyledPreformattedArea>
        </StyledDiv>
      </StyledHelpContent>
      {frame.showHelpForCmd ? (
        <>
          Use <AutoExecButton cmd={`help ${frame.showHelpForCmd}`} /> for more
          information.
        </>
      ) : null}
      {errorCode === UnknownCommandError.name ? (
        <>
          Use <AutoExecButton cmd="help commands" /> to list available commands.
        </>
      ) : null}
    </StyledHelpFrame>
  )
}

const ErrorFrame = ({ frame, isFullscreen, isCollapsed }: any) => {
  return (
    <FrameBodyTemplate
      isCollapsed={isCollapsed}
      isFullscreen={isFullscreen}
      contents={<ErrorView frame={frame} />}
    />
  )
}
export default ErrorFrame
