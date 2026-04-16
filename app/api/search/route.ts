import { NextRequest, NextResponse } from 'next/server'
import { searchAll } from '@/lib/services/search'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json({ 
        error: 'Query must be at least 2 characters long' 
      }, { status: 400 })
    }

    const results = await searchAll(query)

    return NextResponse.json({
      success: true,
      query,
      results,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Search API error:', error)
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}

// Hỗ trợ CORS cho client-side search (nếu cần)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}