import { OneHandler } from '~/types'
import { Rating } from '~/util/db/models'

async function getMany() {
  return Rating.find()
}

const putOne: OneHandler<number> = async ({ id }) => {
  await Rating.create({ raterAccountName: 'Test.1234', groupId: id, rating: 2 })
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
