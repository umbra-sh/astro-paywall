import { getEnv, getLocale, htmlPage } from '../../lib/paywall';

export const prerender = false;

export function GET({ request }: { request: Request }) {
  const locale = getLocale(request);
  const env = getEnv();
  const href = `${env.APP_BASE_URL}/groups/pricing?utm_source=learning-hub&utm_medium=dialog&utm_campaign=free-group`;

  return new Response(
    htmlPage(
      locale,
      `<div class="modal-card group-dialog">
        <div class="card-body">
          <h1 class="heading-xl"><span class="text-accent">Upgrade</span> as a group to continue</h1>
          <p class="text-md">Get shared progress views, managed assignments, and collaborative paths so your learners can move together.</p>
          <div class="feature-hero feature-hero--compact" role="img" aria-label="Group dashboard and assignment overview"></div>
        </div>
        <div class="card-footer">
          <a href="${href}" target="_parent" class="btn btn-primary" data-test_id="upgrade-your-group-link">Upgrade your group</a>
        </div>
        <script type="text/javascript" src="/iframeResizer.contentWindow.min.js"></script>
      </div>`,
      'Free Group Dialog',
    ),
    {
      headers: {
        'content-type': 'text/html; charset=utf-8',
      },
    },
  );
}
