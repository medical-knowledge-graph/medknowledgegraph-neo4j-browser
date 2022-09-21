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

export const scripts = [
  {
    folder: 'queries',
    content:
      "// Shortest path between target and source \n MATCH (source:SearchTerm {label:'phenylketonuria'}), (target:SearchTerm {label: 'epilepsy'}) CALL apoc.algo.dijkstra(source, target, 'CONTAINS', '') YIELD path RETURN *",
    versionRange: '>=3'
  },
  {
    folder: 'queries',
    content:
      '// Diseases UMLS \n MATCH (d:DISEASE {text: "phenylketonuria"})-[]-(u:UMLS) RETURN d, u',
    versionRange: '>=3'
  },
  {
    folder: 'queries',
    content:
      '// Chemicals for Gen \n MATCH (c:CHEMICAL {text: "pah"}) RETURN c',
    versionRange: '>=3'
  },
  {
    folder: 'queries',
    content:
      '// Query to get intersection nodes of two search terms You can change the target node of intersection and the search term labels as well Note that you have to change the number in front of the target node, too. For example 5->Protein, 4->Gene. According to their distance to the search Term \n MATCH (s:SearchTerm {label: "phenylketonuria"})-[*5]->(n:Protein) WITH collect(DISTINCT n) AS r1 MATCH (s:SearchTerm {label: "epilepsy"})-[*5]->(n:Protein) WITH collect(DISTINCT n) AS r2, r1 AS r1 RETURN apoc.coll.intersection(r1, r2)',
    versionRange: '>=3'
  },
  {
    folder: 'queries',
    content:
      '// Paper for Diseases \n MATCH (u:UMLS {name: "Phenylketonurias"})-[]-()-[]-(p:Paper) RETURN *',
    versionRange: '>=3'
  },
  {
    folder: 'queries_layers',
    content:
      '// Get all UMLS nodes directly related to search term \n MATCH (s:SearchTerm {label: "phenylketonuria"})-[*3]->(u:UMLS) RETURN *',
    versionRange: '>=3'
  },
  {
    folder: 'queries_layers',
    content:
      '// Get all Disease nodes directly related to search term \n MATCH (s:SearchTerm {label: "phenylketonuria"})-[*2]->(u:DISEASE) RETURN *',
    versionRange: '>=3'
  },
  {
    folder: 'queries_layers',
    content:
      '// Get all CHEMICAL nodes directly related to search term \n MATCH (s:SearchTerm {label: "phenylketonuria"})-[*2]->(u:CHEMICAL) RETURN *',
    versionRange: '>=3'
  },
  {
    folder: 'queries_layers',
    content:
      '// Get all Gene nodes directly related to search term \n MATCH (s:SearchTerm {label: "phenylketonuria"})-[*4]->(u:Gene) RETURN *',
    versionRange: '>=3'
  },
  {
    folder: 'queries_layers',
    content:
      '// Get all Protein nodes directly related to search term \n MATCH (s:SearchTerm {label: "phenylketonuria"})-[*5]->(u:Protein) RETURN *',
    versionRange: '>=3'
  },
  {
    folder: 'queries_layers',
    content:
      '// Get all SnomedConcept nodes directly related to search term \n MATCH (s:SearchTerm {label: "phenylketonuria"})-[*5]->(u:SnomedConcept) RETURN *',
    versionRange: '>=3'
  },
  {
    folder: 'queries_layers',
    content:
      '// Get all ClinicalFeature nodes directly related to search term \n MATCH (s:SearchTerm {label: "phenylketonuria"})-[*4]->(u:ClinicalFeature) RETURN *',
    versionRange: '>=3'
  },
  {
    folder: 'queries_layers',
    content:
      '// Get all GO nodes directly related to search term \n MATCH (s:SearchTerm {label: "phenylketonuria"})-[*6]->(u:GO) RETURN *',
    versionRange: '>=3'
  }
]

export const folders = [
  {
    id: 'queries',
    name: 'Helpful Queries',
    isStatic: true,
    versionRange: ''
  },
  {
    id: 'queries_layers',
    name: 'Nodes directly related to searchterm',
    isStatic: true,
    versionRange: ''
  }
]
