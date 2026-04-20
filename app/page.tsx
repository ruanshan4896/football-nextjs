import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import {
  Activity,
  Calendar,
  TrendingUp,
  Trophy,
  Users,
  BarChart3,
  ArrowRight,
  Star,
  Zap,
  Globe,
} from 'lucide-react'
import { getLiveMatches } from '@/lib/services/live'
import { getOddsByLeague } from '@/lib/services/odds'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-server'
import { websiteJsonLd, organizationJsonLd } from '@/lib/json-ld'
import MatchRow from '@/components/ui/MatchRow'
import ArticleCard from '@/components/ui/ArticleCard'
import NewsCarousel from '@/components/ui/NewsCarousel'


export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'BongDaWap - Xem bóng đá trực tiếp, livescore, tỷ lệ kèo',
  description: 'BongDaWap - Trang xem bóng đá trực tiếp, livescore, kết quả, bảng xếp hạng, tỷ lệ kèo và nhận định chuyên sâu từ các chuyên gia hàng đầu.',
}

// Hero Section
function HeroSection() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-green-700 to-green-800">
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]"></div>
      </div>
      <div className="relative px-6 py-10 md:px-8 md:py-14">
        <div className="mx-auto max-w-4xl text-center">
          {/* Logo */}
          <div className="mb-6 flex justify-center">
            <Image
              src="/bongdawap-logo-techshift.png"
              alt="BongDaWap - Xem bóng đá trực tiếp"
              width={400}
              height={100}
              className="h-16 w-auto object-contain"
              priority
            />
          </div>

          {/* H1 - tối ưu SEO cho từ khóa BongDaWap */}
          <h1 className="mb-3 text-2xl font-bold text-white md:text-3xl">
            BongDaWap – Xem Bóng Đá Trực Tiếp, Livescore 24/7
          </h1>

          {/* H2 */}
          <h2 className="mb-6 text-base text-green-100 md:text-lg">
            Cập nhật livescore nhanh nhất, tỷ lệ kèo chính xác, nhận định chuyên sâu từ BongDaWap
          </h2>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/livescore"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-green-700 transition-all hover:bg-green-50 hover:scale-105"
            >
              <Activity size={20} />
              Xem Livescore
            </Link>
            <Link
              href="/nhan-dinh"
              className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/30 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/10"
            >
              <TrendingUp size={20} />
              Nhận định kèo
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

// Quick Stats
function QuickStats() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {[
        { icon: Activity, label: 'Trận Live', value: '12+', color: 'text-red-500' },
        { icon: Calendar, label: 'Trận hôm nay', value: '50+', color: 'text-blue-500' },
        { icon: Trophy, label: 'Giải đấu', value: '100+', color: 'text-yellow-500' },
        { icon: Users, label: 'Người dùng', value: '10K+', color: 'text-green-500' },
      ].map((stat, i) => (
        <div key={i} className="rounded-xl bg-white p-4 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg bg-gray-50 p-2 ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Live Matches Preview
async function LiveMatchesPreview() {
  const fixtures = await getLiveMatches()
  const displayFixtures = fixtures.slice(0, 3)

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between bg-red-600 px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-white" />
          <h3 className="font-semibold text-white">Đang diễn ra</h3>
          {fixtures.length > 0 && (
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold text-white animate-pulse">
              {fixtures.length} LIVE
            </span>
          )}
        </div>
        <Link href="/livescore" className="text-xs text-red-100 hover:text-white">Xem tất cả →</Link>
      </div>
      {displayFixtures.length > 0 ? (
        <div>{displayFixtures.map((f) => <MatchRow key={f.fixture.id} fixture={f} />)}</div>
      ) : (
        <div className="px-4 py-8 text-center text-sm text-gray-400">Hiện không có trận nào đang diễn ra</div>
      )}
    </div>
  )
}

// Featured Articles
async function FeaturedArticles() {
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug, excerpt, cover_image, author, published_at, match_id, league_id')
    .eq('status', 'published')
    .eq('content_type', 'article')
    .order('published_at', { ascending: false })
    .limit(4)

  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div className="flex items-center justify-between bg-blue-600 px-4 py-3">
        <div className="flex items-center gap-2">
          <Star size={16} className="text-white" />
          <h3 className="font-semibold text-white">Nhận định nổi bật</h3>
        </div>
        <Link href="/nhan-dinh" className="text-xs text-blue-100 hover:text-white">Xem tất cả →</Link>
      </div>
      {articles && articles.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {articles.map((a) => <ArticleCard key={a.id} article={a} variant="compact" />)}
        </div>
      ) : (
        <div className="px-4 py-8 text-center text-sm text-gray-400">Chưa có bài viết nào</div>
      )}
    </div>
  )
}

// Hot Odds Preview
async function HotOddsPreview() {
  try {
    const { odds } = await getOddsByLeague(39, undefined, 1, 8)
    const hotOdds = odds.slice(0, 3)

    return (
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between bg-orange-600 px-4 py-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-white" />
            <h3 className="font-semibold text-white">Kèo hot Premier League</h3>
          </div>
          <Link href="/ty-le-keo" className="text-xs text-orange-100 hover:text-white">Xem tất cả →</Link>
        </div>
        {hotOdds.length > 0 ? (
          <div className="p-4 space-y-3">
            {hotOdds.map((odd, i) => (
              <div key={odd.fixture.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Trận #{i + 1}</p>
                  <p className="text-xs text-gray-500">{new Date(odd.fixture.date).toLocaleDateString('vi-VN')}</p>
                </div>
                <Link href={`/tran-dau/${odd.fixture.id}`} className="text-xs text-orange-600 hover:underline">Xem kèo →</Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="px-4 py-8 text-center text-sm text-gray-400">Đang cập nhật kèo...</div>
        )}
      </div>
    )
  } catch {
    return (
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between bg-orange-600 px-4 py-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-white" />
            <h3 className="font-semibold text-white">Kèo hot</h3>
          </div>
          <Link href="/ty-le-keo" className="text-xs text-orange-100 hover:text-white">Xem tất cả →</Link>
        </div>
        <div className="px-4 py-8 text-center text-sm text-gray-400">Đang cập nhật...</div>
      </div>
    )
  }
}

// News Section
async function NewsSection() {
  const { data: news } = await supabaseAdmin
    .from('articles')
    .select('id, title, slug, excerpt, cover_image, author, published_at')
    .eq('status', 'published')
    .eq('content_type', 'news')
    .order('published_at', { ascending: false })
    .limit(10)

  if (!news || news.length === 0) return null

  return (
    <div className="rounded-xl bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between bg-blue-700 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-white">📰</span>
          <h3 className="font-semibold text-white text-sm">Tin tức mới nhất</h3>
        </div>
        <Link href="/tin-tuc" className="text-xs text-blue-100 hover:text-white">Xem tất cả →</Link>
      </div>
      <div className="p-3">
        <NewsCarousel news={news} />
      </div>
    </div>
  )
}

// Features Grid
function FeaturesGrid() {
  const features = [
    { icon: Zap, title: 'Cập nhật Real-time', description: 'Livescore và kết quả được cập nhật tức thời', color: 'bg-yellow-500', href: '/livescore' },
    { icon: BarChart3, title: 'Thống kê chi tiết', description: 'Bảng xếp hạng và số liệu đầy đủ', color: 'bg-blue-500', href: '/bang-xep-hang' },
    { icon: TrendingUp, title: 'Tỷ lệ kèo chính xác', description: 'Kèo từ các nhà cái uy tín nhất', color: 'bg-green-500', href: '/ty-le-keo' },
    { icon: Globe, title: 'Giải đấu toàn cầu', description: 'Theo dõi hơn 100 giải đấu trên thế giới', color: 'bg-purple-500', href: '/giai-dau/39' },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {features.map((feature, i) => (
        <Link key={i} href={feature.href} className="group rounded-xl bg-white p-6 shadow-sm border border-gray-100 transition-all hover:shadow-md hover:scale-105">
          <div className={`inline-flex rounded-lg ${feature.color} p-3 text-white mb-4`}>
            <feature.icon size={24} />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
          <p className="text-sm text-gray-600 mb-3">{feature.description}</p>
          <div className="flex items-center text-sm font-medium text-green-600 group-hover:gap-2 transition-all">
            Khám phá
            <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      ))}
    </div>
  )
}

// Skeleton
function ContentSkeleton() {
  return (
    <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
      <div className="h-12 bg-gray-200 animate-pulse"></div>
      <div className="p-4 space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded animate-pulse"></div>
        ))}
      </div>
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd()) }} />

      <HeroSection />
      <QuickStats />

      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense fallback={<ContentSkeleton />}>
          <LiveMatchesPreview />
        </Suspense>
        <Suspense fallback={<ContentSkeleton />}>
          <FeaturedArticles />
        </Suspense>
      </div>

      <Suspense fallback={<ContentSkeleton />}>
        <HotOddsPreview />
      </Suspense>

      {/* Tin tức carousel */}
      <Suspense fallback={<ContentSkeleton />}>
        <NewsSection />
      </Suspense>

      <div>
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Tính năng nổi bật</h2>
          <p className="text-gray-600">Khám phá những tính năng tuyệt vời của BongDaWap</p>
        </div>
        <FeaturesGrid />
      </div>
    </div>
  )
}
