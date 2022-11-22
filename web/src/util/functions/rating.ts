import { OneHandler } from '~/types'
import { Rating } from '~/util/db/models'

async function getMany() {
  return Rating.find()
}

const putOne: OneHandler<number> = async ({ id, body, gw2 }) => {
  await Rating.findOneAndUpdate(
    { raterAccountName: gw2?.account, groupId: id },
    { raterAccountName: gw2?.account, groupId: id, rating: body.rating },
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
