import type { PaginateResult, ObjectId, Document } from 'mongoose'
import 'mongoose-paginate-v2'

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

export interface CompletionType {
  groupId: ObjectId
  accountName: string
  items: ObjectId[]
  createdAt: string
  updatedAt: string
}

export interface CompletionDocument extends CompletionType, Document {}

export interface GroupType {
  name: string
  description: string
  bannerImageUrl: string
  creator: {
    accountName: string
    characterName: string
  }
  expansions: string[]
  masteries: string[]
  difficulty: number
  createdAt: string
  updatedAt: string
  isActive: boolean
  items: ItemDocument[]
}

export interface GroupDocument extends GroupType, Document {}

export interface ItemType {
  name?: string
  description?: string
  imageUrl?: string
  precision: number
  position: [number, number, number]
  metadata?: any
  owner: GroupDocument
}

export interface ItemDocument extends ItemType, Document {}

export interface RatingType {
  groupId: ObjectId
  raterAccountName: string
  rating: number
}

export interface RatingDocument extends RatingType, Document {}
