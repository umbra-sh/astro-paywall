'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

const DEFAULT_PAYWALL_URL =
  'http://localhost:4321/templates/paywall?context=courses&dismissable=true&show_survey=true';

const valuePoints = [
  {
    label: 'Ruby-to-Astro migration energy',
    copy: 'From cringy Ruby whale to blazing Astro speed, without breaking host integrations.',
  },
  {
    label: 'Embed-first architecture',
    copy: 'Drop in an iframe, keep parent navigation control, and listen for close events cleanly.',
  },
  {
    label: 'Campaign velocity',
    copy: 'Launch new paywall variants fast while preserving stable route contracts across teams.',
  },
];

type LegacyResizerInstance = {
  iFrameResizer?: {
    removeListeners?: () => void;
  };
};

export default function HomePage() {
  const [isOpen, setIsOpen] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const paywallUrl = process.env.NEXT_PUBLIC_PAYWALL_URL ?? DEFAULT_PAYWALL_URL;

  const allowedOrigin = useMemo(() => {
    try {
      return new URL(paywallUrl).origin;
    } catch {
      return '';
    }
  }, [paywallUrl]);

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (allowedOrigin && event.origin !== allowedOrigin) {
        return;
      }

      if (event.data === 'closePaywall' || event.data === 'closeDialog') {
        setIsOpen(false);
      }
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [allowedOrigin]);

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const iframe = frameRef.current;
    if (!iframe) return;

    let cancelled = false;
    let instances: LegacyResizerInstance[] = [];

    type ResizerFn = (
      options: {
        checkOrigin: false | string[];
        scrolling: boolean;
        waitForLoad: boolean;
        log: boolean;
        warningTimeout: number;
      },
      target: HTMLIFrameElement,
    ) => LegacyResizerInstance[];

    void import('iframe-resizer/js/iframeResizer.js').then((module) => {
      if (cancelled) return;

      const candidate = module as unknown as { default?: ResizerFn } | ResizerFn;
      const globalCandidate = (window as Window & { iFrameResize?: ResizerFn }).iFrameResize;
      const iframeResize =
        globalCandidate ?? (typeof candidate === 'function' ? candidate : candidate.default);

      if (typeof iframeResize !== 'function') {
        return;
      }

      instances = iframeResize(
        {
          checkOrigin: allowedOrigin ? [allowedOrigin] : false,
          scrolling: false,
          waitForLoad: true,
          log: false,
          warningTimeout: 0,
        },
        iframe,
      );
    });

    return () => {
      cancelled = true;
      for (const instance of instances) {
        instance.iFrameResizer?.removeListeners?.();
      }
    };
  }, [isOpen, allowedOrigin]);

  return (
    <main className="pageShell">
      <header className="topBar glassPanel">
        <div className="brandMark">
          <span className="brandOrb" aria-hidden="true" />
          <strong>astro-paywall</strong>
        </div>
        <nav className="topNav" aria-label="Main">
          <a href="#features">Features</a>
          <a href="#proof">Proof</a>
          <a href="#launch">Launch</a>
        </nav>
        <button className="ghostBtn" onClick={() => setIsOpen(true)} type="button">
          Try live paywall
        </button>
      </header>

      <section className="heroBand glassPanel" id="launch">
        <p className="eyebrow">From cringy Ruby whale to blazing Astro speed</p>
        <h1>Ship gorgeous paywall journeys that feel native to your product</h1>
        <p className="copy">
          astro-paywall gives your team production-ready templates, campaign-aware routes, and
          host-safe iframe behavior in one clean service.
        </p>
        <div className="actions">
          <button className="primaryBtn" onClick={() => setIsOpen(true)} type="button">
            Open interactive paywall
          </button>
          <a href="#features" className="textLink">
            Explore components
          </a>
        </div>
        <div className="metricGrid" id="proof">
          <article>
            <strong>Astro SSR</strong>
            <span>server-rendered templates with lightweight payloads</span>
          </article>
          <article>
            <strong>6 routes</strong>
            <span>paywall and survey contracts your host can trust</span>
          </article>
          <article>
            <strong>Zero rewrites</strong>
            <span>keep your app shell; swap in faster monetization UX</span>
          </article>
        </div>
      </section>

      <section className="featureSection" id="features">
        {valuePoints.map((point) => (
          <article key={point.label} className="featureCard glassPanel">
            <h2>{point.label}</h2>
            <p>{point.copy}</p>
          </article>
        ))}
      </section>

      <section className="endpointPanel glassPanel">
        <p className="endpointLabel">Live embed endpoint</p>
        <code className="endpoint">{paywallUrl}</code>
      </section>

      {isOpen ? (
        <div
          className="modalBackdrop"
          role="dialog"
          aria-modal="true"
          aria-label="Embedded paywall"
          onClick={() => setIsOpen(false)}
        >
          <div className="frameShell" onClick={(event) => event.stopPropagation()}>
            <iframe
              id="paywall-frame"
              ref={frameRef}
              title="Astro Paywall"
              src={paywallUrl}
              className="paywallFrame"
              loading="eager"
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
          <button
            className="modalClose"
            onClick={() => setIsOpen(false)}
            type="button"
            aria-label="Close paywall"
          >
            Close
          </button>
        </div>
      ) : null}
    </main>
  );
}
