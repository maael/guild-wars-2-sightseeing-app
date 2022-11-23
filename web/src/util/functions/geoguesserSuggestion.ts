import GeoguesserSuggestion from '~/util/db/models/geoguesserSuggestion'
import { ManyHandler } from '~/types'

const postMany: ManyHandler<any> = async ({ body }) => {
  return GeoguesserSuggestion.create(body)
}

export default {
  post: {
    many: postMany,
  },
}
