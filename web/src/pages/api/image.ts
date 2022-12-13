import { NextApiHandler } from 'next'
import type { Readable } from 'node:stream'
import AWS, { S3 } from 'aws-sdk'
import { v4 as uuid } from 'uuid'

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

async function upload(bucket: string, groupId: string, buf: Buffer): Promise<S3.ManagedUpload.SendData> {
  const key = `${groupId}/${uuid()}.jpg`

  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    try {
      console.info('[upload:start]')
      s3.upload(
        {
          Bucket: bucket,
          Key: key,
          Body: buf,
          ContentType: 'image/jpeg',
          CacheControl: 'max-age=2419200, immutable',
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
    } catch (e) {
      reject(e)
    }
  })
}

const handler: NextApiHandler = async (req, res) => {
  const apiVersion = req.headers['x-api-version']
  console.info('[image:upload:headers]', {
    'x-api-version': apiVersion,
    'content-type': req.headers['content-type'],
    'content-length': req.headers['content-length'],
    'content-disposition': req.headers['content-disposition'],
    'content-encoding': req.headers['content-encoding'],
  })
  try {
    const groupId = req.query.groupId?.toString()
    console.info('[image:upload:start]', { groupId })
    const buf = await buffer(req)
    const [result, result2] = await Promise.all([
      upload('gw2-sightseeing.maael.xyz', groupId, buf),
      upload('gw2-sightseeing.mael-cdn.com', groupId, buf),
    ])
    const data = {
      groupId,
      location: `https://gw2-sightseeing.maael.xyz${getPath(result?.Location)}`,
      locationNew: `https://gw2-sightseeing.mael-cdn.com${getPath(result2?.Location)}`,
    }
    console.info('[image:upload:done]', data)
    res.json(apiVersion === '2' ? { Location: data.locationNew } : { Location: data.location })
  } catch (e) {
    console.error('[image:upload:error]', e)
    res.status(500).json({ error: e.message })
  }
}

function getPath(p?: string) {
  try {
    return `/${`${new URL(p || '').pathname}`.split('/').slice(2).join('/')}`
  } catch {
    return ''
  }
}

export default handler
