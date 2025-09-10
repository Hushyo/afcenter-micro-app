import ajax from '@/utils/ajaxUtils'

function getKnowledgeBaseList(params) {
  return ajax({
    method: 'get',
    url: '/application/1/12',
    params: params
  })
}

function getListDataSet(application_id) {
  return ajax({
    method: 'get',
    url: `/application/${application_id}/list_dataset`,
  })
}

function createApiKey(application_id) {
  return ajax({
    method: 'post',
    url: `/application/${application_id}/api_key`
  })
}

function getApiKey(application_id) {
  return ajax({
    method: 'get',
    url: `/application/${application_id}/api_key`
  })
}

function updateApiKey(application_id, api_key_id, data) {
  return ajax({
    method: 'put',
    url: `/application/${application_id}/api_key/${api_key_id}`,
    data: data
  })
}

function deleteApiKey(application_id, api_key_id) {
  return ajax({
    method: 'delete',
    url: `/application/${application_id}/api_key/${api_key_id}`
  })
}

function getAccessToken(knowledgeBase_id) {
  return ajax({
    method: 'get',
    url: `/application/${knowledgeBase_id}/access_token`
  })
}

function putAccessToken(knowledgeBase_id, data) {
  return ajax({
    method: 'put',
    url: `/application/${knowledgeBase_id}/access_token`,
    data: data
  })
}

function getProvider() {
  return ajax({
    method: 'get',
    url: '/provider'
  })
}

function getModel(application_id) {
  return ajax({
    method: 'get',
    url: `/application/${application_id}/model`
  })
}

export default {
  getKnowledgeBaseList,
  getListDataSet,
  createApiKey,
  getApiKey,
  updateApiKey,
  deleteApiKey,
  getAccessToken,
  putAccessToken,
  getProvider,
  getModel
}
