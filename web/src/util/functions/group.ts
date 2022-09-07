import mongoose from 'mongoose'
import { Group, GroupType, Item, Rating } from '~/util/db/models'
import { OneHandler, ManyHandler } from '~/types'

async function getPageRatings(ids: mongoose.Types.ObjectId[]) {
  const pageRatings = (
    await Rating.aggregate([
      { $match: { groupId: { $in: ids } } },
      { $group: { _id: '$groupId', avgRating: { $avg: '$rating' }, count: { $sum: 1 }, user: { $first: '$rating' } } },
    ])
  ).reduce((acc, i) => {
    acc.set(i._id.toString(), { avg: i.avgRating, count: i.count, user: i.user })
    return acc
  }, new Map<string, number>())
  return pageRatings
}

const getOne: OneHandler<GroupType> = async ({ id }) => {
  const [item, pageRatings] = await Promise.all([
    Group.findById(id).lean().populate('items'),
    getPageRatings([new mongoose.Types.ObjectId(id)]),
  ])
  if (!item) return item
  const info = pageRatings.get(id) || { avg: 0, count: 0 }
  ;(item as any).rating = info
  return item as unknown as GroupType
}

const getMany: ManyHandler<GroupType> = async ({ limit = 100, offset = 0, page = 1 }) => {
  const results = await Group.paginate(
    {},
    { limit, offset, page, populate: 'items', lean: true, leanWithId: true, sort: { createdAt: -1 } }
  )

  const pageRatings = await getPageRatings(results.docs.map((d) => d._id))

  results.docs = results.docs.map((d: any) => {
    const info = pageRatings.get(d._id.toString()) || { avg: 0, count: 0 }
    d.rating = info
    return d
  })

  return results as any
}

const postMany: OneHandler<GroupType> = async ({ body }) => {
  const input = {
    name: body.name,
    description: body.description,
    bannerImageUrl: body.bannerImageUrl || 'http://image',
    creator: {
      accountName: 'Test.1234',
      characterName: 'Test Character',
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
