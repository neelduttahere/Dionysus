import axios from 'axios'

export function createTitilerClient(baseUrl: string) {
  return axios.create({
    baseURL: baseUrl.replace(/\/$/, ''),
    timeout: 15_000,
  })
}
