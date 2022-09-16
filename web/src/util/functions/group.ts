import mongoose from 'mongoose'
import { Completion, Group, GroupType, Item, Rating } from '~/util/db/models'
import { OneHandler, ManyHandler, GroupDocument } from '~/types'

async function getPageRatings(ids: mongoose.Types.ObjectId[], gw2Account?: string) {
  const [basicPageRatings, userPageRating] = await Promise.all([
    Rating.aggregate([
      { $match: { groupId: { $in: ids } } },
      { $group: { _id: '$groupId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]),
    Rating.find({ groupId: { $in: ids }, raterAccountName: gw2Account }),
  ])
  const userRatingMap = new Map(userPageRating.map((r: any) => [r.groupId.toString(), r.rating]))
  const pageRatings = basicPageRatings.reduce((acc, i) => {
    acc.set(i._id.toString(), { avg: i.avgRating, count: i.count, user: userRatingMap.get(i._id.toString()) })
    return acc
  }, new Map<string, number>())
  return pageRatings
}

async function getCompletions(ids: mongoose.Types.ObjectId[], gw2Account?: string) {
  return new Map(
    (await Completion.find({ groupId: { $in: ids }, accountName: gw2Account }).lean()).map((c: any) => [
      c.groupId.toString(),
      c.items,
    ])
  )
}

export async function enhanceGroupsWithRatings(groups: GroupDocument[], gw2Account?: string, withCompletions = true) {
  const [pageRatings, completions] = await Promise.all([
    getPageRatings(
      groups.map((d) => d._id),
      gw2Account
    ),
    withCompletions
      ? getCompletions(
          groups.map((d) => d._id),
          gw2Account
        )
      : new Map(),
  ])

  return groups.map((d: any) => {
    const info = pageRatings.get(d._id.toString()) || { avg: 0, count: 0 }
    d.rating = info
    d.completedItems = completions.get(d._id.toString()) || []
    return d
  })
}

const getOne: OneHandler<GroupType> = async ({ id, gw2 }) => {
  const [item, pageRatings] = await Promise.all([
    Group.findById(id).lean().populate('items'),
    getPageRatings([new mongoose.Types.ObjectId(id)], gw2?.account),
  ])
  if (!item) return item
  const info = pageRatings.get(id) || { avg: 0, count: 0 }
  ;(item as any).rating = info
  return item as unknown as GroupType
}

const getMany: ManyHandler<GroupType> = async ({ limit = 100, offset = 0, page = 1, gw2 }) => {
  const results = await Group.paginate(
    {},
    { limit, offset, page, populate: 'items', lean: true, leanWithId: true, sort: { createdAt: -1 } }
  )

  results.docs = await enhanceGroupsWithRatings(results.docs as any, gw2?.account)

  return results as any
}

const postMany: OneHandler<GroupType> = async ({ body, gw2 }) => {
  const input = {
    name: body.name,
    description: body.description,
    bannerImageUrl: body.bannerImageUrl || 'http://image',
    creator: {
      accountName: gw2?.account,
      characterName: gw2?.character,
    },
    difficulty: body.difficulty || 3,
    expansions: body.expansions || [],
    masteries: body.masteries || [],
    items: [
      {
        name: 'Test Item',
        description: 'Test Description',
        imageUrl: 'http://test',
        precision: 3,
      },
    ],
  }
  console.info('what', body.items)
  const createditems = await Promise.all(
    input.items.map(async (d) => {
      const item = await Item.create(d)
      return item._id
    })
  )
  input.items = createditems
  return Group.create(input).then((i) => i.populate('items'))
}

const putOne: OneHandler<GroupType> = async ({ id, body }) => {
  const input = {
    name: body.name,
    description: body.description,
    bannerImageUrl: body.bannerImageUrl,
    creator: {
      accountName: body.creator.accountName,
      characterName: body.creator.characterName,
    },
    difficulty: body.difficulty,
    expansions: body.expansions,
    masteries: body.masteries,
    items: body.items || [],
  }
  const createdItems = await Promise.all(
    input.items.map(async (d) => {
      const item = new Item({ ...d, description: d.description || 'Test description', precision: d.precision || 100 })
      item.isNew = !d._id
      console.info('result', item.isNew, d, item)
      const result = await item.save()
      return result._id
    })
  )
  input.items = createdItems
  const item = await Group.findByIdAndUpdate(id, input).lean().populate('items')
  return item as unknown as GroupType
}

const deleteOne: OneHandler<{ deleted: boolean }> = async ({ id }) => {
  await Group.updateOne({ id }, { $set: { isActive: false } })
  return { deleted: true }
}

export default {
  get: {
    one: getOne,
    many: getMany,
  },
  post: {
    many: postMany,
  },
  put: {
    one: putOne,
  },
  delete: {
    one: deleteOne,
  },
}
