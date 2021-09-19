
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
    const targetPath = core.getInput('target-path', { required: true })

    const files = fg.sync([].concat(assetPath), { dot: false, onlyFiles: true })

    if (files.length && !/\/$/.test(targetPath)) {
      // 单文件
      const res = await oss.put(targetPath, resolve(files[0]))
      core.setOutput('url', res.url)
    } else if (files.length && /\/$/.test(targetPath)) {
      // 目录
      const res = await Promise.all(
        files.map(file => {
          const filename = resolve(file).replace(resolve('.') + '/', '')
          return oss.put(`${targetPath.replace(/\/+$/g, '')}/${filename}`, resolve(file))
        })
      )
      core.setOutput('url', res.map(r => r.url).join(','))
    } else {
      core.setFailed('assets not found.')
    }
  } catch (err) {
    core.setFailed(err.message)
  }
})()
