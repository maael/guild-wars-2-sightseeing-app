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
  home: {
    get: {
      many: pageFns.homePage,
    },
  },
  user: {
    get: {
      one: pageFns.userPage,
    },
  },
}
