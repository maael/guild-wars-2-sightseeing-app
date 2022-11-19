import { getGroups } from './db/group'
import { ManyHandler } from '~/types'

/**
 * TODO: Swap to use new endpoint in frontend, and remove old groups get:many
 */
export const homePage: ManyHandler<any> = async ({ gw2 }) => {
  if (gw2) {
    gw2.account = 'Mael.3259'
  }
  const result = await Promise.all([
    getGroups({ accountName: gw2?.account, type: 'promoted', query: { isPromoted: true } }),
    getGroups({ accountName: gw2?.account, type: 'top' }),
    getGroups({ accountName: gw2?.account, type: 'recent' }),
    gw2?.account
      ? getGroups({
          accountName: gw2?.account,
          type: 'authored',
          query: { 'creator.accountName': gw2?.account, status: { $not: { $eq: 'deleted' } } },
        })
      : [],
    gw2?.account
      ? getGroups({
          accountName: gw2?.account,
          type: 'completion',
        })
      : [],
  ])
  const [promoted, top, recent, authored, completion] = result
  return {
    promoted,
    top,
    recent,
    authored,
    completion,
  } as any
}

export async function userPage() {
  return {
    authored: [],
    completion: [],
  }
}
