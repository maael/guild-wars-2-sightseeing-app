import { Document, Schema, Model } from 'mongoose'
import { connect } from '../mongo'
import { ItemModel as Group } from './group'

const connection = connect()

export interface Type {
  name: string
  description: string
  imageUrl?: string
  precision: number
  location: {
    x: number
    y: number
    z: number
  }
  owner: Group
}

export interface ItemDocument extends Type, Document {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ItemModel extends Model<ItemDocument> {}

const itemSchema = new Schema<ItemDocument, ItemModel>(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    imageUrl: {
      type: String,
      required: false,
    },
    precision: {
      type: Number,
      default: 5,
    },
    location: {
      x: {
        type: Number,
        default: 0,
      },
      y: {
        type: Number,
        default: 0,
      },
      z: {
        type: Number,
        default: 0,
      },
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'Group',
    },
  },
  {
    id: true,
  }
)

const Item = connection.model<ItemDocument, ItemModel>('Item', itemSchema)

export default Item
