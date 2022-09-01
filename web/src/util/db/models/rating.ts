import { Document, Schema, Model, ObjectId, PaginateModel } from 'mongoose'
import { connect } from '../mongo'

const connection = connect()

export interface Type {
  groupId: ObjectId
  raterAccountName: string
  rating: number
}

interface ItemDocument extends Type, Document {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ItemModel extends Model<ItemDocument> {}

const itemSchema = new Schema<ItemDocument, ItemModel>(
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

const Item = connection.model<ItemDocument, PaginateModel<ItemModel>>('Rating', itemSchema)

export default Item
