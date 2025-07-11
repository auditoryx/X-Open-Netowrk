import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  return NextResponse.json({ 
    error: 'Cart checkout temporarily disabled' 
  }, { status: 503 })
}