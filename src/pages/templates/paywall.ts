import { escapeHtml, getContext, getEnv, getLocale, htmlPage } from '../../lib/paywall';

export const prerender = false;

export function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
  const locale = getLocale(request);
  const context = getContext(url);
  const showSurvey = url.searchParams.get('show_survey') !== 'false';
  const pricePlan = url.searchParams.get('price_plan') ?? 'pro';
  const dismissable = url.searchParams.get('dismissable') === 'true';
  const env = getEnv();

  const contextData = {
    courses: {
      back: true,
      backUrl: env.APP_BASE_URL,
      url: `${env.APP_BASE_URL}/pricing`,
    },
    projects: {
      back: false,
      backUrl: env.APP_BASE_URL,
      url: `${env.APP_BASE_URL}/subscribe`,
    },
    paths: {
      back: true,
      backUrl: env.APP_BASE_URL,
      url: `${env.APP_BASE_URL}/subscribe`,
    },
    workspace: {
      back: true,
      backUrl: env.WORKSPACE_URL,
      url: `${env.APP_BASE_URL}/subscribe`,
    },
  } as const;

  const resolved = contextData[context];
  const surveyHref = `/templates/not_ready_to_upgrade_survey?locale=${encodeURIComponent(locale)}&context=${encodeURIComponent(context)}`;

  return new Response(
    htmlPage(
      locale,
      `<div class="layout-shell layout-shell--centered">
        <article class="modal-card">
          ${dismissable ? '<button onclick="window.parent.postMessage(\'closePaywall\', \'*\')" class="btn btn-ghost btn-close" aria-label="Close dialog">Close</button>' : ''}
          <div class="card-body">
            <h1 class="heading-xl">Move forward with a better plan</h1>
            <p class="text-lg">Choose a subscription that matches your pace and unlock guided projects, assessments, and progress insights.</p>
            <div class="feature-hero" role="img" aria-label="Product dashboard preview with learning milestones"></div>
            ${
              pricePlan === 'pro'
                ? '<p class="text-md">Your current plan is Starter. Switch to Pro for full access.</p>'
                : ''
            }
            ${
              showSurvey
                ? `<div class="inline-feedback">
                    <p class="text-md">Need more time before you choose?</p>
                    <a href="${surveyHref}" class="link-inline" data-trackid="template-default-feedback-link">
                      Tell us why
                    </a>
                  </div>`
                : ''
            }
          </div>
          <div class="card-footer">
            ${
              resolved.back
                ? `<a href="${escapeHtml(resolved.backUrl)}" target="_parent" class="btn btn-ghost" data-trackid="template-go-back-cta">Go back</a>`
                : ''
            }
            <a href="${escapeHtml(resolved.url)}" target="_parent" class="btn btn-primary" data-trackid="template-plan-pro-cta">See Pro plans</a>
          </div>
          <script type="text/javascript" src="/iframeResizer.contentWindow.min.js"></script>
        </article>
      </div>`,
      'Default Plan Dialog',
    ),
    {
      headers: {
        'content-type': 'text/html; charset=utf-8',
      },
    },
  );
}
