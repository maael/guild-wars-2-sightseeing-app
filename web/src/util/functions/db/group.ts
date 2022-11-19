import { Group } from '~/util/db/models'
import { GroupType } from '~/types'

type GroupingType = 'top' | 'recent' | 'authored' | 'promoted' | 'completion'

function getSort(method: GroupingType) {
  if (method === 'recent') {
    return { createdAt: -1 as const }
  }
  return { createdAt: -1 as const }
}

const groupFields = {
  _id: 1,
  name: 1,
  description: 1,
  difficulty: 1,
  status: 1,
  itemCount: { $size: '$items' },
  creator: {
    accountName: 1,
  },
}

export async function getGroups(
  inputOptions: Partial<{
    limit: number
    page: number
    type: GroupingType
    query: Partial<Record<keyof GroupType | string, any>>
    accountName?: string
  }>
) {
  const query = Object.assign({ status: 'active' }, inputOptions.query || {})
  const options = Object.assign({ limit: 100, page: 1, type: 'recent', query }, inputOptions)
  const groups = await Group.aggregate(
    [
      { $match: query },
      { $project: groupFields },
      ...(options.type === 'recent' || options.type === 'promoted' || options.type === 'authored'
        ? [
            { $sort: { createdAt: -1 as const } },
            { $skip: (options.page - 1) * options.limit },
            { $limit: options.limit },
          ]
        : []),
      {
        $lookup: {
          from: 'completions',
          localField: '_id',
          foreignField: 'groupId',
          as: 'completions',
          pipeline: [
            { $match: { accountName: options.accountName } },
            { $project: { count: { $size: '$items' }, updatedAt: 1, _id: 0 } },
          ],
        },
      },
      {
        $project: {
          ...groupFields,
          itemCount: 1,
          completion: { $arrayElemAt: ['$completions', 0] },
        },
      },
      {
        $project: {
          ...groupFields,
          itemCount: 1,
          completion: 1,
          completionPercent: { $multiply: [{ $divide: ['$completion.count', '$itemCount'] }, 100] },
        },
      },
      ...(options.type === 'completion'
        ? [
            { $match: { completion: { $exists: true } } },
            { $sort: { completionPercent: -1 as const, 'completion.updatedAt': -1 as const } },
            { $skip: (options.page - 1) * options.limit },
            { $limit: options.limit },
          ]
        : []),
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'groupId',
          as: 'ratings',
          pipeline: [
            { $group: { _id: '$groupId', avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
            { $project: { avgRating: 1, count: 1, _id: 0 } },
          ],
        },
      },
      {
        $lookup: {
          from: 'ratings',
          localField: '_id',
          foreignField: 'groupId',
          as: 'userRating',
          pipeline: [{ $match: { raterAccountName: options.accountName } }, { $project: { rating: 1, _id: 0 } }],
        },
      },
      {
        $project: {
          ...groupFields,
          itemCount: 1,
          completion: 1,
          completionPercent: 1,
          ratings: { $arrayElemAt: ['$ratings', 0] },
          userRating: { $arrayElemAt: ['$userRating', 0] },
        },
      },
      ...(options.type === 'top'
        ? [
            { $sort: { 'ratings.avgRating': -1 as const } as any },
            { $skip: (options.page - 1) * options.limit },
            { $limit: options.limit },
          ]
        : []),
    ].filter(Boolean)
  )

  return groups
}
