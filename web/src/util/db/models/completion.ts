import mongoose, { Schema, Model, PaginateModel } from 'mongoose'
import { CompletionDocument } from '../../../types'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ItemModel extends Model<CompletionDocument> {}

const itemSchema = new Schema<CompletionDocument, ItemModel>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    items: {
      type: [Schema.Types.ObjectId],
      default: [],
    },
  },
  {
    id: true,
    timestamps: true,
  }
)

const Item =
  mongoose.models.Completion || mongoose.model<CompletionDocument, PaginateModel<ItemModel>>('Completion', itemSchema)

export default Item
