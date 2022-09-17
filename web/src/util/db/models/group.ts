import { Schema, Model, PaginateModel } from 'mongoose'
import { connect } from '../mongo'
import { GroupDocument } from '../../../types'

const connection = connect()

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ItemModel extends Model<GroupDocument> {}

const itemSchema = new Schema<GroupDocument, ItemModel>(
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
    items: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Item',
      },
    ],
  },
  {
    id: true,
    timestamps: true,
  }
)

const Item = connection.model<GroupDocument, PaginateModel<ItemModel>>('Group', itemSchema)

export default Item
