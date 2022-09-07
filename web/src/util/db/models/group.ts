import { Document, Schema, Model, PaginateModel } from 'mongoose'
import { connect } from '../mongo'
import { ItemDocument as Item } from './item'

const connection = connect()

export interface Type {
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
  items: Item[]
}

export interface ItemDocument extends Type, Document {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ItemModel extends Model<ItemDocument> {}

const itemSchema = new Schema<ItemDocument, ItemModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    bannerImageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    creator: {
      accountName: {
        type: String,
        required: true,
      },
      characterName: {
        type: String,
        required: true,
      },
    },
    expansions: {
      type: [String],
      default: [],
    },
    masteries: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
    updatedAt: {
      type: String,
      default: () => new Date().toISOString(),
    },
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Item',
      },
    ],
  },
  {
    id: true,
  }
)

const Item = connection.model<ItemDocument, PaginateModel<ItemModel>>('Group', itemSchema)

export default Item
