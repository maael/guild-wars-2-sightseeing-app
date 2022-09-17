import { Schema, Model, PaginateModel } from 'mongoose'
import { connect } from '../mongo'
import { CompletionDocument } from '../../../types'

const connection = connect()

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

const Item = connection.model<CompletionDocument, PaginateModel<ItemModel>>('Completion', itemSchema)

export default Item
