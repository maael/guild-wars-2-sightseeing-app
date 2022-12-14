import mongoose, { Schema, Model } from 'mongoose'
import { GeoguesserSubmissionDocument } from '../../../types'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ItemModel extends Model<GeoguesserSubmissionDocument> {}

const itemSchema = new Schema<GeoguesserSubmissionDocument, ItemModel>(
  {
    accepted: { type: Boolean, default: false },
    account: { type: String },
    mapId: { type: Number },
    location: { type: [Number, Number] },
    image: { type: String },
  },
  {
    timestamps: true,
  }
)

const Item =
  mongoose.models.GeoguesserSubmission ||
  mongoose.model<GeoguesserSubmissionDocument, ItemModel>('GeoguesserSubmission', itemSchema)

export default Item
