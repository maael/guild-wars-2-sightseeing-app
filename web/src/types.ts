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

export interface PrizeType {
  label?: string
  imageUrl?: string
  position?: string
}

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
  isPromoted: boolean
  prizes: PrizeType[]
  createdAt: string
  updatedAt: string
  status: 'draft' | 'active' | 'deleted'
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

/**
 * Home Page
 */

export interface HomeResponse {
  promoted: HomeGroup[]
  top: HomeGroup[]
  recent: HomeGroup[]
  authored: HomeGroup[]
  completion: HomeGroup[]
}

export interface HomeGroup {
  _id: string
  name: string
  description: string
  creator: {
    accountName: string
  }
  difficulty: number
  status: 'active' | 'draft' | 'deleted'
  itemCount: number
  completion: {
    updatedAt: string
    count: number
  }
  completionPercent: number
  ratings: {
    avgRating: number
    count: number
  }
  userRating: {
    rating: number
  }
  createdAt: string
}

export type HomeGroupWithItems = HomeGroup & {
  items: {
    _id: string
    name: string
    description: string
    imageUrl: string
    precision: number
    position: [number, number, number]
    metadata?: any
  }[]
  completions: HomeGroup['completion'] & { items: string[] }
}

export type UserResponse = Pick<HomeResponse, 'authored' | 'completion'>
