import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas completamente públicas (sem login, sem redirecionamento)
const ALWAYS_PUBLIC = ['/landing', '/oficina-mecanica'];

// Rotas públicas: acessíveis sem login, mas com sessão redirecionam para dashboard
const PUBLIC_ROUTES = ['/login', '/cadastro', '/recuperar-senha', '/esqueci-senha', '/planos'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // /landing e variantes → sempre pública, sem interferência
  if (ALWAYS_PUBLIC.some(r => pathname === r || pathname.startsWith(r + '/'))) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'));

  // Verifica sessão pelo cookie do Supabase
  const hasSession = request.cookies.getAll().some(c =>
    c.name.startsWith('sb-') && c.name.endsWith('-auth-token')
  );

  // Rota raiz → redireciona para landing (sem sessão) ou dashboard (com sessão)
  if (pathname === '/') {
    return NextResponse.redirect(
      new URL(hasSession ? '/dashboard' : '/landing', request.url)
    );
  }

  // Rota protegida sem sessão → login
  if (!isPublic && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Rota pública com sessão → dashboard (exceto /planos — sempre acessível)
  if (isPublic && hasSession && pathname !== '/planos') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
};
