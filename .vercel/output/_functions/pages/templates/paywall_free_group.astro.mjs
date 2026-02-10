import { g as getLocale, b as getEnv, h as htmlPage } from '../../chunks/paywall_ByJgr8mX.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
function GET({ request }) {
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
        <script type="text/javascript" src="/iframeResizer.contentWindow.min.js"><\/script>
      </div>`,
      "Free Group Dialog"
    ),
    {
      headers: {
        "content-type": "text/html; charset=utf-8"
      }
    }
  );
}

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
