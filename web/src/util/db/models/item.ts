import { Document, Schema, Model } from 'mongoose'
import { connect } from '~/util/db/mongo'
import { ItemModel as Group } from '~/util/db/models/group'

const connection = connect()

export interface Type {
  name: string
  description: string
  imageUrl?: string
  precision: number
  owner: Group
}

interface ItemDocument extends Type, Document {}

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
