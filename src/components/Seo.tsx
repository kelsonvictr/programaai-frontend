import { useEffect } from "react"
import { DEFAULT_SEO, SITE_URL, buildAbsoluteUrl, type SeoConfig } from "../config/seo"

type RequiredSeoConfig = SeoConfig & { title?: string; description?: string }

const upsertMeta = (selector: string, attributes: Record<string, string>) => {
  const head = document.head
  if (!head) return
  const existing = head.querySelector(selector) as HTMLMetaElement | HTMLLinkElement | null
  if (existing) {
    Object.entries(attributes).forEach(([key, value]) => {
      existing.setAttribute(key, value)
    })
    return existing
  }

  const tagName = selector.startsWith("link") ? "link" : "meta"
  const element = document.createElement(tagName)
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value)
  })
  head.appendChild(element)
  return element
}

const setCanonicalLink = (href: string) => {
  const head = document.head
  if (!head) return
  let canonical = head.querySelector<HTMLLinkElement>("#canonical-link")
  if (!canonical) {
    canonical = head.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.createElement("link")
    canonical.id = "canonical-link"
    canonical.rel = "canonical"
    if (!canonical.parentElement) {
      head.appendChild(canonical)
    }
  }
  canonical.href = href
}

const setStructuredData = (data?: SeoConfig["structuredData"]) => {
  const head = document.head
  if (!head) return
  const scriptId = "seo-structured-data"
  const existing = head.querySelector<HTMLScriptElement>(`#${scriptId}`)

  if (!data) {
    existing?.remove()
    return
  }

  const script = existing ?? document.createElement("script")
  script.type = "application/ld+json"
  script.id = scriptId
  script.textContent = JSON.stringify(data, null, 2)
  if (!existing) {
    head.appendChild(script)
  }
}

const normalizeConfig = (config: RequiredSeoConfig = {}) => {
  return {
    title: config.title ?? DEFAULT_SEO.title,
    description: config.description ?? DEFAULT_SEO.description,
    canonical: config.canonical ? buildAbsoluteUrl(config.canonical) : SITE_URL,
    image: config.image ?? DEFAULT_SEO.image,
    ogType: config.ogType ?? "website",
    noindex: config.noindex ?? false,
    structuredData: config.structuredData,
  }
}

const Seo = ({
  title,
  description,
  canonical,
  image,
  ogType,
  noindex,
  structuredData,
}: RequiredSeoConfig) => {
  useEffect(() => {
    if (typeof document === "undefined") return

    const normalized = normalizeConfig({
      title,
      description,
      canonical,
      image,
      ogType,
      noindex,
      structuredData,
    })
    document.title = normalized.title

    upsertMeta('meta[name="description"]', {
      name: "description",
      content: normalized.description,
    })

    upsertMeta('meta[name="robots"]', {
      name: "robots",
      content: normalized.noindex ? "noindex, nofollow" : "index, follow",
    })

    upsertMeta('meta[property="og:title"]', {
      property: "og:title",
      content: normalized.title,
    })

    upsertMeta('meta[property="og:description"]', {
      property: "og:description",
      content: normalized.description,
    })

    upsertMeta('meta[property="og:type"]', {
      property: "og:type",
      content: normalized.ogType,
    })

    upsertMeta('meta[property="og:url"]', {
      property: "og:url",
      content: normalized.canonical,
    })

    upsertMeta('meta[property="og:image"]', {
      property: "og:image",
      content: normalized.image,
    })

    upsertMeta('meta[name="twitter:title"]', {
      name: "twitter:title",
      content: normalized.title,
    })

    upsertMeta('meta[name="twitter:description"]', {
      name: "twitter:description",
      content: normalized.description,
    })

    upsertMeta('meta[name="twitter:image"]', {
      name: "twitter:image",
      content: normalized.image,
    })

    setCanonicalLink(normalized.canonical)

    setStructuredData(normalized.structuredData)

    return () => {
      if (normalized.noindex) {
        upsertMeta('meta[name="robots"]', {
          name: "robots",
          content: "index, follow",
        })
      }
      if (structuredData) {
        setStructuredData(undefined)
      }
    }
  }, [title, description, canonical, image, ogType, noindex, structuredData])

  return null
}

export default Seo
