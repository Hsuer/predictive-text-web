import { send, postJSON } from './request'

const dataWrapper = (data) => {
  let dataString = '?'
  for (let [k, v] of Object.entries(data)) {
    dataString += `${k}=${v}&`
  }
  return dataString
}

export function getVocabulary(data) {
  return send(`/vocabularies/${dataWrapper(data)}`)
    .then((res) => Promise.resolve(res))
    .catch((err) => Promise.reject(err))
}

export function getPhrase(data) {
  return send(`/phrases/${dataWrapper(data)}`)
    .then((res) => Promise.resolve(res))
    .catch((err) => Promise.reject(err))
}

export function updateVocabulary(data) {
  return postJSON(`/vocabularies/${data.vocabId}/`)
}

export function updatePhrase(data) {
  return postJSON(`/phrases/${data.phraseId}/`, {
    vocab_id: data.vocabId
  })
}
