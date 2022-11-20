import { OneHandler } from '~/types'
import { Completion, CompletionType } from '~/util/db/models'

const getOne: OneHandler<CompletionType> = async ({ id, gw2 }) => {
  return Completion.findOne({ groupId: id, accountName: gw2?.account }).lean()
}

const putOne: OneHandler<CompletionType, string[]> = async ({ id, body, gw2 }) => {
  return Completion.updateOne(
    { groupId: id, accountName: gw2?.account },
    { groupId: id, accountName: gw2?.account, items: body },
    { upsert: true }
  ).lean()
}

export default {
  get: {
    one: getOne,
  },
  put: {
    one: putOne,
  },
}
