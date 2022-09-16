import { PaginateResult } from 'mongoose'
export type { ItemDocument as CompletionDocument, Type as Completion } from './util/db/models/completion'
export type { ItemDocument as GroupDocument, Type as Group } from './util/db/models/group'
export type { ItemDocument as ItemDocument, Type as Item } from './util/db/models/item'
export type { ItemDocument as RatingDocument, Type as Rating } from './util/db/models/rating'

export type OneHandler<T, Body = any> = (args: {
  id: string
  body?: Body
  gw2?: {
    account?: string
    character?: string
  }
}) => Promise<T | null>
export type ManyHandler<T, Body = any> = (args: {
  limit?: number
  page?: number
  offset?: number
  body?: Body
  gw2?: {
    account?: string
    character?: string
  }
}) => Promise<T[] | PaginateResult<T>>

type WithRating<T> = T & {
  rating: {
    avg: number
    count: number
    user: number
  }
}
export type { PaginateResult, WithRating }
