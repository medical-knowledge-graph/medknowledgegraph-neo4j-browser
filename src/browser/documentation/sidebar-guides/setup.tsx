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

import { BuiltInGuideSidebarSlide } from '../../modules/Carousel/Slide'

const title = 'Setup Guide'
const category = 'guides'
const identifier = 'login'
const slides = [
  <BuiltInGuideSidebarSlide key="s1">
    <h3>Connect to the database</h3>
    <p className="lead">
      <em>Basic introduction to get you going</em>
    </p>
    <p>
      If the connection-panel is not already open yet, please use the command
      :server connect within the code editor. The database requires an
      authenticated connection with the following credentials:
    </p>
    <ul className="big">
      <li>
        <b>Connect URL:</b> neo4j+s://52b536dd.databases.neo4j.io:7687
      </li>
      <li>
        <b>Authentication type:</b> Username / Password
      </li>
      <li>
        <b>Username:</b> Assigned Username
      </li>
      <li>
        <b>Password:</b> Assigned Password
      </li>
    </ul>
    <p style={{ marginTop: '16px' }}>
      Click on the "Connect" button to establish a connection
    </p>
    <img src="./assets/images/login.png" className="img-responsive" />
    <br />
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s2">
    <h3>About the Knowledge Graph</h3>
    <p className="lead">
      <em>
        Our goal is to achieve a link between science and modern information
        technology in order to make experts faster and more efficient in
        researching urgent questions with suitable applications.
      </em>
    </p>
    <p>
      The following figure shows an example query to a possible simplified
      Knowledge Graph, which provides a resource for scientific searches. The
      Knowledge Graph can be searched efficiently, for instance, by linking
      public literature databases and OMICS databases and by representing the
      knowledge in a graph. In addition, a metadata repository can link this
      graph with the meta-data of a study and thus link research data with the
      knowledge structure. This offers researchers the possibility to find new
      connections and can serve as a basis for further research.
    </p>

    <br />
    <img src="./assets/images/graphStructure.png" className="img-responsive" />
    <br />
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s2">
    <h3>Overview of nodes in Knowledge Graph</h3>

    <br />
    <img src="./assets/images/nodes.png" className="img-responsive" />
    <br />
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s3">
    <h3>Make your first request</h3>
    <p className="lead">
      <em>
        After successful login, you are a ready to make your first request! You
        have three different options to configure the request. You can expand
        and collapse the panel via the icon and the right upper corner.
      </em>
    </p>
    <ol>
      <li>
        <b>Name of disease:</b> Select one from the dropdown-list or enter a
        custom one.
      </li>
      <li>
        <b>Number of articles:</b> Specify the number of articles that should be
        fetched from pubmed. Remember: The more article you fetch, the longe
        will the loading time be. Around 100 - 150 articles are a good tradeoff
        between performance and data volume.
      </li>
      <li>
        <b>Pipeline configuration:</b> Configure which parts of the request
        pipeline should run. You can skip a pipeline by unselecting the "Run"
        checkbox. This may improve performance, but will influence the results.
        You can learn more about the application architecture in the next slide.
      </li>
    </ol>

    <br />
    <img src="./assets/images/pipeline_config.png" className="img-responsive" />
    <br />
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s4">
    <h3>Architecture and Pipelines</h3>
    <p className="lead">
      <em>
        Learn more about the different parts of our pipeline and the overall
        architecture of the application.
      </em>
    </p>
    <p>
      The Manager forms the core part of the application and is responsible for
      corresponding to your request, depending on your chosen configuration.
      Thus it controls all the activities of the four different pipelines:
    </p>
    <ul>
      <li>
        <b>PubMed:</b> This pipeline gets all relevant articles
      </li>
      <li>
        <b>UniProt:</b> Allows access to resource of protein sequence and
        functional information
      </li>
      <li>
        <b>MedGen:</b> Here informations about conditions and phenotypes related
        to medical genetics can be requested.
      </li>
      <li>
        <b>NER:</b> Named Entity Recognition to extract named entities based on
        SciSpacy BC5CDR
      </li>
    </ul>
    <br />
    <img src="./assets/images/architecture.jpeg" className="img-responsive" />
    <br />
  </BuiltInGuideSidebarSlide>,
  <BuiltInGuideSidebarSlide key="s5">
    <h3>Helpful Queries</h3>
    <p className="lead">
      <em>
        We put together some helpful queries to get quickly get you started.
      </em>
    </p>
    <p>
      You can find the helpful queries at "Sample Scripts" inside the favorite
      tab, marked with the star icon. Just select one and click on the blue play
      button to execute it. Feel free to adjust the query to your needs. You
      have to be logged in to access the queries.
    </p>

    <img
      src="./assets/images/favorite_queries.png"
      className="img-responsive"
    />
    <br />
  </BuiltInGuideSidebarSlide>
]

export default { title, category, identifier, slides }
