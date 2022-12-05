import Config from './config'
import { transformMatches, transformMatchScore, transformScore } from '../transform'

export default function format(
  results,
  docs,
  {
    includeMatches = Config.includeMatches,
    includeMatchScore = false,
    includeScore = Config.includeScore
  } = {}
) {
  const transformers = []

  if (includeMatches) {
    transformers.push(includeMatchScore ? transformMatchScore : transformMatches)
  }
  if (includeScore) transformers.push(transformScore)

  return results.map((result) => {
    const { idx } = result

    const data = {
      item: docs[idx],
      refIndex: idx
    }

    if (transformers.length) {
      transformers.forEach((transformer) => {
        transformer(result, data)
      })
    }

    return data
  })
}
