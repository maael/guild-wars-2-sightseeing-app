import { NextApiHandler } from 'next'
import type { Readable } from 'node:stream'
import AWS, { S3 } from 'aws-sdk'
import { v4 as uuid } from 'uuid'
import busboy from 'busboy'
import stream from 'stream'

export const config = {
  api: {
    bodyParser: false,
  },
}

AWS.config.update({
  region: process.env.S3_UPLOAD_REGION,
  accessKeyId: process.env.S3_UPLOAD_KEY,
  secretAccessKey: process.env.S3_UPLOAD_SECRET,
})

const s3 = new S3({ apiVersion: '2006-03-01' })

async function buffer(readable: Readable) {
  const chunks: any[] = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

function getBufferStream(buf: Buffer) {
  const bufferStream = new stream.PassThrough()
  bufferStream.end(buf)
  return bufferStream
}

async function getUploadPipe(
  headers: any,
  buf: Buffer
): Promise<{ name: string; file: File; info: { filename: string; encoding: string; mimeType: string } }> {
  return new Promise((resolve, reject) => {
    const bufStream = getBufferStream(buf)

    let processedFile: any

    const bb = busboy({
      headers,
    })

    bb.on('file', (name, file, info) => {
      console.info('[image:upload:file]', name)
      processedFile = { name, file, info }
      bb.end()
      resolve(processedFile)
    })

    bb.on('error', (err) => {
      console.info('[image:upload:err]', err)
      reject(err)
    })

    bb.on('finish', () => {
      console.info('[image:upload:finish]')
    })

    bb.on('close', () => {
      console.info('[image:upload:close]')
      resolve(processedFile)
    })

    bufStream.pipe(bb)
  })
}

async function upload(headers: any, groupId: string, buf: Buffer): Promise<S3.ManagedUpload.SendData> {
  const key = `${groupId}/${uuid()}.jpg`

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    console.info('[upload:start]')
    const { file, info } = await getUploadPipe(headers, buf)
    s3.upload(
      {
        Bucket: `${process.env.S3_UPLOAD_BUCKET}`,
        Key: key,
        Body: file,
        ContentType: info.mimeType,
        Metadata: {
          GroupId: groupId,
        },
      },
      (err, data) => {
        if (err) {
          return reject(err)
        }
        console.info('[upload:resolve]')
        resolve(data)
      }
    )
  })
}

const handler: NextApiHandler = async (req, res) => {
  console.info('[image:upload:headers]', req.headers)
  try {
    const groupId = req.query.groupId?.toString()
    console.info('[image:upload:start]', { groupId })
    const buf = await buffer(req)
    const result = await upload(req.headers, groupId, buf)
    console.info('[image:upload:done]', { groupId, location: result?.Location })
    res.json(result)
  } catch (e) {
    console.error('[image:upload:error]', e)
    res.status(500).json({ error: e.message })
  }
}

export default handler
