import { renderers } from './renderers.mjs';
import { c as createExports, s as serverEntrypointModule } from './chunks/_@astrojs-ssr-adapter_D6_bkXal.mjs';
import { manifest } from './manifest_BDPlHG3L.mjs';

const serverIslandMap = new Map();;

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/local_health.astro.mjs');
const _page2 = () => import('./pages/paywall.astro.mjs');
const _page3 = () => import('./pages/templates/not_ready_to_upgrade_survey.astro.mjs');
const _page4 = () => import('./pages/templates/paywall.astro.mjs');
const _page5 = () => import('./pages/templates/paywall_free_group.astro.mjs');
const _page6 = () => import('./pages/templates/paywall_free_week.astro.mjs');
const _page7 = () => import('./pages/templates/paywall_sitewide.astro.mjs');
const _page8 = () => import('./pages/index.astro.mjs');
const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/local_health.ts", _page1],
    ["src/pages/paywall.ts", _page2],
    ["src/pages/templates/not_ready_to_upgrade_survey.ts", _page3],
    ["src/pages/templates/paywall.ts", _page4],
    ["src/pages/templates/paywall_free_group.ts", _page5],
    ["src/pages/templates/paywall_free_week.ts", _page6],
    ["src/pages/templates/paywall_sitewide.ts", _page7],
    ["src/pages/index.astro", _page8]
]);

const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    actions: () => import('./noop-entrypoint.mjs'),
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "d8e12b87-d572-4e0b-9db8-3b323437cee8",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;
const _start = 'start';
if (Object.prototype.hasOwnProperty.call(serverEntrypointModule, _start)) ;

export { __astrojsSsrVirtualEntry as default, pageMap };
