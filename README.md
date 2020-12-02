
# Upload to OSS

上传单个文件或文件夹所有文件到 OSS

## Inputs

- `key-id`: OSS AccessKeyId
- `key-secret`: OSS AccessKeySecret
- `region`: 区域，如 `oss-cn-shenzhen`
- `bucket`:
- `asset-path`: 本地资源路径
- `target-path`: OSS 对象存储路径

## Outputs

- `url`: 文件在 OSS 上的 url。上传多个文件时，多个 url 用逗号隔开。

## Usage

```yaml
- name: Upload to oss
  id: upload_to_oss
  uses: tvrcgo/upload-to-oss@v0.1.1
  with:
    key-id: ${{ secrets.OSS_KEY_ID }}
    key-secret: ${{ secrets.OSS_KEY_SECRET }}
    region: oss-cn-shenzhen
    bucket: tvrcgo
    asset-path: ./
    target-path: /github-actions/pika-boilerplate/
```
