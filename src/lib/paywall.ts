type Context = 'courses' | 'projects' | 'paths' | 'workspace';

type RuntimeEnv = Record<string, string | undefined>;

export type Campaign = {
  promoKey: string;
  title?: string;
  timer?: {
    days?: number;
    description?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  timeRemainingInSeconds?: number;
  lockup?: { image?: { url?: string; altText?: string } };
  backgroundColor?: string;
  backgroundImage?: {
    image?: { url?: string };
    horizontalAlignment?: string;
    verticalAlignment?: string;
    fit?: string;
  };
  pricingData?: Array<Record<string, number | string | undefined>>;
};

export function getLocale(request: Request): string {
  const url = new URL(request.url);
  const fromQuery = url.searchParams.get('locale');
  if (fromQuery) return normalizeLocale(fromQuery);

  const header = request.headers.get('x-template-lang') ?? request.headers.get('accept-language');
  if (header) return normalizeLocale(header);

  return 'en-US';
}

export function normalizeLocale(value: string): string {
  const clean = value.trim().split(',')[0]?.trim() ?? '';
  if (/^[a-z]{2}-[A-Z]{2}$/.test(clean)) return clean;
  if (/^[a-z]{2}$/.test(clean)) {
    const defaults: Record<string, string> = {
      en: 'en-US',
      es: 'es-ES',
      pt: 'pt-BR',
      de: 'de-DE',
      fr: 'fr-FR',
    };
    return defaults[clean] ?? 'en-US';
  }
  if (/^[a-z]{2}-[a-z]{2}$/i.test(clean)) {
    const [lang, region] = clean.split('-');
    return `${lang.toLowerCase()}-${region.toUpperCase()}`;
  }
  return 'en-US';
}

export function getContext(url: URL): Context {
  const rawContext = url.searchParams.get('context') ?? 'courses';
  const context = rawContext as Context;
  if (['courses', 'projects', 'paths', 'workspace'].includes(context)) {
    return context;
  }
  return 'courses';
}

function runtimeEnv(): RuntimeEnv {
  const envFromMeta = (import.meta as ImportMeta & { env?: RuntimeEnv }).env ?? {};
  const processEnv =
    typeof globalThis === 'object' &&
    'process' in globalThis &&
    typeof (globalThis as { process?: { env?: RuntimeEnv } }).process?.env === 'object'
      ? (globalThis as { process?: { env?: RuntimeEnv } }).process?.env ?? {}
      : {};
  return {
    ...processEnv,
    ...envFromMeta,
  };
}

export function getEnv() {
  const env = runtimeEnv();
  return {
    APP_BASE_URL: env.APP_BASE_URL ?? 'https://app.example.com',
    APP_API_URL: env.APP_API_URL ?? 'https://api.app.example.com',
    CAMPAIGN_SERVICE_URL: env.CAMPAIGN_SERVICE_URL ?? 'https://campaigns.example.com',
    DASHBOARD_URL: env.DASHBOARD_URL ?? 'https://app.example.com/dashboard',
    WORKSPACE_URL: env.WORKSPACE_URL ?? 'https://workspace.app.example.com',
    LEGAL_COOKIES_URL: env.LEGAL_COOKIES_URL ?? 'https://app.example.com/cookies',
  };
}

export function htmlPage(lang: string, body: string, title = 'Template Service'): string {
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

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function campaignVariant(promoKey: string): 'monthly' | 'toy-story' {
  return promoKey.toLowerCase().includes('monthly') ? 'monthly' : 'toy-story';
}

export function shouldRenderCampaign(campaign: Campaign | null): campaign is Campaign {
  if (!campaign) return false;
  if (!campaign.promoKey) return false;
  if (!campaign.lockup?.image?.url) return false;
  if (!campaign.pricingData || campaign.pricingData.length < 2) return false;
  return true;
}

export function money(
  value: unknown,
  options: {
    locale?: string;
    currency?: string;
    symbol?: string;
  } = {},
): string {
  const numeric = Number(value);
  const safeValue = Number.isFinite(numeric) ? numeric : 0;
  const locale = normalizeLocale(options.locale ?? 'en-US');
  const currency = normalizeCurrency(options.currency);

  if (currency) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeValue);
  }

  const symbol = options.symbol?.trim() || '$';
  return `${symbol}${safeValue.toFixed(2)}`;
}

export function detectCurrencyCode(...records: Array<Record<string, unknown> | undefined>): string | undefined {
  for (const record of records) {
    if (!record) continue;
    const candidate =
      record.currency_code ??
      record.currencyCode ??
      record.currency ??
      record.iso_currency_code;
    if (typeof candidate === 'string') {
      const normalized = normalizeCurrency(candidate);
      if (normalized) return normalized;
    }
  }
  return undefined;
}

function normalizeCurrency(value?: string): string | undefined {
  if (!value) return undefined;
  const clean = value.trim().toUpperCase();
  if (/^[A-Z]{3}$/.test(clean)) return clean;
  return undefined;
}

export function sanitizeImageUrl(value: string | undefined): string {
  if (!value) return '';
  const clean = value.trim();
  if (clean.startsWith('/')) return clean;
  if (/^https?:\/\//i.test(clean)) return clean;
  return '';
}

export function sanitizeColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback;
  const clean = value.trim();
  if (/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(clean)) return clean;
  if (/^(rgb|hsl)a?\([\d\s.,%+-]+\)$/i.test(clean)) return clean;
  if (/^(transparent|inherit|currentColor|black|white|gray|grey|red|green|blue)$/i.test(clean)) {
    return clean;
  }
  return fallback;
}

export function sanitizePosition(
  horizontal: string | undefined,
  vertical: string | undefined,
  fallback = 'center center',
): string {
  const h = sanitizePositionToken(horizontal);
  const v = sanitizePositionToken(vertical);
  if (!h || !v) return fallback;
  return `${h} ${v}`;
}

export function sanitizeSize(value: string | undefined, fallback = 'cover'): string {
  if (!value) return fallback;
  const clean = value.trim().toLowerCase();
  if (clean === 'cover' || clean === 'contain' || clean === 'auto') return clean;
  if (/^\d+(\.\d+)?(px|rem|em|%|vw|vh)$/.test(clean)) return clean;
  return fallback;
}

function sanitizePositionToken(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const clean = value.trim().toLowerCase();
  if (/^(left|center|right|top|bottom)$/.test(clean)) return clean;
  if (/^\d+(\.\d+)?(px|rem|em|%|vw|vh)$/.test(clean)) return clean;
  return undefined;
}
