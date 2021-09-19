
const core = require('@actions/core');
const github = require('@actions/github');
const OSS = require('ali-oss');
const fs = require('fs');
const { resolve } = require('path');
const fg = require('fast-glob');

(async () => {
  try {
    const opts = {
      accessKeyId: core.getInput('key-id'),
      accessKeySecret: core.getInput('key-secret'),
      bucket: core.getInput('bucket')
    }

    ;['region', 'endpoint']
      .filter(name => core.getInput(name))
      .forEach(name => {
        Object.assign(opts, {
          [name]: core.getInput(name)
        })
      })

    const oss = new OSS(opts)

    const assetPath = core.getInput('asset-path', { required: true })
    const targetPath = core.getInput('target-path', { required: true }).replace(/\/+$/g, '')

    const files = fg.sync([].concat(assetPath), { dot: false, onlyFiles: true })

    if (files.length > 1) {
      const res = await Promise.all(
        files.map(file => {
          const filename = resolve(file).replace(resolve('.') + '/', '')
          return oss.put(`${targetPath}/${filename}`, resolve(file))
        })
      )
      core.setOutput('url', res.map(r => r.url).join(','))
    } else if(files.length === 1) {
      const res = await oss.put(targetPath, resolve(files[0]))
      core.setOutput('url', res.url)
    } else {
      core.setFailed('assets not exist.')
    }
  } catch (err) {
    core.setFailed(err.message)
  }
})()
