import { NextApiHandler, NextApiRequest } from 'next'
import AWS, { S3 } from 'aws-sdk'
import { v4 as uuid } from 'uuid'
import multer from 'multer'

AWS.config.update({
  region: process.env.S3_UPLOAD_REGION,
  accessKeyId: process.env.S3_UPLOAD_KEY,
  secretAccessKey: process.env.S3_UPLOAD_SECRET,
})

const s3 = new S3({ apiVersion: '2006-03-01' })

const FOUR_MB = 2e6 * 2
const uploadMiddleware = multer({
  dest: 'uploads/',
  storage: multer.memoryStorage(),
  limits: {
    fields: 4,
    files: 1,
    fileSize: FOUR_MB,
    fieldNameSize: 10,
  },
})

async function getFile(req: NextApiRequest): Promise<{ buffer: Buffer; mimetype?: string }> {
  return new Promise((resolve, reject) => {
    uploadMiddleware.single('image')(req, {}, async (err) => {
      console.info(req.body)
      if (err) {
        reject(err)
        return
      }
      resolve((req as any).file)
    })
  })
}

const handler: NextApiHandler = async (req, res) => {
  const groupId = req.query.groupId!.toString()
  const file = await getFile(req)
  if (!file) {
    res.status(400).json({ error: 'File required' })
    return
  }
  const uploadParams: S3.PutObjectRequest = {
    Bucket: `${process.env.S3_UPLOAD_BUCKET}`,
    Key: `${groupId}/${uuid()}.jpg`,
    Body: file.buffer,
    ContentType: file.mimetype || 'image/jpg',
    Metadata: {
      GroupId: groupId,
    },
  }
  try {
    const result = await s3.upload(uploadParams).promise()
    console.info(result)
    res.json(result)
  } catch (e) {
    console.error(e)
    res.json({ error: e.message })
  }
}

export default handler

export const config = {
  api: {
    bodyParser: false,
  },
}
