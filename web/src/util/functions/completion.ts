import { OneHandler } from '~/types'
import { Completion, CompletionType } from '~/util/db/models'

const getOne: OneHandler<CompletionType> = async ({ id }) => {
  return Completion.findById(id)
}

async function getMany() {
  return Completion.find()
}

export default {
  get: {
    one: getOne,
    many: getMany,
  },
}
