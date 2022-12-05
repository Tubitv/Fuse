import { isDefined } from '../helpers/types'

export default function transformMatchScore(result, data) {
  const matches = result.matches
  data.matches = []

  if (!isDefined(matches)) {
    return
  }

  matches.forEach((match) => {
    if (!isDefined(match.indices) || !match.indices.length) {
      return
    }

    const { indices, value, score } = match

    let obj = {
      indices,
      value,
      score
    }

    if (match.key) {
      obj.key = match.key.src
    }

    if (match.idx > -1) {
      obj.refIndex = match.idx
    }

    data.matches.push(obj)
  })
}
