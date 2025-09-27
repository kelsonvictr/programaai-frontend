const SITE_URL_ENV = import.meta.env.VITE_SITE_URL

export const SITE_URL = SITE_URL_ENV && SITE_URL_ENV.length > 0
  ? SITE_URL_ENV.replace(/\/$/, "")
  : "https://programaai.dev"

export const buildAbsoluteUrl = (path = "/"): string => {
  if (!path) return SITE_URL
  if (/^https?:\/\//i.test(path)) return path
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  return `${SITE_URL}${normalizedPath}`
}

export const DEFAULT_SEO = {
  title: "Cursos de Programação Presencial em João Pessoa | Programa AI",
  description:
    "Cursos presenciais e bootcamps de programação com professores de mercado em João Pessoa (PB). Turmas reduzidas, muita prática e tecnologia de ponta.",
  image: buildAbsoluteUrl("/banners/banner-site-progdozero.png"),
  siteName: "Programa AI",
  twitterHandle: "@programaai",
}

export type StructuredData = Record<string, unknown>

export interface SeoConfig {
  title?: string
  description?: string
  canonical?: string
  image?: string
  ogType?: string
  noindex?: boolean
  structuredData?: StructuredData | StructuredData[]
}

