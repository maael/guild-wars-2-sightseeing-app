import { PaginateResult } from 'mongoose'
export type { ItemDocument as CompletionDocument, Type as Completion } from './util/db/models/completion'
export type { ItemDocument as GroupDocument, Type as Group } from './util/db/models/group'
export type { ItemDocument as ItemDocument, Type as Item } from './util/db/models/item'
export type { ItemDocument as RatingDocument, Type as Rating } from './util/db/models/rating'

export type OneHandler<T> = (args: { id: string }) => Promise<T | null>
export type ManyHandler<T> = (args: {
  limit?: number
  page?: number
  offset?: number
}) => Promise<T[] | PaginateResult<T>>

type WithRating<T> = T & {
  rating: {
    avg: number
    count: number
  }
}
export type { PaginateResult, WithRating }
