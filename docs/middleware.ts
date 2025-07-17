import { NextRequest, NextResponse } from 'next/server'
import { middleware as nextraMiddleware } from 'nextra/locales'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const userAgent = request.headers.get('user-agent') || ''
  
  // 检测移动设备
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  
  // 支持的语言代码
  const supportedLocales = ['en', 'fr', 'zh']
  
  // 如果是移动设备访问首页，重定向到 /docs
  if (isMobile) {
    const pathSegments = pathname.split('/').filter(Boolean)
    
    // 检查是否为首页访问
    let isHomePage = false
    let locale = 'en' // 默认语言
    
    if (pathSegments.length === 0) {
      // 根路径 "/"
      isHomePage = true
    } else if (pathSegments.length === 1 && pathSegments[0] && supportedLocales.includes(pathSegments[0])) {
      // 语言首页 "/en", "/fr", "/zh"
      isHomePage = true
      locale = pathSegments[0]
    }
    
    if (isHomePage) {
      const url = request.nextUrl.clone()
      url.pathname = `/${locale}/docs`
      return NextResponse.redirect(url)
    }
  }
  
  // 使用 Nextra 的中间件处理其他情况
  return nextraMiddleware(request)
}

export const config = {
  // Matcher ignoring `/_next/` and `/api/`
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg|apple-icon.png|manifest|_pagefind|android-chrome-192x192.png|android-chrome-512x512.png|mstile-150x150.png).*)'
  ]
}


