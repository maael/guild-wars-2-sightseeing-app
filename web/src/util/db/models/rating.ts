import { Schema, Model, PaginateModel } from 'mongoose'
import { connect } from '../mongo'
import { RatingDocument } from '../../../types'

const connection = connect()

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

const Item = connection.model<RatingDocument, PaginateModel<ItemModel>>('Rating', itemSchema)

export default Item
