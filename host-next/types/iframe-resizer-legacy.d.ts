declare module 'iframe-resizer/js/iframeResizer.js' {
  type LegacyResizerInstance = {
    iFrameResizer?: {
      removeListeners?: () => void;
    };
  };

  type LegacyResizer = (
    options: {
      checkOrigin: false | string[];
      scrolling: boolean;
      waitForLoad: boolean;
      log: boolean;
      warningTimeout: number;
    },
    target: HTMLIFrameElement,
  ) => LegacyResizerInstance[];

  const iframeResize: LegacyResizer;
  export default iframeResize;
}
