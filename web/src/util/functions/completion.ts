import { ManyHandler, OneHandler } from '~/types'
import { Completion, CompletionType, Group } from '~/util/db/models'
import { enhanceGroupsWithRatings } from './group'

const getOne: OneHandler<CompletionType> = async ({ id, gw2 }) => {
  return Completion.findOne({ groupId: id, accountName: gw2?.account }).lean()
}

const getMany: ManyHandler<any> = async ({ gw2 }) => {
  const playerCompletions = (await Completion.find({ accountName: gw2?.account }).lean()) as any
  const playerCompletionsMap = new Map(playerCompletions.map((c) => [c.groupId.toString(), c.items]))
  const groups = await Group.find({ _id: { $in: playerCompletions.map((c) => c.groupId) } }).lean()
  const groupsWithRatings = await enhanceGroupsWithRatings(groups as any, gw2?.account, false)
  return groupsWithRatings.map((g) => ({ ...g, completedItems: playerCompletionsMap.get(g._id.toString()) || [] }))
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
    many: getMany,
  },
  put: {
    one: putOne,
  },
}
