import { NextApiHandler } from 'next'
import functionsMap from '~/util/functions/modelFunctions'

const handler: NextApiHandler = async (req, res) => {
  const [type, id] = (req.query as any).route || []
  const { limit, page, offset } = req.query
  console.info({ type, id, q: req.query })
  if (!req.method) return
  const matchedFunction = ((functionsMap[type] || {})[req.method.toLowerCase()] || {})[id ? 'one' : 'many']
  if (!matchedFunction) {
    res.status(401).json({ error: 'Not implemented', type, method: req.method.toLowerCase(), id })
    return
  }
  const results = await matchedFunction({ id, limit, page, offset })
  res.json(results)
}

export default handler
