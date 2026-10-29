/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-afac4cd2'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "402b66900e731ca748771b6fc5e7a068"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "1fc645669757a3ddfe2d36bba595f9c8"
  }, {
    "url": "pwa-512x512.png",
    "revision": "80ceeb4c5b6f9d9497a2ff7dd14b6b14"
  }, {
    "url": "pwa-192x192.png",
    "revision": "5791c31a115c5a81475b4daadc579a3c"
  }, {
    "url": "index.html",
    "revision": "d3ec108092a9ac0ea988448299a9f939"
  }, {
    "url": "icon.svg",
    "revision": "5790c38f963c15badc3d251ef1b3d7a9"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "b35b2fb8514896d47c69568394cf8d21"
  }, {
    "url": "assets/app.svg",
    "revision": null
  }, {
    "url": "assets/app.png",
    "revision": null
  }, {
    "url": "assets/app.js",
    "revision": null
  }, {
    "url": "assets/app.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "b35b2fb8514896d47c69568394cf8d21"
  }, {
    "url": "icon.svg",
    "revision": "5790c38f963c15badc3d251ef1b3d7a9"
  }, {
    "url": "pwa-192x192.png",
    "revision": "5791c31a115c5a81475b4daadc579a3c"
  }, {
    "url": "pwa-512x512.png",
    "revision": "80ceeb4c5b6f9d9497a2ff7dd14b6b14"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "1fc645669757a3ddfe2d36bba595f9c8"
  }, {
    "url": "manifest.webmanifest",
    "revision": "f926457098b0ee4b13b32f2fee7339bd"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    }), new workbox.CacheableResponsePlugin({
      statuses: [0, 200]
    })]
  }), 'GET');

}));
