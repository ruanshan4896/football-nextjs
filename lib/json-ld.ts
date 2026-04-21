import type { Fixture } from './api-football'

const BASE_URL = process.env.NODE_ENV === 'development'
  ? 'http://localhost:3000'
  : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.techshift.vn')

export function fixtureJsonLd(fixture: Fixture) {
  const { fixture: f, teams, goals, league } = fixture
  const isFinished = ['FT', 'AET', 'PEN'].includes(f.status.short)

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${teams.home.name} vs ${teams.away.name}`,
    startDate: f.date,
    location: { '@type': 'Place', name: league.country },
    organizer: { '@type': 'SportsOrganization', name: league.name },
    competitor: [
      { '@type': 'SportsTeam', name: teams.home.name, image: teams.home.logo },
      { '@type': 'SportsTeam', name: teams.away.name, image: teams.away.logo },
    ],
    ...(isFinished && goals.home !== null && goals.away !== null ? {
      eventStatus: 'https://schema.org/EventScheduled',
      description: `Kết quả: ${teams.home.name} ${goals.home} - ${goals.away} ${teams.away.name}`,
    } : {}),
    url: `${BASE_URL}/tran-dau/${f.id}`,
  }
}

export function articleJsonLd(article: {
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  author: string
  published_at: string
  updated_at: string
  content_type?: string
}) {
  const path = article.content_type === 'news' ? 'tin-tuc' : 'nhan-dinh'

  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt ?? '',
    image: article.cover_image ? [article.cover_image] : [],
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'BongDaWap',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/bongdawap-logo-techshift.png`,
        width: 400,
        height: 100,
      },
    },
    datePublished: article.published_at,
    dateModified: article.updated_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/${path}/${article.slug}`,
    },
    url: `${BASE_URL}/${path}/${article.slug}`,
    inLanguage: 'vi',
    isAccessibleForFree: true,
    isPartOf: {
      '@type': ['CreativeWork', 'Product'],
      name: 'BongDaWap',
      productID: 'CAow26PGDA:openaccess',
    },
  }
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BongDaWap',
    url: BASE_URL,
    description: 'BongDaWap - Xem bóng đá trực tiếp, livescore, kết quả, bảng xếp hạng và nhận định',
    inLanguage: 'vi',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/tim-kiem?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BongDaWap',
    url: BASE_URL,
    logo: `${BASE_URL}/bongdawap-logo-techshift.png`,
    description: 'BongDaWap - Trang xem bóng đá trực tiếp, livescore, kết quả, bảng xếp hạng và nhận định chuyên sâu',
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Vietnamese',
    },
  }
}

export function leagueJsonLd(league: {
  id: number
  name: string
  logo: string
  country: string
  season: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsOrganization',
    '@id': `${BASE_URL}/giai-dau/${league.id}`,
    name: league.name,
    sport: 'Soccer',
    logo: league.logo,
    location: { '@type': 'Country', name: league.country },
    url: `${BASE_URL}/giai-dau/${league.id}`,
    description: `Bảng xếp hạng, lịch thi đấu và kết quả ${league.name} mùa ${league.season}`,
  }
}

export function teamJsonLd(team: {
  id: number
  name: string
  logo: string
  country?: string
  founded?: number
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'SportsTeam',
    '@id': `${BASE_URL}/doi-bong/${team.id}`,
    name: team.name,
    sport: 'Soccer',
    logo: team.logo,
    url: `${BASE_URL}/doi-bong/${team.id}`,
    ...(team.country && { location: { '@type': 'Country', name: team.country } }),
    ...(team.founded && { foundingDate: team.founded.toString() }),
    description: `Thông tin, thống kê và lịch thi đấu của ${team.name}`,
  }
}

export function breadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
