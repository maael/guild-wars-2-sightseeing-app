import GeoguesserSuggestion from '~/util/db/models/geoguesserSuggestion'
import { ManyHandler } from '~/types'

const postMany: ManyHandler<any> = async ({ gw2, body }) => {
  return GeoguesserSuggestion.create({ ...body, account: gw2?.account })
}

export default {
  post: {
    many: postMany,
  },
}
