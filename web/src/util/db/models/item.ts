import mongoose, { Schema, Model } from 'mongoose'
import { ItemDocument } from '../../../types'

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
    position: {
      type: [Number],
      default: [0, 0, 0],
    },
    metadata: {
      type: Schema.Types.Mixed,
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

const Item = mongoose.models.Item || mongoose.model<ItemDocument, ItemModel>('Item', itemSchema)

export default Item
