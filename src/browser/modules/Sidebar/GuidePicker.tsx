import React from 'react'

import { BinIcon } from 'browser-components/icons/LegacyIcons'

import {
  DrawerBrowserCommand,
  DrawerSubHeader
} from 'browser-components/drawer/drawer-styled'
import docs, { BuiltInGuideIdentifier, Guide } from 'browser/documentation'
import {
  Clickable,
  GuideListEntry,
  MarginBottomLi,
  MarginTop,
  NoBulletsUl
} from 'browser/documentation/sidebar-guides/styled'
import { BuiltInGuideSidebarSlide } from 'browser/modules/Carousel/Slide'
import { RemoteGuide } from 'shared/modules/guides/guidesDuck'

type GuidePickerProps = {
  remoteGuides: RemoteGuide[]
  setCurrentGuide: (guide: Guide) => void
  fetchRemoteGuide: (identifier: string) => void
  updateRemoteGuides: (newList: RemoteGuide[]) => void
}

const builtInGuides: {
  identifier: BuiltInGuideIdentifier
  description: string
}[] = [
  {
    identifier: 'setup',
    description:
      'How to login and make your first steps to creating a medical knowledge graph.'
  },
  { identifier: 'intro', description: 'Navigating Neo4j Browser' },
  { identifier: 'concepts', description: 'Property graph model concepts' },
  {
    identifier: 'cypher',
    description: 'Cypher basics - create, match, delete'
  }
]

const GuidePicker = ({
  remoteGuides,
  setCurrentGuide,
  fetchRemoteGuide,
  updateRemoteGuides
}: GuidePickerProps): JSX.Element => (
  <BuiltInGuideSidebarSlide>
    You can also access Browser guides by running
    <DrawerBrowserCommand data-populate=":guide [guide name]">
      :guide [guide name]
    </DrawerBrowserCommand>
    in the code editor.
    <MarginTop pixels={25}>
      <DrawerSubHeader as="div" /* prevents guide styling of h5*/>
        Built-in guides
      </DrawerSubHeader>
    </MarginTop>
    <NoBulletsUl>
      {builtInGuides.map(({ identifier, description }) => (
        <MarginBottomLi
          data-testid={`builtInGuide${identifier}`}
          key={identifier}
          onClick={() =>
            setCurrentGuide({
              ...docs.guide.chapters[identifier],
              identifier,
              currentSlide: 0
            })
          }
        >
          <DrawerBrowserCommand>:guide {identifier}</DrawerBrowserCommand>
          <MarginTop> {description} </MarginTop>
        </MarginBottomLi>
      ))}
    </NoBulletsUl>
    {remoteGuides.length !== 0 && (
      <>
        <MarginTop pixels={25}>
          <DrawerSubHeader
            as="div" /* prevents guide styling of h5*/
            data-testid="remoteGuidesTitle"
          >
            Remote Guides
          </DrawerSubHeader>
        </MarginTop>
        <NoBulletsUl>
          {remoteGuides.map(guide => (
            <GuideListEntry key={guide.identifier}>
              <DrawerBrowserCommand
                data-testid={`remoteGuide${guide.identifier}`}
                onClick={() => fetchRemoteGuide(guide.identifier)}
              >
                {guide.title}
              </DrawerBrowserCommand>
              <Clickable
                data-testid={`removeGuide${guide.identifier}`}
                onClick={() => {
                  updateRemoteGuides(
                    remoteGuides.filter(
                      ({ identifier }) => identifier !== guide.identifier
                    )
                  )
                }}
              >
                <BinIcon />
              </Clickable>
            </GuideListEntry>
          ))}
        </NoBulletsUl>
      </>
    )}
  </BuiltInGuideSidebarSlide>
)

export default GuidePicker
