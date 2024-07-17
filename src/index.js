
const core = require('@actions/core');
const github = require('@actions/github');
const OSS = require('ali-oss');
const fs = require('fs');
const { resolve } = require('path');
const fg = require('fast-glob');

(async () => {
  try {
    // OSS 实例化
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

    // 上传资源
    const assets = core.getInput('assets', { required: true })

    assets.split('\n').forEach(async rule => {
      const [src, dst] = rule.split(':')

      const files = fg.sync([src], { dot: false, onlyFiles: true })

      if (files.length && !/\/$/.test(dst)) {
        // 单文件
        const res = await oss.put(dst, resolve(files[0]))
        core.setOutput('url', res.url)
      } else if (files.length && /\/$/.test(dst)) {
        // 目录
        const timeout = core.getInput('timeout')
        const res = await Promise.all(
          files.map(async file => {
            const base = src.replace(/\*+$/g, '')
            const filename = file.replace(base, '')
            return oss.put(`${dst}${filename}`, resolve(file), {
              timeout: 1000 * Number(timeout)
            }).catch(err => {
              core.setFailed(err && err.message)
            })
          })
        )
        core.setOutput('url', res.map(r => r.url).join(','))
      }
    })

  } catch (err) {
    core.setFailed(err.message)
  }
})()
