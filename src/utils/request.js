import { serviceUrl } from './config'

const DEFAULT_OPTIONS = {
  method: 'GET'
}

export function send(url, options) {
  const fetchUrl = serviceUrl + url
  const fetchOptions = Object.assign({}, DEFAULT_OPTIONS, options)

  return fetch(fetchUrl, fetchOptions)
    .then(response => response.json())
    .then(res => Promise.resolve(res))
    .catch(err => Promise.reject(err))
}

export function postJSON(url, data, method = 'PUT') {
  const fetchUrl = serviceUrl + url
  const options = {
    method,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    }
  }
  const fetchOptions = Object.assign({}, DEFAULT_OPTIONS, options)
  return fetch(fetchUrl, fetchOptions)
    .then(response => response.json())
    .then(res => Promise.resolve(res))
    .catch(err => Promise.reject(err))
}