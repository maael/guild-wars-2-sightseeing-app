import { Document, Schema, Model, ObjectId, PaginateModel } from 'mongoose'
import { connect } from '../mongo'

const connection = connect()

export interface Type {
  groupId: ObjectId
  accountName: string
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
    accountName: {
      type: String,
      required: true,
    },
  },
  {
    id: true,
  }
)

const Item = connection.model<ItemDocument, PaginateModel<ItemModel>>('Completion', itemSchema)

export default Item
