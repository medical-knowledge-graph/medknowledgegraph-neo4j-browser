export interface RequestConfig {
  disease: string
  numberOfArticles: number
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
