import completionFns from './completion'
import groupFns from './group'
import ratingFns from './rating'
import leaderboardFns from './leaderboard'
import * as pageFns from './pages'

export default {
  completions: completionFns,
  groups: groupFns,
  ratings: ratingFns,
  leaderboards: leaderboardFns,
  yours: {
    get: {
      many: pageFns.yoursPage,
    },
  },
  others: {
    get: {
      many: pageFns.othersPage,
    },
  },
  user: {
    get: {
      one: pageFns.userPage,
    },
  },
  'update-info': {
    get: {
      many: pageFns.updateInfo,
    },
  },
}
