import { NextApiHandler, NextApiRequest } from 'next'
import AWS, { S3 } from 'aws-sdk'
import { v4 as uuid } from 'uuid'
import busboy from 'busboy'
import S3Stream from 's3-upload-stream'

AWS.config.update({
  region: process.env.S3_UPLOAD_REGION,
  accessKeyId: process.env.S3_UPLOAD_KEY,
  secretAccessKey: process.env.S3_UPLOAD_SECRET,
})

const s3 = new S3({ apiVersion: '2006-03-01' })

const s3Stream = S3Stream(s3)

const EIGHT_MB = 2e6 * 4

async function uploadFile(req: NextApiRequest): Promise<{ Location: string }> {
  const groupId = req.query.groupId?.toString()
  console.info('[image:upload:start]', { groupId })
  const key = `${groupId}/${uuid()}.jpg`
  const upload = s3Stream.upload({
    Bucket: `${process.env.S3_UPLOAD_BUCKET}`,
    Key: key,
    Metadata: {
      GroupId: groupId,
    },
  })
  upload.maxPartSize(EIGHT_MB)
  return new Promise((resolve, reject) => {
    const bb = busboy({ headers: req.headers })
    let error: any
    bb.on('file', (_, file) => {
      console.info('[image:upload:file]', file)
      file.pipe(upload)
    })
    bb.on('error', (err) => {
      error = err
      console.error('[image:upload:error]', err)
      reject(err)
    })
    bb.on('end', () => {
      console.error('[image:upload:end]')
    })
    bb.on('finish', () => {
      console.error('[image:upload:finish]')
    })
    bb.on('close', () => {
      console.info('[image:upload:close]', { groupId, key, error })
      if (error) return
      resolve({
        Location: `https://${process.env.S3_UPLOAD_BUCKET}.s3.${process.env.S3_UPLOAD_REGION}.amazonaws.com/${key}`,
      })
    })
    req.pipe(bb)
  })
}

const handler: NextApiHandler = async (req, res) => {
  try {
    const result = await uploadFile(req)
    res.json(result)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export default handler

export const config = {
  api: {
    bodyParser: false,
  },
}
