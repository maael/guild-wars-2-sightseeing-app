import { Document, Schema, Model, PaginateModel } from 'mongoose'
import { connect } from '~/util/db/mongo'
import { ItemModel as Item } from '~/util/db/models/item'

const connection = connect()

export interface Type {
  name: string
  description: string
  bannerimageUrl: string
  creator: {
    accountName: string
    characterName: string
  }
  expansions: string[]
  masteries: string[]
  difficulty: number
  created_at: string
  updated_at: string
  isActive: boolean
  items: Item[]
}

interface ItemDocument extends Type, Document {}

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
    bannerimageUrl: {
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
    created_at: {
      type: String,
      default: () => new Date().toISOString(),
    },
    updated_at: {
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
