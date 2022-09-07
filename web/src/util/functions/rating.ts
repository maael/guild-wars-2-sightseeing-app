import { OneHandler } from '~/types'
import { Rating } from '~/util/db/models'

async function getMany() {
  return Rating.find()
}

const putOne: OneHandler<number> = async ({ id, body }) => {
  console.info({ body })
  await Rating.findOneAndUpdate(
    { raterAccountName: 'Test.1234', groupId: id },
    { raterAccountName: 'Test.1234', groupId: id, rating: body.rating },
    { upsert: true }
  )
  return Rating.count({ groupId: id })
}

export default {
  get: {
    many: getMany,
  },
  put: {
    one: putOne,
  },
}
