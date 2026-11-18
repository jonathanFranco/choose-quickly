<div align="center">

<img src="public/icon.svg" alt="Bora Assistir" width="96" />

# 🎬 Bora Assistir

**Pare de gastar meia hora escolhendo o que assistir.**
Sorteie um filme ou série em um toque — direto do Top 250 do IMDb ou com filtros por streaming, gênero e década.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=nextdotjs)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![TMDb](https://img.shields.io/badge/dados-TMDb-01B4E4?logo=themoviedatabase&logoColor=white)

</div>

---

## ✨ O que ele faz

- 🎲 **Sorteio em um toque** — sem filtro nenhum, o resultado sai do **Top 250 do IMDb**.
- 🎞️ **Filmes ou séries** — alterne entre os dois tipos de conteúdo.
- 🥉 **Modo "Escolher entre 3"** — sorteia três opções para você bater o martelo.
- 📊 **Rankings diferentes** — Top 250 IMDb, Mais bem avaliados (TMDb) e Populares agora (TMDb).
- 🔎 **Filtros** — onde assistir (serviço de streaming), gênero, década e origem (inclusive doramas 🇰🇷).
- ▶️ **Trailer** — assista ao trailer do título sorteado sem sair da página.
- 🌎 **Bilíngue** — interface em português e inglês.
- 📱 **Pronto para compartilhar e instalar** — imagens Open Graph dinâmicas, manifest PWA, sitemap e robots.

## 🧱 Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | [Next.js 16](https://nextjs.org) (App Router) + React 19 |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS 4, [shadcn/ui](https://ui.shadcn.com), Base UI, `tw-animate-css` |
| Ícones | [Lucide](https://lucide.dev) |
| Dados | [TMDb API](https://developer.themoviedb.org) + SWR |
| Analytics | Vercel Analytics |

## 🚀 Rodando localmente

**Pré-requisitos:** Node.js 20+ e um gerenciador de pacotes (o projeto tem lockfiles de `bun` e `pnpm`).

```bash
# 1. Clone o repositório
git clone https://github.com/jonathanFranco/choose-quickly.git
cd choose-quickly

# 2. Instale as dependências
bun install      # ou: pnpm install

# 3. Configure as variáveis de ambiente
echo "TMDB_API_KEY=sua_chave_aqui" > .env.local

# 4. Suba o servidor de desenvolvimento
bun dev          # ou: pnpm dev
```

Abra [http://localhost:3000](http://localhost:3000) e bora assistir. 🍿

### 🔑 Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `TMDB_API_KEY` | Recomendada | Chave da API do TMDb. Necessária para dados ao vivo (rankings do TMDb, filtro por streaming e trailers). Crie a sua em [themoviedb.org](https://www.themoviedb.org/settings/api). |
| `NEXT_PUBLIC_SITE_URL` | Não | URL pública do site, usada em metadados, sitemap e imagens OG. |

> Na Vercel, `VERCEL_PROJECT_PRODUCTION_URL` é usada automaticamente como fallback da URL do site.

## 📜 Scripts

| Comando | O que faz |
| --- | --- |
| `dev` | Servidor de desenvolvimento |
| `build` | Build de produção |
| `start` | Sobe o build de produção |
| `lint` | Roda o ESLint |

## 🗂️ Estrutura

```
app/
├── [locale]/          # Páginas por idioma (pt / en) + imagem OG
├── api/
│   ├── titles/        # Busca de títulos no TMDb
│   └── trailer/       # Busca de trailers
├── manifest.ts        # Manifest PWA
├── robots.ts
└── sitemap.ts
components/
├── movie-picker.tsx   # O sorteador em si
├── language-switcher.tsx
└── ui/                # Componentes shadcn/ui
lib/
├── tmdb.ts            # Cliente da API do TMDb
├── movies.ts          # Dados e lógica de sorteio
├── i18n.ts            # Internacionalização
└── site.ts            # Configurações do site
messages/
├── pt.json            # Textos em português
└── en.json            # Textos em inglês
```

## 🌍 Adicionando um idioma

1. Crie `messages/<idioma>.json` copiando a estrutura de `pt.json`.
2. Registre o novo idioma em `lib/i18n.ts`.
3. Pronto — as rotas em `app/[locale]` cuidam do resto.

## ☁️ Deploy

O jeito mais simples é na [Vercel](https://vercel.com/new): importe o repositório, adicione a `TMDB_API_KEY` nas variáveis de ambiente e faça o deploy.

## 🙏 Créditos

Este produto usa a API do TMDb, mas não é endossado nem certificado pelo TMDb.
Rankings do IMDb pertencem aos seus respectivos donos.

---

<div align="center">
Feito com 🍿 por <a href="https://github.com/jonathanFranco">@jonathanFranco</a>
</div>
