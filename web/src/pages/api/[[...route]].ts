import { NextApiHandler } from 'next'
import functionsMap from '~/util/functions/modelFunctions'

const handler: NextApiHandler = async (req, res) => {
  const [type, id] = (req.query as any).route || []
  const { limit, page, offset } = req.query
  if (!req.method) return
  if (req.method === 'OPTIONS') {
    res.json({ ok: 1 })
    return
  }
  const matchedFunction = ((functionsMap[type] || {})[req.method.toLowerCase()] || {})[id ? 'one' : 'many']
  console.info({
    type,
    id,
    method: req.method.toLowerCase(),
  })
  if (!matchedFunction) {
    res.status(501).json({ error: 'Not implemented', type, method: req.method.toLowerCase(), id })
    return
  }
  try {
    const gw2 = {
      account: req.headers['x-gw2-account'],
      character: req.headers['x-gw2-character'],
    }
    console.info({ gw2 })
    const results = await matchedFunction({ id, limit, page, offset, gw2, body: JSON.parse(req.body || '{}') })
    res.json(results)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
}

export default handler
