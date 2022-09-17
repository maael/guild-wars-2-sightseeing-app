import { OneHandler } from '~/types'
import { Completion, CompletionType } from '~/util/db/models'

const getOne: OneHandler<CompletionType> = async ({ id }) => {
  return Completion.find({ groupId: id }).sort({ updatedAt: 1 }).lean()
}

export default {
  get: {
    one: getOne,
  },
}
