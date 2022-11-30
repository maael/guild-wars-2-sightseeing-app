import mongoose from 'mongoose'
import { Group, Item } from '~/util/db/models'
import { OneHandler, HomeGroupWithItems, HomeGroup } from '~/types'
import { getGroups } from './db/group'

const getOne: OneHandler<HomeGroupWithItems> = async ({ id, gw2 }) => {
  const group = await getGroups({
    query: { _id: new mongoose.Types.ObjectId(id), status: 'active' },
    accountName: gw2?.account || 'Mael.3259',
    limit: 1,
    withItems: true,
    select: { prizes: 1, prizeNote: 1 },
  })
  return group[0]
}

const postMany: OneHandler<HomeGroup> = async ({ body, gw2 }) => {
  const input = {
    name: body.name,
    description: body.description || '',
    bannerImageUrl: body.bannerImageUrl || 'http://image',
    creator: {
      accountName: gw2?.account,
      characterName: gw2?.character,
    },
    difficulty: body.difficulty || 3,
    expansions: body.expansions || [],
    masteries: body.masteries || [],
    mounts: body.mounts || [],
    items: body.items || [],
    status: body.status,
  }
  const createditems = await Promise.all(
    input.items.map(async (d) => {
      const item = await Item.create({ ...d, description: d.description || '', precision: d.precision || 5 })
      return item._id
    })
  )
  input.items = createditems
  const created = await Group.create(input)
  return getOne({ id: created._id, gw2 })
}

const putOne: OneHandler<HomeGroup> = async ({ id, body, gw2 }) => {
  const input = {
    name: body.name,
    description: body.description || '',
    bannerImageUrl: body.bannerImageUrl || 'http://image',
    creator: {
      accountName: body.creator.accountName,
      characterName: body.creator.characterName,
    },
    difficulty: body.difficulty,
    expansions: body.expansions,
    masteries: body.masteries,
    mounts: body.mounts || [],
    items: body.items || [],
    status: body.status,
  }
  const createdItems = await Promise.all(
    input.items.map(async (d) => {
      const item = new Item({ ...d, description: d.description || '', precision: d.precision || 5 })
      item.isNew = !d._id
      const result = await item.save()
      return result._id
    })
  )
  input.items = createdItems
  await Group.findByIdAndUpdate(id, input)
  return getOne({ id, gw2 })
}

const deleteOne: OneHandler<{ deleted: boolean }> = async ({ id, gw2 }) => {
  await Group.updateOne({ _id: id, 'creator.accountName': gw2?.account }, { status: 'deleted' })
  return { deleted: true }
}

export default {
  get: {
    one: getOne,
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
