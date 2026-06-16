import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rotas que não precisam de login
const PUBLIC_ROUTES = [
  '/login',
  '/cadastro',
  '/recuperar-senha',
  '/esqueci-senha',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sempre deixa passar rotas públicas
  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));

  // Cria resposta base (pode ser modificada abaixo)
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  try {
    // Cria cliente Supabase SSR que lê/escreve cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request: { headers: request.headers } });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    // Atualiza sessão (necessário para refresh de token)
    const { data: { user } } = await supabase.auth.getUser();

    // Rota raiz: redireciona conforme auth
    if (pathname === '/') {
      if (user) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Rota pública + usuário logado → vai para dashboard
    if (isPublic && user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Rota protegida + usuário não logado → vai para login
    if (!isPublic && !user) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    return response;
  } catch {
    // Em caso de erro no middleware, deixa passar (evita loop infinito)
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Executa em todas as rotas exceto:
     * - _next/static (arquivos estáticos)
     * - _next/image (otimização de imagens)
     * - favicon.ico
     * - arquivos de imagem
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api/).*)',
  ],
};
