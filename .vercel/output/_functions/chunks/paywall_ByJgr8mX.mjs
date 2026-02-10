const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "SITE": undefined, "SSR": true};
function getLocale(request) {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get("locale");
  if (fromQuery) return normalizeLocale(fromQuery);
  const header = request.headers.get("x-template-lang") ?? request.headers.get("accept-language");
  if (header) return normalizeLocale(header);
  return "en-US";
}
function normalizeLocale(value) {
  const clean = value.trim().split(",")[0]?.trim() ?? "";
  if (/^[a-z]{2}-[A-Z]{2}$/.test(clean)) return clean;
  if (/^[a-z]{2}$/.test(clean)) {
    const defaults = {
      en: "en-US",
      es: "es-ES",
      pt: "pt-BR",
      de: "de-DE",
      fr: "fr-FR"
    };
    return defaults[clean] ?? "en-US";
  }
  if (/^[a-z]{2}-[a-z]{2}$/i.test(clean)) {
    const [lang, region] = clean.split("-");
    return `${lang.toLowerCase()}-${region.toUpperCase()}`;
  }
  return "en-US";
}
function getContext(url) {
  const rawContext = url.searchParams.get("context") ?? "courses";
  const context = rawContext;
  if (["courses", "projects", "paths", "workspace"].includes(context)) {
    return context;
  }
  return "courses";
}
function runtimeEnv() {
  const envFromMeta = Object.assign(__vite_import_meta_env__, { _: process.env._ }) ?? {};
  const processEnv = typeof globalThis === "object" && "process" in globalThis && typeof globalThis.process?.env === "object" ? globalThis.process?.env ?? {} : {};
  return {
    ...processEnv,
    ...envFromMeta
  };
}
function getEnv() {
  const env = runtimeEnv();
  return {
    APP_BASE_URL: env.APP_BASE_URL ?? "https://app.example.com",
    APP_API_URL: env.APP_API_URL ?? "https://api.app.example.com",
    CAMPAIGN_SERVICE_URL: env.CAMPAIGN_SERVICE_URL ?? "https://campaigns.example.com",
    DASHBOARD_URL: env.DASHBOARD_URL ?? "https://app.example.com/dashboard",
    WORKSPACE_URL: env.WORKSPACE_URL ?? "https://workspace.app.example.com",
    LEGAL_COOKIES_URL: env.LEGAL_COOKIES_URL ?? "https://app.example.com/cookies"
  };
}
function htmlPage(lang, body, title = "Template Service") {
  return `<!doctype html>
<html lang="${escapeHtml(lang)}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <link rel="stylesheet" href="/paywall.css" />
  </head>
  <body>
    ${body}
  </body>
</html>`;
}
function escapeHtml(input) {
  return input.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
function campaignVariant(promoKey) {
  return promoKey.toLowerCase().includes("monthly") ? "monthly" : "toy-story";
}
function shouldRenderCampaign(campaign) {
  if (!campaign) return false;
  if (!campaign.promoKey) return false;
  if (!campaign.lockup?.image?.url) return false;
  if (!campaign.pricingData || campaign.pricingData.length < 2) return false;
  return true;
}
function money(value, options = {}) {
  const numeric = Number(value);
  const safeValue = Number.isFinite(numeric) ? numeric : 0;
  const locale = normalizeLocale(options.locale ?? "en-US");
  const currency = normalizeCurrency(options.currency);
  if (currency) {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(safeValue);
  }
  const symbol = options.symbol?.trim() || "$";
  return `${symbol}${safeValue.toFixed(2)}`;
}
function detectCurrencyCode(...records) {
  for (const record of records) {
    if (!record) continue;
    const candidate = record.currency_code ?? record.currencyCode ?? record.currency ?? record.iso_currency_code;
    if (typeof candidate === "string") {
      const normalized = normalizeCurrency(candidate);
      if (normalized) return normalized;
    }
  }
  return void 0;
}
function normalizeCurrency(value) {
  if (!value) return void 0;
  const clean = value.trim().toUpperCase();
  if (/^[A-Z]{3}$/.test(clean)) return clean;
  return void 0;
}
function sanitizeImageUrl(value) {
  if (!value) return "";
  const clean = value.trim();
  if (clean.startsWith("/")) return clean;
  if (/^https?:\/\//i.test(clean)) return clean;
  return "";
}
function sanitizeColor(value, fallback) {
  if (!value) return fallback;
  const clean = value.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(clean)) return clean;
  if (/^(rgb|hsl)a?\([\d\s.,%+-]+\)$/i.test(clean)) return clean;
  if (/^(transparent|inherit|currentColor|black|white|gray|grey|red|green|blue)$/i.test(clean)) {
    return clean;
  }
  return fallback;
}
function sanitizePosition(horizontal, vertical, fallback = "center center") {
  const h = sanitizePositionToken(horizontal);
  const v = sanitizePositionToken(vertical);
  if (!h || !v) return fallback;
  return `${h} ${v}`;
}
function sanitizeSize(value, fallback = "cover") {
  if (!value) return fallback;
  const clean = value.trim().toLowerCase();
  if (clean === "cover" || clean === "contain" || clean === "auto") return clean;
  if (/^\d+(\.\d+)?(px|rem|em|%|vw|vh)$/.test(clean)) return clean;
  return fallback;
}
function sanitizePositionToken(value) {
  if (!value) return void 0;
  const clean = value.trim().toLowerCase();
  if (/^(left|center|right|top|bottom)$/.test(clean)) return clean;
  if (/^\d+(\.\d+)?(px|rem|em|%|vw|vh)$/.test(clean)) return clean;
  return void 0;
}

export { getContext as a, getEnv as b, campaignVariant as c, detectCurrencyCode as d, escapeHtml as e, sanitizeImageUrl as f, getLocale as g, htmlPage as h, sanitizeColor as i, sanitizePosition as j, sanitizeSize as k, money as m, shouldRenderCampaign as s };
