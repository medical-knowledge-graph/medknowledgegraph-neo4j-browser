export interface RequestConfig {
  disease: string
  numberOfArticles: number
  deleteGraph: boolean
  deleteGraphPassword: string
  pipelines: {
    pubmed: {
      run: boolean
      meshTerms: boolean
    }
    ner: {
      run: boolean
      entityLinks: boolean
    }
    medGen: {
      run: boolean
      Snomed: boolean
      clinicalFeatures: boolean
    }
    uniProt: {
      run: boolean
    }
  }
}
