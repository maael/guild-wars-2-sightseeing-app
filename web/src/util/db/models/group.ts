import mongoose, { Schema, Model } from 'mongoose'
import { GroupDocument } from '../../../types'

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
    mounts: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: Number,
      required: true,
    },
    isPromoted: {
      type: Boolean,
      default: false,
    },
    prizes: {
      type: [
        {
          label: { type: String, required: false },
          imageUrl: { type: String, required: false },
          positionLabel: { type: String, required: false },
          amount: { type: Number, required: false },
        },
      ],
      default: [],
    },
    prizeNote: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      default: 'draft',
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

const Item = mongoose.models.Group || mongoose.model<GroupDocument, ItemModel>('Group', itemSchema)

export default Item
