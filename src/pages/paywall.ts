import { escapeHtml, getContext, getEnv, getLocale, htmlPage } from '../lib/paywall.js';

export const prerender = false;

// Survey variant
function renderSurvey(params: {
  locale: string;
  context: 'courses' | 'projects' | 'paths' | 'workspace';
  env: ReturnType<typeof getEnv>;
  dismissable: boolean;
  showSurvey: boolean;
  pricePlan: string;
}) {
  const { dismissable } = params;
  
  return `
  <div class="layout-shell layout-shell--centered">
    <article class="modal-card">
      ${dismissable ? '<button onclick="window.parent.postMessage(\'closePaywall\', \'*\')" class="btn btn-ghost btn-close" aria-label="Close dialog">Close</button>' : ''}
      <div class="card-body">
        <h1 class="heading-lg">Help us improve</h1>
        <p class="text-lg">What would make you ready to upgrade? Your feedback helps us build better features.</p>
        
        <div class="list-panel">
          <ul class="option-list">
            <li class="radio-item">
              <label>
                <input type="radio" name="reason" class="radio-input" value="price">
                <span class="radio-indicator"></span>
                <span class="radio-text">Price is too high for me right now</span>
              </label>
            </li>
            <li class="radio-item">
              <label>
                <input type="radio" name="reason" class="radio-input" value="features">
                <span class="radio-indicator"></span>
                <span class="radio-text">Missing features I need</span>
              </label>
            </li>
            <li class="radio-item">
              <label>
                <input type="radio" name="reason" class="radio-input" value="time">
                <span class="radio-indicator"></span>
                <span class="radio-text">Not enough time to use it</span>
              </label>
            </li>
            <li class="radio-item">
              <label>
                <input type="radio" name="reason" class="radio-input" value="other">
                <span class="radio-indicator"></span>
                <span class="radio-text">Something else</span>
              </label>
            </li>
          </ul>
          
          <div id="other-reason" class="is-hidden" style="margin-top: 16px;">
            <label style="color: var(--pw-text);">Tell us more:</label>
            <textarea class="text-input" rows="3" placeholder="What's holding you back?"></textarea>
          </div>
        </div>
      </div>
      <div class="card-footer">
        ${dismissable ? `<button onclick="window.parent.postMessage(\'closePaywall\', \'*\')" class="btn btn-ghost">Skip</button>` : ''}
        <button onclick="window.parent.postMessage(\'closePaywall\', \'*\')" class="btn btn-primary" data-trackid="template-survey-submit">Submit feedback</button>
      </div>
      <script type="text/javascript" src="/iframeResizer.contentWindow.min.js"></script>
      <script>
        document.querySelectorAll('input[name="reason"]').forEach(radio => {
          radio.addEventListener('change', (e) => {
            const otherDiv = document.getElementById('other-reason');
            if (e.target.value === 'other') {
              otherDiv.classList.remove('is-hidden');
            } else {
              otherDiv.classList.add('is-hidden');
            }
          });
        });
      </script>
    </article>
  </div>`;
}

// Paywall variant configurations
const VARIANTS = {
  default: {
    title: 'Default Plan Dialog',
    render: renderDefault,
  },
  sitewide: {
    title: 'Campaign Paywall',
    render: renderSitewide,
  },
  'free-week': {
    title: 'Free Week Offer',
    render: renderFreeWeek,
  },
  'free-group': {
    title: 'Group Access',
    render: renderFreeGroup,
  },
  survey: {
    title: 'Feedback Survey',
    render: renderSurvey,
  },
};

export function GET({ request }: { request: Request }) {
  const url = new URL(request.url);
  const variant = url.searchParams.get('variant') ?? 'default';
  
  if (!(variant in VARIANTS)) {
    return new Response(
      htmlPage(
        'en',
        `<div style="padding: 40px; text-align: center; color: #f59e0b;">
          <h1>Invalid Variant</h1>
          <p>Available variants: ${Object.keys(VARIANTS).join(', ')}</p>
        </div>`,
        'Error'
      ),
      { headers: { 'content-type': 'text/html; charset=utf-8' } }
    );
  }

  const config = VARIANTS[variant as keyof typeof VARIANTS];
  const locale = getLocale(request);
  const context = getContext(url);
  const env = getEnv();
  
  // Common params
  const dismissable = url.searchParams.get('dismissable') === 'true';
  const showSurvey = url.searchParams.get('show_survey') !== 'false';
  const pricePlan = url.searchParams.get('price_plan') ?? 'pro';

  const body = config.render({ locale, context, env, dismissable, showSurvey, pricePlan });

  return new Response(
    htmlPage(locale, body, config.title),
    {
      headers: {
        'content-type': 'text/html; charset=utf-8',
      },
    }
  );
}

// Render functions for each variant
function renderDefault(params: {
  locale: string;
  context: 'courses' | 'projects' | 'paths' | 'workspace';
  env: ReturnType<typeof getEnv>;
  dismissable: boolean;
  showSurvey: boolean;
  pricePlan: string;
}) {
  const { locale, context, env, dismissable, showSurvey, pricePlan } = params;

  const contextData = {
    courses: { back: true, backUrl: env.APP_BASE_URL, url: `${env.APP_BASE_URL}/pricing` },
    projects: { back: false, backUrl: env.APP_BASE_URL, url: `${env.APP_BASE_URL}/subscribe` },
    paths: { back: true, backUrl: env.APP_BASE_URL, url: `${env.APP_BASE_URL}/subscribe` },
    workspace: { back: true, backUrl: env.WORKSPACE_URL, url: `${env.APP_BASE_URL}/subscribe` },
  };

  const resolved = contextData[context];
  const surveyHref = `/paywall?variant=survey&locale=${encodeURIComponent(locale)}&context=${encodeURIComponent(context)}`;

  return `<div class="layout-shell layout-shell--centered">
    <article class="modal-card">
      ${dismissable ? '<button onclick="window.parent.postMessage(\'closePaywall\', \'*\')" class="btn btn-ghost btn-close" aria-label="Close dialog">Close</button>' : ''}
      <div class="card-body">
        <h1 class="heading-xl">Move forward with a better plan</h1>
        <p class="text-lg">Choose a subscription that matches your pace and unlock guided projects, assessments, and progress insights.</p>
        <div class="feature-hero" role="img" aria-label="Product dashboard preview with learning milestones"></div>
        ${pricePlan === 'pro' ? '<p class="text-md">Your current plan is Starter. Switch to Pro for full access.</p>' : ''}
        ${showSurvey ? `<div class="inline-feedback">
          <p class="text-md">Need more time before you choose?</p>
          <a href="${surveyHref}" class="link-inline" data-trackid="template-default-feedback-link">Tell us why</a>
        </div>` : ''}
      </div>
      <div class="card-footer">
        ${resolved.back ? `<a href="${escapeHtml(resolved.backUrl)}" target="_parent" class="btn btn-ghost" data-trackid="template-go-back-cta">Go back</a>` : ''}
        <a href="${escapeHtml(resolved.url)}" target="_parent" class="btn btn-primary" data-trackid="template-plan-pro-cta">See Pro plans</a>
      </div>
      <script type="text/javascript" src="/iframeResizer.contentWindow.min.js"></script>
    </article>
  </div>`;
}

function renderSitewide(params: {
  locale: string;
  context: 'courses' | 'projects' | 'paths' | 'workspace';
  env: ReturnType<typeof getEnv>;
  dismissable: boolean;
  showSurvey: boolean;
  pricePlan: string;
}) {
  const { env, dismissable } = params;
  
  // Simplified sitewide variant with campaign styling
  return `<div class="layout-shell layout-shell--centered">
    <article class="modal-card sitewide-card">
      ${dismissable ? '<button onclick="window.parent.postMessage(\'closePaywall\', \'*\')" class="btn btn-ghost btn-close" aria-label="Close dialog">Close</button>' : ''}
      <div class="card-body">
        <span class="headline-marker">Limited Time Offer</span>
        <h1 class="heading-xl">Unlock everything with Pro</h1>
        <p class="text-lg">Get unlimited access to all courses, projects, and career paths. Join thousands of developers leveling up their skills.</p>
        
        <div class="countdown-wrap">
          <div class="countdown-title">Offer ends in:</div>
          <div class="promo-clock">
            <div class="promo-clock-set"><span class="promo-clock-value" id="days">02</span><span class="promo-clock-unit">days</span></div>
            <div class="promo-clock-set"><span class="promo-clock-value" id="hours">14</span><span class="promo-clock-unit">hours</span></div>
            <div class="promo-clock-set"><span class="promo-clock-value" id="minutes">35</span><span class="promo-clock-unit">mins</span></div>
            <div class="promo-clock-set"><span class="promo-clock-value" id="seconds">48</span><span class="promo-clock-unit">secs</span></div>
          </div>
        </div>

        <div class="plan-grid plan-grid--split">
          <div class="plan-card">
            <span class="plan-strike">$49/month</span>
            <span class="plan-price">$29/month</span>
            <span class="plan-note">Billed annually</span>
            <span class="plan-detail">Save $240/year</span>
          </div>
          <div class="plan-card">
            <span class="plan-price">$39/month</span>
            <span class="plan-note">Billed monthly</span>
            <span class="plan-detail">Cancel anytime</span>
          </div>
        </div>
      </div>
      <div class="card-footer">
        ${dismissable ? `<button onclick="window.parent.postMessage(\'closePaywall\', \'*\')" class="btn btn-ghost">Maybe later</button>` : ''}
        <a href="${env.APP_BASE_URL}/subscribe" target="_parent" class="btn btn-primary" data-trackid="template-sitewide-cta">Get Pro Access</a>
      </div>
      <script type="text/javascript" src="/iframeResizer.contentWindow.min.js"></script>
      <script src="/countdown.js"></script>
    </article>
  </div>`;
}

function renderFreeWeek(params: {
  locale: string;
  context: 'courses' | 'projects' | 'paths' | 'workspace';
  env: ReturnType<typeof getEnv>;
  dismissable: boolean;
  showSurvey: boolean;
  pricePlan: string;
}) {
  const { env, dismissable, context } = params;
  
  return `<div class="layout-shell layout-shell--centered">
    <article class="modal-card">
      ${dismissable ? '<button onclick="window.parent.postMessage(\'closePaywall\', \'*\')" class="btn btn-ghost btn-close" aria-label="Close dialog">Close</button>' : ''}
      <div class="card-body surface-highlight">
        <span class="lockup-mark"><span class="lockup-pill">Free Access</span></span>
        <h1 class="heading-xl">Try everything free for 7 days</h1>
        <p class="text-lg">Get full access to all ${context} content. No credit card required. Cancel anytime during your trial.</p>
        
        <div class="feature-hero feature-hero--compact" role="img" aria-label="Free week preview"></div>
        
        <ul class="feature-list">
          <li>Unlimited access to all courses and projects</li>
          <li>Personalized learning path recommendations</li>
          <li>Progress tracking and skill assessments</li>
          <li>Community access and mentor support</li>
        </ul>
      </div>
      <div class="card-footer">
        ${dismissable ? `<button onclick="window.parent.postMessage(\'closePaywall\', \'*\')" class="btn btn-ghost">Not now</button>` : ''}
        <a href="${env.APP_BASE_URL}/trial" target="_parent" class="btn btn-primary" data-trackid="template-free-week-cta">Start Free Trial</a>
      </div>
      <script type="text/javascript" src="/iframeResizer.contentWindow.min.js"></script>
    </article>
  </div>`;
}

function renderFreeGroup(params: {
  locale: string;
  context: 'courses' | 'projects' | 'paths' | 'workspace';
  env: ReturnType<typeof getEnv>;
  dismissable: boolean;
  showSurvey: boolean;
  pricePlan: string;
}) {
  const { env, dismissable } = params;
  
  return `<div class="layout-shell layout-shell--centered">
    <article class="modal-card">
      ${dismissable ? '<button onclick="window.parent.postMessage(\'closePaywall\', \'*\')" class="btn btn-ghost btn-close" aria-label="Close dialog">Close</button>' : ''}
      <div class="card-body">
        <span class="lockup-mark"><span class="lockup-pill">Team Access</span></span>
        <h1 class="heading-xl">Unlock for your whole team</h1>
        <p class="text-lg">Share access with up to 5 team members. Perfect for small teams and study groups.</p>
        
        <div class="media-block">
          <div class="media-panel" style="background-image: linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(234, 88, 12, 0.05)); padding: 24px; text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 12px;">👥</div>
            <p style="margin: 0; color: var(--pw-text);">5 members included</p>
            <p style="margin: 8px 0 0; color: var(--pw-text-soft); font-size: 0.9rem;">$99/month total</p>
          </div>
        </div>
        
        <p class="text-md" style="margin-top: 20px;">Need more seats? <a href="#" target="_parent" class="link-inline">Contact sales</a></p>
      </div>
      <div class="card-footer">
        ${dismissable ? `<button onclick="window.parent.postMessage(\'closePaywall\', \'*\')" class="btn btn-ghost">Individual plan</button>` : ''}
        <a href="${env.APP_BASE_URL}/team" target="_parent" class="btn btn-primary" data-trackid="template-group-cta">Get Team Access</a>
      </div>
      <script type="text/javascript" src="/iframeResizer.contentWindow.min.js"></script>
    </article>
  </div>`;
}
