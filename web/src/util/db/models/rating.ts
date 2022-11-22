import mongoose, { Schema, Model } from 'mongoose'
import { RatingDocument } from '../../../types'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ItemModel extends Model<RatingDocument> {}

const itemSchema = new Schema<RatingDocument, ItemModel>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    raterAccountName: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
  },
  {
    id: false,
  }
)

const Item = mongoose.models.Rating || mongoose.model<RatingDocument, ItemModel>('Rating', itemSchema)

export default Item
