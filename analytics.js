(() => {
  "use strict";

  const GA_MEASUREMENT_ID = "G-513EMLKBMX";

  globalThis.dataLayer = globalThis.dataLayer || [];
  globalThis.gtag = function gtag() {
    globalThis.dataLayer.push(arguments);
  };

  globalThis.gtag("js", new Date());
  globalThis.gtag("config", GA_MEASUREMENT_ID);
})();
