import {
  campaignVariant,
  detectCurrencyCode,
  escapeHtml,
  getContext,
  getEnv,
  getLocale,
  htmlPage,
  money,
  sanitizeColor,
  sanitizeImageUrl,
  sanitizePosition,
  sanitizeSize,
  shouldRenderCampaign,
  type Campaign,
} from '../../lib/paywall';

export const prerender = false;

export async function GET({ request }: { request: Request }) {
  const requestUrl = new URL(request.url);
  const locale = getLocale(request);
  const context = getContext(requestUrl);
  const countryCode = requestUrl.searchParams.get('country_code') ?? 'US';
  const canSkip = requestUrl.searchParams.get('can_skip') === 'true';
  const showSurvey = requestUrl.searchParams.get('show_survey') !== 'false';
  const dismissable = requestUrl.searchParams.get('dismissable') === 'true';
  const env = getEnv();

  const campaignResponse = await fetch(
    `${env.CAMPAIGN_SERVICE_URL}/api/v1/paywall?country_code=${encodeURIComponent(countryCode)}&locale=${encodeURIComponent(locale)}`,
    { headers: { accept: 'application/json' } },
  ).catch(() => null);

  if (!campaignResponse || !campaignResponse.ok) {
    return new Response(null, { status: 204 });
  }

  const payload = (await campaignResponse.json().catch(() => null)) as
    | { eligible?: boolean; data?: Campaign; promoKey?: string }
    | null;

  if (!payload || payload.eligible === false) {
    return new Response(null, { status: 204 });
  }

  const campaign = (payload.data ?? payload) as Campaign;
  if (!shouldRenderCampaign(campaign)) {
    return new Response(null, { status: 204 });
  }

  const variant = campaignVariant(campaign.promoKey);
  const body =
    variant === 'monthly'
      ? renderMonthly(campaign, { locale, context, canSkip, showSurvey, dismissable, env })
      : renderAnnual(campaign, { locale, context, canSkip, showSurvey, dismissable, env });

  return new Response(htmlPage(locale, body, 'Sitewide Plan Dialog'), {
    headers: { 'content-type': 'text/html; charset=utf-8' },
  });
}

function renderAnnual(
  campaign: Campaign,
  options: {
    locale: string;
    context: string;
    canSkip: boolean;
    showSurvey: boolean;
    dismissable: boolean;
    env: ReturnType<typeof getEnv>;
  },
) {
  const { locale, context, canSkip, showSurvey, dismissable, env } = options;
  const ctx = contextDetails(context, env);
  const pricing0 = campaign.pricingData?.[0] ?? {};
  const pricing1 = campaign.pricingData?.[1] ?? {};
  const currencyCode = detectCurrencyCode(pricing0, pricing1);
  const proHref = planHref(env.APP_BASE_URL, campaign.promoKey, ctx.utmSource, {}, 'yearly-per-month');
  const groupHref = planHref(env.APP_BASE_URL, campaign.promoKey, ctx.utmSource, {
    tier: 'group',
  }, 'yearly-per-month');

  return `<div class="layout-shell layout-shell--centered">
    <article class="modal-card sitewide-card">
      ${dismissable ? '<button onclick="window.parent.postMessage(\'closePaywall\', \'*\')" class="btn btn-ghost btn-close" aria-label="Close dialog">Close</button>' : ''}
      <div class="card-body">
        <div class="headline-marker">${escapeHtml(campaign.title ?? 'Pick a plan that fits your workflow')}</div>
        <h2 class="heading-lg">${canSkip ? 'Compare options or continue as is.' : 'Choose a plan for your next milestone'}</h2>
        <p class="text-sm">Switch between individual and group plans with clear pricing and full feature access.</p>
        <div class="toggle-plan">
          <button class="toggle-btn is-active" data-trackid="template-toggle-pro" data-plan="pro">Pro</button>
          <button class="toggle-btn" data-trackid="template-toggle-group" data-plan="group">Group</button>
        </div>
        ${mediaAndTimer(campaign)}
        <div class="plan-grid">
          <section class="plan-card js-plan-pro">
            <span class="plan-strike">${money((Number(pricing0.annual_in_currency_without_discount) || 300) / 12, { locale, currency: currencyCode })}</span>
            <strong class="plan-price">${money((Number(pricing0.annual_in_currency) || 149) / 12, { locale, currency: currencyCode })}<span class="plan-note"> / month billed yearly</span></strong>
            <small class="plan-detail">Full catalog access, guided paths, and skill checks.</small>
            <ul class="feature-list">
              <li>Unlimited lessons and projects</li>
              <li>Structured paths and practical exercises</li>
              <li><a class="btn btn-primary" data-trackid="template-plan-pro-cta" href="${proHref}" target="_parent">Switch to Pro</a></li>
              <li><a class="link-inline" target="_parent" href="${ctx.dashboardUrl}" data-trackid="template-dashboard-link">Continue to dashboard</a></li>
            </ul>
          </section>
          <section class="plan-card js-plan-group is-hidden">
            <span class="plan-strike">${money((Number(pricing1.annual_in_currency_without_discount) || 300) / 12, { locale, currency: currencyCode })}</span>
            <strong class="plan-price">${money((Number(pricing1.annual_in_currency) || 149) / 12, { locale, currency: currencyCode })}<span class="plan-note"> / seat / month</span></strong>
            <small class="plan-detail">Built for manager-led cohorts with centralized controls.</small>
            <ul class="feature-list">
              <li>Member management and assignment tools</li>
              <li>Progress visibility across your cohort</li>
              <li><a class="btn btn-primary" data-trackid="template-plan-group-cta" href="${groupHref}" target="_parent">Switch to Group</a></li>
              <li><a class="link-inline" target="_parent" href="${ctx.dashboardUrl}" data-trackid="template-dashboard-link">Continue to dashboard</a></li>
            </ul>
          </section>
        </div>
        ${
          showSurvey
            ? `<div class="inline-feedback">
                <p class="text-md">Not ready to choose a plan?</p>
                <a href="/templates/not_ready_to_upgrade_survey?locale=${encodeURIComponent(locale)}&context=${encodeURIComponent(context)}" class="link-inline" data-trackid="template-feedback-link">Tell us why</a>
              </div>`
            : ''
        }
        ${
          canSkip
            ? '<button class="btn btn-ghost js-close-dialog">Continue without switching</button>'
            : '<p class="text-sm">You can continue with your current access and switch later.</p>'
        }
      </div>
      ${sharedScripts()}
      <script type="text/javascript" src="/iframeResizer.contentWindow.min.js"></script>
    </article>
  </div>`;
}

function renderMonthly(
  campaign: Campaign,
  options: {
    locale: string;
    context: string;
    canSkip: boolean;
    showSurvey: boolean;
    dismissable: boolean;
    env: ReturnType<typeof getEnv>;
  },
) {
  const { locale, context, canSkip, showSurvey, dismissable, env } = options;
  const ctx = contextDetails(context, env);
  const pricing0 = campaign.pricingData?.[0] ?? {};
  const pricing1 = campaign.pricingData?.[1] ?? {};
  const currencyCode = detectCurrencyCode(pricing0, pricing1);
  const proHref = planHref(env.APP_BASE_URL, campaign.promoKey, ctx.utmSource, {});
  const groupHref = planHref(env.APP_BASE_URL, campaign.promoKey, ctx.utmSource, {
    tier: 'group',
  });

  return `<div class="layout-shell layout-shell--centered">
    <article class="modal-card sitewide-card">
      ${dismissable ? '<button onclick="window.parent.postMessage(\'closePaywall\', \'*\')" class="btn btn-ghost btn-close" aria-label="Close dialog">Close</button>' : ''}
      <div class="card-body">
        <div class="headline-marker">${escapeHtml(campaign.title ?? 'Limited monthly launch offer')}</div>
        <h2 class="heading-lg">${canSkip ? 'Choose now or keep your current plan' : 'A short-term monthly offer is available'}</h2>
        ${mediaAndTimer(campaign)}
        <div class="plan-grid plan-grid--split">
          <section class="plan-card">
            <span class="plan-strike">${money(pricing0.renewal, { locale, currency: currencyCode })}</span>
            <strong class="plan-price">${money(pricing0.first_month, { locale, currency: currencyCode })}<span class="plan-note"> first month</span></strong>
            <small class="plan-detail"><strong>Monthly launch price</strong></small>
            <ul class="feature-list">
              <li>All individual features included</li>
              <li><a class="btn btn-primary" data-trackid="template-plan-pro-cta" href="${proHref}" target="_parent">Switch to Pro</a></li>
              <li><a class="link-inline" target="_parent" href="${ctx.dashboardUrl}" data-trackid="template-dashboard-link">Continue to dashboard</a></li>
            </ul>
          </section>
          <section class="plan-card">
            <span class="plan-strike">${money((Number(pricing1.annual_in_currency_without_discount) || 300) / 12, { locale, currency: currencyCode })}</span>
            <strong class="plan-price">${money((Number(pricing1.annual_in_currency) || 149) / 12, { locale, currency: currencyCode })}<span class="plan-note"> / seat / month</span></strong>
            <small class="plan-detail">Billed yearly, with group administration features.</small>
            <ul class="feature-list">
              <li>Assignment and member controls</li>
              <li><a class="btn btn-primary" data-trackid="template-plan-group-cta" href="${groupHref}" target="_parent">Switch to Group</a></li>
              <li><a class="link-inline" target="_parent" href="${ctx.dashboardUrl}" data-trackid="template-dashboard-link">Continue to dashboard</a></li>
            </ul>
          </section>
        </div>
        ${
          showSurvey
            ? `<div class="inline-feedback">
                <p class="text-md">Not ready to choose a plan?</p>
                <a href="/templates/not_ready_to_upgrade_survey?locale=${encodeURIComponent(locale)}&context=${encodeURIComponent(context)}" class="link-inline" data-trackid="template-feedback-link">Tell us why</a>
              </div>`
            : ''
        }
      </div>
      ${sharedScripts()}
      <script type="text/javascript" src="/iframeResizer.contentWindow.min.js"></script>
    </article>
  </div>`;
}

function contextDetails(context: string, env: ReturnType<typeof getEnv>) {
  const data = {
    courses: { dashboardUrl: env.DASHBOARD_URL, utmSource: 'catalog' },
    projects: { dashboardUrl: env.DASHBOARD_URL, utmSource: 'projects' },
    paths: { dashboardUrl: env.DASHBOARD_URL, utmSource: 'paths' },
    workspace: { dashboardUrl: env.WORKSPACE_URL, utmSource: 'workspace' },
  } as const;

  return data[(context as keyof typeof data) ?? 'courses'] ?? data.courses;
}

function mediaAndTimer(campaign: Campaign) {
  const lockupUrl = sanitizeImageUrl(campaign.lockup?.image?.url);
  const lockupAlt = campaign.lockup?.image?.altText ?? 'Campaign image';
  const bgUrl = sanitizeImageUrl(campaign.backgroundImage?.image?.url);
  const bgColor = sanitizeColor(campaign.backgroundColor, 'inherit');
  const bgPos = sanitizePosition(
    campaign.backgroundImage?.horizontalAlignment,
    campaign.backgroundImage?.verticalAlignment,
  );
  const bgSize = sanitizeSize(campaign.backgroundImage?.fit, 'cover');
  const timer = campaign.timer;
  const timeRemaining = campaign.timeRemainingInSeconds ?? 0;
  const canShowTimer = timer?.days
    ? timeRemaining > 0 && timeRemaining < timer.days * 24 * 60 * 60
    : false;
  const deadlineEpoch = Date.now() + timeRemaining * 1000;
  const safeTimerTextColor = sanitizeColor(timer?.textColor, '#111827');

  return `<div class="media-block">
    <div class="media-panel" style="background-image: ${bgUrl ? `url('${escapeHtml(bgUrl)}')` : 'none'}; background-color: ${escapeHtml(bgColor)}; background-position: ${escapeHtml(bgPos)}; background-size: ${escapeHtml(bgSize)};">
      <img src="${escapeHtml(lockupUrl)}" alt="${escapeHtml(lockupAlt)}" width="295" />
      ${
        canShowTimer
          ? `<div class="countdown-wrap">
              <div class="countdown-title">${escapeHtml(timer?.description ?? 'Offer ends in')}</div>
              <div class="promo-clock js-promo-counter-v2" data-epoch="${deadlineEpoch}" style="color: ${escapeHtml(safeTimerTextColor)};">
                <div class="promo-clock-set"><span class="promo-clock-value days"></span><span class="promo-clock-unit">days</span></div>
                <div class="promo-clock-set"><span class="promo-clock-value hours"></span><span class="promo-clock-unit">hours</span></div>
                <div class="promo-clock-set"><span class="promo-clock-value minutes"></span><span class="promo-clock-unit">minutes</span></div>
                <div class="promo-clock-set"><span class="promo-clock-value seconds"></span><span class="promo-clock-unit">seconds</span></div>
              </div>
            </div>`
          : ''
      }
    </div>
  </div>`;
}

function planHref(
  baseUrl: string,
  promoKey: string,
  utmSource: string,
  extra: Record<string, string>,
  period?: string,
) {
  const url = new URL('/subscribe', baseUrl);
  url.searchParams.set('utm_source', utmSource);
  url.searchParams.set('utm_medium', 'dialog');
  url.searchParams.set('utm_campaign', promoKey);
  if (period) {
    url.searchParams.set('period', period);
  }
  for (const key in extra) {
    if (Object.prototype.hasOwnProperty.call(extra, key)) {
      url.searchParams.set(key, extra[key]);
    }
  }
  return url.toString();
}

function sharedScripts() {
  return `<script type="text/javascript" src="/countdown.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', function () {
      initializePromoClock('.js-promo-counter-v2');

      document.querySelectorAll('.js-close-dialog').forEach(function (node) {
        node.addEventListener('click', function (event) {
          event.preventDefault();
          window.parent.postMessage('closeDialog', '*');
        });
      });

      const buttons = document.querySelectorAll('.toggle-btn');
      const pro = document.querySelector('.js-plan-pro');
      const group = document.querySelector('.js-plan-group');
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          buttons.forEach((candidate) => candidate.classList.remove('is-active'));
          button.classList.add('is-active');
          const isPro = button.getAttribute('data-plan') === 'pro';
          if (pro) pro.classList.toggle('is-hidden', !isPro);
          if (group) group.classList.toggle('is-hidden', isPro);
        });
      });
    });
  </script>`;
}
