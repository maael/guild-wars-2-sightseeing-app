const title = 'Guild Wars 2 Sightseeing App | Explore Tyria!'
const description = 'Explore the sights of Tyria!'
const url = 'https://gw2-sightseeing.mael.tech'

export default {
  title,
  description,
  canonical: url,
  openGraph: {
    title,
    description,
    url,
    site_name: title,
    type: 'website',
    locale: 'en_GB',
  },
}
