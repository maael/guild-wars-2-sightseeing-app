import { PaginateResult } from 'mongoose'

export type OneHandler<T> = (args: { id: string }) => Promise<T | null>
export type ManyHandler<T> = (args: {
  limit?: number
  page?: number
  offset?: number
}) => Promise<T[] | PaginateResult<T>>
