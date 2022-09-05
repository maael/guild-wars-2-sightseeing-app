import { Group, GroupType, Item, Rating } from '~/util/db/models'
import { OneHandler, ManyHandler } from '~/types'

const getOne: OneHandler<GroupType> = async ({ id }) => {
  return Group.findById(id).populate('items')
}

const getMany: ManyHandler<GroupType> = async ({ limit = 100, offset = 0, page = 1 }) => {
  const results = await Group.paginate({}, { limit, offset, page, populate: 'items', lean: true, leanWithId: true })

  const pageRatings = (
    await Rating.aggregate([
      { $match: { groupId: { $in: results.docs.map((d) => d._id) } } },
      { $group: { _id: '$groupId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ])
  ).reduce((acc, i) => {
    acc.set(i._id.toString(), { avg: i.avgRating, count: i.count })
    return acc
  }, new Map<string, number>())

  console.info('what', results.docs.length)

  results.docs = results.docs.map((d: any) => {
    const info = pageRatings.get(d._id.toString()) || { avg: 0, count: 0 }
    d.rating = info
    return d
  })

  return results as any
}

async function postMany() {
  const input = {
    name: 'Test Group',
    description: 'This is a test',
    bannerimageUrl: 'test',
    creator: {
      accountName: 'Test.1234',
      characterName: 'Test Character',
    },
    difficulty: 3,
    expansions: [],
    masteries: [],
    items: [
      {
        name: 'Test Item',
        description: 'Test Description',
        imageUrl: 'http://test',
        precision: 3,
      },
    ],
  }
  const createditems = await Promise.all(
    input.items.map(async (d) => {
      const item = await Item.create(d)
      return item._id
    })
  )
  input.items = createditems
  return Group.create(input).then((i) => i.populate('items'))
}

async function putOne() {
  return ''
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
    putOne,
  },
  delete: {
    deleteOne,
  },
}
