const title = 'Guild Wars 2 Sightseeing App | Explore Tyria!'
const description = 'Explore the sights of Tyria!'
const url = 'https://gw2-sightseeing.mael.tech'

export default {
  title,
  description,
  openGraph: {
    title,
    description,
    url,
    site_name: title,
    type: 'website',
    locale: 'en_GB',
    images: [
      {
        url: `${url}/preview.png`,
        width: 1200,
        height: 630,
        alt: 'Guild Wars 2 | Sightseeing App',
      },
    ],
  },
}
