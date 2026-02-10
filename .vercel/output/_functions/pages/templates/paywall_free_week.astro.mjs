import { g as getLocale, e as escapeHtml, b as getEnv, h as htmlPage } from '../../chunks/paywall_ByJgr8mX.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
function GET({ request }) {
  const url = new URL(request.url);
  const locale = getLocale(request);
  const userId = url.searchParams.get("user_id");
  const safeUserId = userId ? escapeHtml(userId) : null;
  const env = getEnv();
  const ctaLabel = "Start your free week";
  const cta = safeUserId ? `<form action="${env.APP_API_URL}/trial-week" method="post" target="_parent">
        <input type="hidden" name="user[user_id]" value="${safeUserId}" />
        <button class="btn btn-primary" type="submit" data-trackid="template-click-free-week-enroll">${ctaLabel}</button>
      </form>` : `<a href="${env.APP_BASE_URL}/trial-week" class="btn btn-primary" target="_parent" data-trackid="template-click-free-week-enroll">${ctaLabel}</a>`;
  return new Response(
    htmlPage(
      locale,
      `<article class="modal-card dialog-trial">
        <div class="card-body surface-highlight">
          <div class="lockup-mark" aria-hidden="true">
            <span class="lockup-pill">7 days</span>
          </div>
          <strong class="heading-lg">Try every feature for one week</strong>
          <p class="text-md">Preview the complete product experience, including interactive lessons and project workspaces, at no cost.</p>
          <div class="cta-row">${cta}</div>
        </div>
        <script type="text/javascript" src="/iframeResizer.contentWindow.min.js"><\/script>
      </article>`,
      "Free Week Dialog"
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
