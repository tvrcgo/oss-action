
# OSS Action

上传单个文件或文件夹所有文件到 OSS

## Inputs

- `key-id`: OSS AccessKeyId
- `key-secret`: OSS AccessKeySecret
- `region`: 区域，如 `oss-cn-shenzhen`，和 endpoint 二选一
- `endpoint`: 优先级高于 region，可填写内网节点、加速节点，和 region 二选一
- `bucket`: Bucket 名称
- `assets`: 上传的资源。每行一条规则，格式：`源路径:目标路径`
- `timeout`: 超时时间（可选），默认 600，单位：秒

## Outputs

- `url`: 文件在 OSS 上的 url。上传多个文件时，多个 url 用逗号隔开。

## Usage

```yaml
- name: Upload to oss
  id: upload_to_oss
  uses: tvrcgo/oss-action@master
  with:
    key-id: ${{ secrets.OSS_KEY_ID }}
    key-secret: ${{ secrets.OSS_KEY_SECRET }}
    region: oss-cn-shenzhen
    bucket: tvrcgo
    assets: |
      a/**:/remote-a/
      b/**:/remote-b/
      c.txt:/rc.txt
```
