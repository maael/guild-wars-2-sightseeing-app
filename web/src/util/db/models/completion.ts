import { Document, Schema, Model, ObjectId, PaginateModel } from 'mongoose'
import { connect } from '../mongo'

const connection = connect()

export interface Type {
  groupId: ObjectId
  accountName: string
  items: ObjectId[]
  createdAt: string
  updatedAt: string
}

export interface ItemDocument extends Type, Document {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ItemModel extends Model<ItemDocument> {}

const itemSchema = new Schema<ItemDocument, ItemModel>(
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

const Item = connection.model<ItemDocument, PaginateModel<ItemModel>>('Completion', itemSchema)

export default Item
