import glob from 'glob'
import express, { Router } from 'express'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const _dirname = dirname(__filename)

// Function to serach through all files in api folder and create a Router for them
// Then combine all routers into one master
const createMyRouter = async (): Promise<Router> => {
  const myRouter = express.Router({ mergeParams: true })
  const paths = glob.sync('**/*.js', { cwd: `${_dirname}/` })

  var files = []
  for (var path of paths) {
    if (path != 'createRouter.js') {
      const file: any = await import(`./${path}`).catch((err) =>
        console.error(err),
      )
      if (file != undefined) {
        files.push(file.default)
      }
    }
  }

  var routers = []
  for (var file of files) {
    if (file !== undefined)
      if (Object.getPrototypeOf(file) == Router) {
        routers.push(file)
      }
  }

  for (var router of routers) {
    myRouter.use(router)
  }

  return myRouter
}

export default createMyRouter
