import type { Fixture } from './api-football'

const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000' 
  : (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://bongdalive.com')

/**
 * JSON-LD Schema cho trang chi tiết trận đấu
 * Giúp Google hiển thị rich results (tỷ số, đội bóng)
 */
export function fixtureJsonLd(fixture: Fixture) {
  const { fixture: f, teams, goals, league } = fixture
  const isFinished = ['FT', 'AET', 'PEN'].includes(f.status.short)

  return {
    '@context': 'https://schema.org',
    '@type': 'SportsEvent',
    name: `${teams.home.name} vs ${teams.away.name}`,
    startDate: f.date,
    location: {
      '@type': 'Place',
      name: league.country,
    },
    organizer: {
      '@type': 'SportsOrganization',
      name: league.name,
    },
    competitor: [
      {
        '@type': 'SportsTeam',
        name: teams.home.name,
        image: teams.home.logo,
      },
      {
        '@type': 'SportsTeam',
        name: teams.away.name,
        image: teams.away.logo,
      },
    ],
    ...(isFinished && goals.home !== null && goals.away !== null
      ? {
          eventStatus: 'https://schema.org/EventScheduled',
          description: `Kết quả: ${teams.home.name} ${goals.home} - ${goals.away} ${teams.away.name}`,
        }
      : {}),
    url: `${BASE_URL}/tran-dau/${f.id}`,
  }
}

/**
 * JSON-LD Schema cho bài viết nhận định
 */
export function articleJsonLd(article: {
  title: string
  slug: string
  excerpt: string | null
  cover_image: string | null
  author: string
  published_at: string
  updated_at: string
}) {
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
      name: 'BóngĐá Live',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/icon.png`,
      },
    },
    datePublished: article.published_at,
    dateModified: article.updated_at,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/nhan-dinh/${article.slug}`,
    },
  }
}

/**
 * JSON-LD Schema cho trang chủ (WebSite + SearchAction)
 */
export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BóngĐá Live',
    url: BASE_URL,
    description: 'Livescore bóng đá trực tiếp, kết quả, bảng xếp hạng và nhận định',
    inLanguage: 'vi',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/nhan-dinh?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }
}

/**
 * JSON-LD Schema cho Organization (trang chủ)
 */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BóngĐá Live',
    url: BASE_URL,
    logo: `${BASE_URL}/icon.png`,
    description: 'Website cung cấp livescore bóng đá trực tiếp, kết quả, bảng xếp hạng và nhận định chuyên nghiệp',
    sameAs: [
      // Add social media URLs when available
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Vietnamese',
    },
  }
}

/**
 * JSON-LD Schema cho SportsLeague (trang giải đấu)
 */
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
    location: {
      '@type': 'Country',
      name: league.country,
    },
    url: `${BASE_URL}/giai-dau/${league.id}`,
    description: `Bảng xếp hạng, lịch thi đấu và kết quả ${league.name} mùa ${league.season}`,
  }
}

/**
 * JSON-LD Schema cho SportsTeam (trang đội bóng)
 */
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
    ...(team.country && {
      location: {
        '@type': 'Country',
        name: team.country,
      },
    }),
    ...(team.founded && {
      foundingDate: team.founded.toString(),
    }),
    description: `Thông tin, thống kê và lịch thi đấu của ${team.name}`,
  }
}

/**
 * JSON-LD Schema cho BreadcrumbList
 */
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
