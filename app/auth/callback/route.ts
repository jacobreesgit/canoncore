import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')
  const reset = requestUrl.searchParams.get('reset')
  const token = requestUrl.searchParams.get('token')

  console.log('Auth callback - Full URL:', requestUrl.toString())
  console.log('Auth callback - type:', type, 'reset:', reset, 'code present:', !!code, 'token present:', !!token)
  console.log('All search params:', Object.fromEntries(requestUrl.searchParams))

  // Create Supabase client with environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables')
    return NextResponse.redirect(requestUrl.origin)
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  // Handle different auth flows
  if (token && type === 'recovery') {
    // This is a password recovery token from email
    console.log('Password recovery token detected, redirecting to reset password page')
    try {
      // Verify the recovery token and create session
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'recovery'
      })
      
      if (error) {
        console.error('Error verifying recovery token:', error)
        return NextResponse.redirect(`${requestUrl.origin}?error=invalid_recovery_token`)
      }
      
      console.log('Recovery token verified successfully')
      return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password`)
    } catch (error) {
      console.error('Error in recovery flow:', error)
      return NextResponse.redirect(`${requestUrl.origin}?error=recovery_failed`)
    }
  }

  if (code) {
    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(requestUrl.origin)
      }

      console.log('Session exchanged successfully')
      
      // Check for password recovery in multiple ways
      if (type === 'recovery' || reset === 'true') {
        console.log('Password recovery detected via code exchange, redirecting to reset password page')
        return NextResponse.redirect(`${requestUrl.origin}/auth/reset-password`)
      }

    } catch (error) {
      console.error('Error exchanging code for session:', error)
    }
  }

  // Redirect to home page after authentication
  return NextResponse.redirect(requestUrl.origin)
}