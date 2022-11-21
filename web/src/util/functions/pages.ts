import { getGroups } from './db/group'
import { ManyHandler, OneHandler } from '~/types'

export const homePage: ManyHandler<any> = async ({ gw2 }) => {
  if (gw2) {
    gw2.account = 'Mael.3259'
  }
  const result = await Promise.all([
    getGroups({
      accountName: gw2?.account,
      type: 'promoted',
      query: { isPromoted: true },
      limit: 10,
      select: { bannerImageUrl: 1 },
    }),
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

export const userPage: OneHandler<any> = async ({ id }) => {
  const [completion, authored] = await Promise.all([
    getGroups({ accountName: id, type: 'completion' }),
    getGroups({
      accountName: id,
      type: 'authored',
      query: { 'creator.accountName': id },
    }),
  ])
  return {
    authored,
    completion,
  }
}

export const updateInfo: ManyHandler<any> = async () => {
  return {
    version: '1.8.0',
    downloadLink:
      'https://github.com/maael/guild-wars-2-sightseeing-app/releases/latest/download/Guild.Wars.2.Sightseeing.exe',
    viewLink: 'https://github.com/maael/guild-wars-2-sightseeing-app/releases/latest',
  } as any
}
