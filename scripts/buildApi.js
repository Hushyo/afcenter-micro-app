/**
 * Created by binwang on 18/1/26.
 * 通过解析 swagger.json 自动生成 action 文件
 */

var Config = require("./config.js")

var fs = require("fs")
var http = require("http")

var Path = require("path")
var _ = require("lodash")
const Handlebars = require("handlebars")

const controllers = []

function resolve(dir) {
  return Path.join(__dirname, ".." + dir)
}

function mapAction(moduleName, apiPrefix = false, swagger, controllerFilter) {
  swagger.tags = swagger.tags.filter((tag) => {
    tag.description = tag.description.replace(/ /gi, "")
    return true // /^[A-Za-z\-]+$/.test(tag.name)
  })
  const action_tpl = Handlebars.compile(
    fs.readFileSync(resolve("/scripts/tpl/action.tpl"), "utf-8")
  )
  if (!fs.existsSync(resolve(`/src/actions/${moduleName}`))) {
    fs.mkdirSync(resolve(`/src/actions/${moduleName}`))
  }

  _.forEach(swagger.tags, (tag) => {
    let list = []
    let dir = ""
    let path = ""
    let tags = ""
    let model = []
    const unionMap = new Map()
    _.forEach(swagger.paths, (value, key) => {
      const url = key.replace(/\{/gi, "${payload.")
      _.forEach(value, function (v1, k1) {
        if (_.includes(v1.tags, tag.name)) {
          let action = v1.operationId
            .split("_")[0]
            .replace(/Using(POST|GET|DELETE|PUT|)/gi, "")
          if (action.indexOf(".") > 0) {
            action = action.substring(action.lastIndexOf(".") + 1)
          }
          // const action = v1.operationId.replace(/\.([A-Za-z0-9])/gi, (s0, s1) => { return s1.toUpperCase() }).split('_')[0].replace(/Using(POST|GET|DELETE|PUT|)/gi, '')
          let parameters = JSON.stringify(v1.parameters)
          if (!parameters || parameters === "") {
            parameters = "[]"
          }
          const summary = v1.summary
          const method = k1
          model = tag.description
          if (model.lastIndexOf("Controller") === -1) {
            model =
              model.slice(0, 1).toUpperCase() +
              model.slice(1).toLowerCase() +
              "Controller"
          }
          console.log(model, action)
          dir = resolve(`/src/actions/${moduleName}/`)
          tags = v1.tags
          path = resolve(`/src/actions/${moduleName}/${model}.js`)

          if (unionMap.has(action)) {
            unionMap.set(action, unionMap.get(action))
          } else {
            unionMap.set(action, 0)
          }

          const finalAction =
            unionMap.get(action) === 0
              ? action
              : `${action}_${unionMap.get(action)}`
          let finalApiPrefix = false
          if (apiPrefix === true || apiPrefix === false) {
            finalApiPrefix = apiPrefix
          } else if (typeof apiPrefix === "string") {
            finalApiPrefix = `"${apiPrefix}"`
          } else if (typeof apiPrefix === "function") {
            finalApiPrefix = apiPrefix(finalAction) || false
          }

          list.push({
            action: finalAction,
            parameters,
            summary,
            method,
            tags,
            tagName: model,
            model,
            apiPrefix: finalApiPrefix,
            url,
            path,
          })
        }
      })
    })
    list = _.sortBy(list, (l) => l.action)
    if (list && list.length > 0) {
      if (!controllerFilter || controllerFilter(model)) {
        controllers.push({
          tags: tags,
          name: model,
          list: list,
          path: moduleName,
        })
        let action_result = action_tpl({
          list,
          tags,
          model,
        })
        action_result = action_result.replace(/&quot;/gi, "'")
        fs.mkdir(dir, (error) => {
          fs.writeFileSync(path, action_result)
        })
      }
    }
  })
  // create index.js
}
function createIndex() {
  const index_tpl = Handlebars.compile(
    fs.readFileSync(resolve("/scripts/tpl/index.tpl"), "utf-8")
  )
  const index_result = index_tpl({
    list: controllers.map((c) => {
      return {
        name: c.name,
        path: `${c.path}`,
      }
    }),
  })
  fs.writeFileSync(resolve(`/src/actions/index.js`), index_result)
}
function createController() {
  const controller_tpl = Handlebars.compile(
    fs.readFileSync(resolve("/scripts/tpl/controller.tpl"), "utf-8")
  )
  const result = controller_tpl({
    controllers,
  })
  console.log(`创建action 成功, 共:${controllers.length}个`)
  fs.writeFileSync(resolve(`/src/actions/controller.js`), result)
}

function execute(url) {
  return new Promise(function (resolve, reject) {
    var json = ""
    http.get(url, function (res) {
      res.setEncoding("utf-8")
      res
        .on("data", function (data) {
          json += data
        })
        .on("end", function () {
          resolve(JSON.parse(json))
        })
    })
  })
}
;(function () {
  // 直接读取 在线 swagger
  const all = []
  Config.modules.forEach(
    ({ name, swaggerUrl, apiPrefix, controllerFilter }) => {
      execute(swaggerUrl)
        .then((data) => {
          console.log(`read ${name} : ${swaggerUrl} ...`)
          mapAction(name, apiPrefix, data, controllerFilter)
        })
        .then(() => {
          console.log("create controller")
          createController()
          createIndex()
        })
    }
  )
})()
