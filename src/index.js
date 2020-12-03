
const core = require('@actions/core');
const github = require('@actions/github');
const OSS = require('ali-oss');
const fs = require('fs');
const { resolve } = require('path');
const fg = require('fast-glob');

(async () => {
  try {
    const oss = new OSS({
      region: core.getInput('region'),
      accessKeyId: core.getInput('key-id'),
      accessKeySecret: core.getInput('key-secret'),
      bucket: core.getInput('bucket')
    })

    const assetPath = core.getInput('asset-path', { required: true }).replace(/\/+$/g, '')
    const targetPath = core.getInput('target-path', { required: true }).replace(/\/+$/g, '')

    if (fs.existsSync(assetPath)) {
      const stat = fs.lstatSync(assetPath)
      // upload file
      if (stat.isFile()) {
        const filename = assetPath.slice(assetPath.lastIndexOf('/') + 1)
        const res = await oss.put(targetPath, assetPath)
        core.setOutput('url', res.url)
      }
      // upload dir
      if (stat.isDirectory()) {
        const files = fg.sync(`${assetPath}/**`, { dot: false, onlyFiles: true })
        const res = await Promise.all(
          files.map(file => {
            const filename = file.replace(`${assetPath}/`, '')
            return oss.put(`${targetPath}/${filename}`, resolve(file))
          })
        )
        core.setOutput('url', res.map(r => r.url).join(','))
      }
    } else {
      core.setFailed('asset_path does not exist.')
    }
  } catch (err) {
    core.setFailed(err.message)
  }
})()
