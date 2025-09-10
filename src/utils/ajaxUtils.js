import axios from 'axios'

const BASE_URL = '/knowledgeBase/api'
const LOGIN_CREDENTIAL = {
  username: 'admin',
  password: 'Py+*202402'
}

let authToken = ''
let isLogining = false
let pendingRequests = []

const ajax = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': authToken,
    'Content-Type': 'application/json'
  }
})

ajax.interceptors.response.use(
  res => { return res.data.data },
  error => { return Promise.reject(error) }
)

ajax.interceptors.request.use(async(config) => {
  if (authToken === '') {
    return handleUnAuthorizedRequest(config)
  }
  return config
}, (error) => {
  return Promise.reject(error)
})

async function handleUnAuthorizedRequest(config) {

  if (isLogining) {
    return new Promise((resolve, reject) => {
      pendingRequests.push({
        resolve: () => {
          config.headers.Authorization = authToken
          resolve(config)
        },
        reject: (error) => {
          reject(error)
        }
      })
    })
  }

  await autoLogin()
  config.headers.Authorization = authToken
  return config
}

async function autoLogin() {
  if (isLogining) {
    await waitForLoginCompletion()
    return
  }
  isLogining = true
  try {
    const token = await login()

    if (!token) {
      throw new Error('响应中没有token')
    }

    setAuthToken(token)
    pendingRequests.forEach(request => request.resolve())
    pendingRequests = []
  } catch (error) {
    pendingRequests.forEach(request => request.reject(error))
    pendingRequests = []
    throw error
  } finally {
    isLogining = false
  }
}

async function waitForLoginCompletion() {
  return new Promise(resolve => {
    const checkLoginStatus = () => {
      if (isLogining) {
        setTimeout(checkLoginStatus, 200)
      } else {
        resolve()
      }
    }
    checkLoginStatus()
  })
}

function login() {
  return axios({
    method: 'post',
    url: `${BASE_URL}/user/login`,
    data: LOGIN_CREDENTIAL
  }).then(res => res.data.data)
}

function setAuthToken(token) {
  authToken = token
  ajax.defaults.headers.Authorization = token
}

export default ajax
