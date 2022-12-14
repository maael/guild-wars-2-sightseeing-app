import mongoose from 'mongoose'
import { OneHandler } from '~/types'
import { Completion, CompletionType, Group } from '~/util/db/models'

const getOne: OneHandler<CompletionType[]> = async ({ id }) => {
  const groupItems = await Group.findOne({ _id: id })
    .lean()
    .then((g) => (g as any)?.items?.length)
  return Completion.aggregate<CompletionType>([
    { $match: { groupId: new mongoose.Types.ObjectId(id) } },
    { $set: { totalItems: groupItems, completedItems: { $size: '$items' } } },
    { $sort: { completedItems: -1, updatedAt: 1 } },
    { $limit: 1000 },
  ])
}

export default {
  get: {
    one: getOne,
  },
}
