try {
  self["workbox:core:7.0.0"] && _();
} catch {
}
const E = (n, ...e) => {
  let t = n;
  return e.length > 0 && (t += ` :: ${JSON.stringify(e)}`), t;
}, O = E;
class l extends Error {
  constructor(e, t) {
    const s = O(e, t);
    super(s), this.name = e, this.details = t;
  }
}
const f = {
  googleAnalytics: "googleAnalytics",
  precache: "precache-v2",
  prefix: "workbox",
  runtime: "runtime",
  suffix: typeof registration < "u" ? registration.scope : ""
}, C = (n) => [f.prefix, n, f.suffix].filter((e) => e && e.length > 0).join("-"), I = (n) => {
  for (const e of Object.keys(f))
    n(e);
}, U = {
  updateDetails: (n) => {
    I((e) => {
      typeof n[e] == "string" && (f[e] = n[e]);
    });
  },
  getGoogleAnalyticsName: (n) => n || C(f.googleAnalytics),
  getPrecacheName: (n) => n || C(f.precache),
  getPrefix: () => f.prefix,
  getRuntimeName: (n) => n || C(f.runtime),
  getSuffix: () => f.suffix
};
function P(n, e) {
  const t = e();
  return n.waitUntil(t), t;
}
try {
  self["workbox:precaching:7.0.0"] && _();
} catch {
}
const M = "__WB_REVISION__";
function q(n) {
  if (!n)
    throw new l("add-to-cache-list-unexpected-type", { entry: n });
  if (typeof n == "string") {
    const r = new URL(n, location.href);
    return {
      cacheKey: r.href,
      url: r.href
    };
  }
  const { revision: e, url: t } = n;
  if (!t)
    throw new l("add-to-cache-list-unexpected-type", { entry: n });
  if (!e) {
    const r = new URL(t, location.href);
    return {
      cacheKey: r.href,
      url: r.href
    };
  }
  const s = new URL(t, location.href), a = new URL(t, location.href);
  return s.searchParams.set(M, e), {
    cacheKey: s.href,
    url: a.href
  };
}
class W {
  constructor() {
    this.updatedURLs = [], this.notUpdatedURLs = [], this.handlerWillStart = async ({ request: e, state: t }) => {
      t && (t.originalRequest = e);
    }, this.cachedResponseWillBeUsed = async ({ event: e, state: t, cachedResponse: s }) => {
      if (e.type === "install" && t && t.originalRequest && t.originalRequest instanceof Request) {
        const a = t.originalRequest.url;
        s ? this.notUpdatedURLs.push(a) : this.updatedURLs.push(a);
      }
      return s;
    };
  }
}
class D {
  constructor({ precacheController: e }) {
    this.cacheKeyWillBeUsed = async ({ request: t, params: s }) => {
      const a = (s == null ? void 0 : s.cacheKey) || this._precacheController.getCacheKeyForURL(t.url);
      return a ? new Request(a, { headers: t.headers }) : t;
    }, this._precacheController = e;
  }
}
let p;
function A() {
  if (p === void 0) {
    const n = new Response("");
    if ("body" in n)
      try {
        new Response(n.body), p = !0;
      } catch {
        p = !1;
      }
    p = !1;
  }
  return p;
}
async function S(n, e) {
  let t = null;
  if (n.url && (t = new URL(n.url).origin), t !== self.location.origin)
    throw new l("cross-origin-copy-response", { origin: t });
  const s = n.clone(), a = {
    headers: new Headers(s.headers),
    status: s.status,
    statusText: s.statusText
  }, r = e ? e(a) : a, c = A() ? s.body : await s.blob();
  return new Response(c, r);
}
const H = (n) => new URL(String(n), location.href).href.replace(new RegExp(`^${location.origin}`), "");
function K(n, e) {
  const t = new URL(n);
  for (const s of e)
    t.searchParams.delete(s);
  return t.href;
}
async function j(n, e, t, s) {
  const a = K(e.url, t);
  if (e.url === a)
    return n.match(e, s);
  const r = Object.assign(Object.assign({}, s), { ignoreSearch: !0 }), c = await n.keys(e, r);
  for (const i of c) {
    const o = K(i.url, t);
    if (a === o)
      return n.match(i, s);
  }
}
class F {
  constructor() {
    this.promise = new Promise((e, t) => {
      this.resolve = e, this.reject = t;
    });
  }
}
const B = /* @__PURE__ */ new Set();
async function $() {
  for (const n of B)
    await n();
}
function V(n) {
  return new Promise((e) => setTimeout(e, n));
}
try {
  self["workbox:strategies:7.0.0"] && _();
} catch {
}
function m(n) {
  return typeof n == "string" ? new Request(n) : n;
}
class G {
  constructor(e, t) {
    this._cacheKeys = {}, Object.assign(this, t), this.event = t.event, this._strategy = e, this._handlerDeferred = new F(), this._extendLifetimePromises = [], this._plugins = [...e.plugins], this._pluginStateMap = /* @__PURE__ */ new Map();
    for (const s of this._plugins)
      this._pluginStateMap.set(s, {});
    this.event.waitUntil(this._handlerDeferred.promise);
  }
  async fetch(e) {
    const { event: t } = this;
    let s = m(e);
    if (s.mode === "navigate" && t instanceof FetchEvent && t.preloadResponse) {
      const c = await t.preloadResponse;
      if (c)
        return c;
    }
    const a = this.hasCallback("fetchDidFail") ? s.clone() : null;
    try {
      for (const c of this.iterateCallbacks("requestWillFetch"))
        s = await c({ request: s.clone(), event: t });
    } catch (c) {
      if (c instanceof Error)
        throw new l("plugin-error-request-will-fetch", {
          thrownErrorMessage: c.message
        });
    }
    const r = s.clone();
    try {
      let c;
      c = await fetch(s, s.mode === "navigate" ? void 0 : this._strategy.fetchOptions);
      for (const i of this.iterateCallbacks("fetchDidSucceed"))
        c = await i({
          event: t,
          request: r,
          response: c
        });
      return c;
    } catch (c) {
      throw a && await this.runCallbacks("fetchDidFail", {
        error: c,
        event: t,
        originalRequest: a.clone(),
        request: r.clone()
      }), c;
    }
  }
  async fetchAndCachePut(e) {
    const t = await this.fetch(e), s = t.clone();
    return this.waitUntil(this.cachePut(e, s)), t;
  }
  async cacheMatch(e) {
    const t = m(e);
    let s;
    const { cacheName: a, matchOptions: r } = this._strategy, c = await this.getCacheKey(t, "read"), i = Object.assign(Object.assign({}, r), { cacheName: a });
    s = await caches.match(c, i);
    for (const o of this.iterateCallbacks("cachedResponseWillBeUsed"))
      s = await o({
        cacheName: a,
        matchOptions: r,
        cachedResponse: s,
        request: c,
        event: this.event
      }) || void 0;
    return s;
  }
  async cachePut(e, t) {
    const s = m(e);
    await V(0);
    const a = await this.getCacheKey(s, "write");
    if (!t)
      throw new l("cache-put-with-no-response", {
        url: H(a.url)
      });
    const r = await this._ensureResponseSafeToCache(t);
    if (!r)
      return !1;
    const { cacheName: c, matchOptions: i } = this._strategy, o = await self.caches.open(c), h = this.hasCallback("cacheDidUpdate"), g = h ? await j(
      o,
      a.clone(),
      ["__WB_REVISION__"],
      i
    ) : null;
    try {
      await o.put(a, h ? r.clone() : r);
    } catch (u) {
      if (u instanceof Error)
        throw u.name === "QuotaExceededError" && await $(), u;
    }
    for (const u of this.iterateCallbacks("cacheDidUpdate"))
      await u({
        cacheName: c,
        oldResponse: g,
        newResponse: r.clone(),
        request: a,
        event: this.event
      });
    return !0;
  }
  async getCacheKey(e, t) {
    const s = `${e.url} | ${t}`;
    if (!this._cacheKeys[s]) {
      let a = e;
      for (const r of this.iterateCallbacks("cacheKeyWillBeUsed"))
        a = m(await r({
          mode: t,
          request: a,
          event: this.event,
          params: this.params
        }));
      this._cacheKeys[s] = a;
    }
    return this._cacheKeys[s];
  }
  hasCallback(e) {
    for (const t of this._strategy.plugins)
      if (e in t)
        return !0;
    return !1;
  }
  async runCallbacks(e, t) {
    for (const s of this.iterateCallbacks(e))
      await s(t);
  }
  *iterateCallbacks(e) {
    for (const t of this._strategy.plugins)
      if (typeof t[e] == "function") {
        const s = this._pluginStateMap.get(t);
        yield (r) => {
          const c = Object.assign(Object.assign({}, r), { state: s });
          return t[e](c);
        };
      }
  }
  waitUntil(e) {
    return this._extendLifetimePromises.push(e), e;
  }
  async doneWaiting() {
    let e;
    for (; e = this._extendLifetimePromises.shift(); )
      await e;
  }
  destroy() {
    this._handlerDeferred.resolve(null);
  }
  async _ensureResponseSafeToCache(e) {
    let t = e, s = !1;
    for (const a of this.iterateCallbacks("cacheWillUpdate"))
      if (t = await a({
        request: this.request,
        response: t,
        event: this.event
      }) || void 0, s = !0, !t)
        break;
    return s || t && t.status !== 200 && (t = void 0), t;
  }
}
class Q {
  constructor(e = {}) {
    this.cacheName = U.getRuntimeName(e.cacheName), this.plugins = e.plugins || [], this.fetchOptions = e.fetchOptions, this.matchOptions = e.matchOptions;
  }
  handle(e) {
    const [t] = this.handleAll(e);
    return t;
  }
  handleAll(e) {
    e instanceof FetchEvent && (e = {
      event: e,
      request: e.request
    });
    const t = e.event, s = typeof e.request == "string" ? new Request(e.request) : e.request, a = "params" in e ? e.params : void 0, r = new G(this, { event: t, request: s, params: a }), c = this._getResponse(r, s, t), i = this._awaitComplete(c, r, s, t);
    return [c, i];
  }
  async _getResponse(e, t, s) {
    await e.runCallbacks("handlerWillStart", { event: s, request: t });
    let a;
    try {
      if (a = await this._handle(t, e), !a || a.type === "error")
        throw new l("no-response", { url: t.url });
    } catch (r) {
      if (r instanceof Error) {
        for (const c of e.iterateCallbacks("handlerDidError"))
          if (a = await c({ error: r, event: s, request: t }), a)
            break;
      }
      if (!a)
        throw r;
    }
    for (const r of e.iterateCallbacks("handlerWillRespond"))
      a = await r({ event: s, request: t, response: a });
    return a;
  }
  async _awaitComplete(e, t, s, a) {
    let r, c;
    try {
      r = await e;
    } catch {
    }
    try {
      await t.runCallbacks("handlerDidRespond", {
        event: a,
        request: s,
        response: r
      }), await t.doneWaiting();
    } catch (i) {
      i instanceof Error && (c = i);
    }
    if (await t.runCallbacks("handlerDidComplete", {
      event: a,
      request: s,
      response: r,
      error: c
    }), t.destroy(), c)
      throw c;
  }
}
class d extends Q {
  constructor(e = {}) {
    e.cacheName = U.getPrecacheName(e.cacheName), super(e), this._fallbackToNetwork = e.fallbackToNetwork !== !1, this.plugins.push(d.copyRedirectedCacheableResponsesPlugin);
  }
  async _handle(e, t) {
    const s = await t.cacheMatch(e);
    return s || (t.event && t.event.type === "install" ? await this._handleInstall(e, t) : await this._handleFetch(e, t));
  }
  async _handleFetch(e, t) {
    let s;
    const a = t.params || {};
    if (this._fallbackToNetwork) {
      const r = a.integrity, c = e.integrity, i = !c || c === r;
      s = await t.fetch(new Request(e, {
        integrity: e.mode !== "no-cors" ? c || r : void 0
      })), r && i && e.mode !== "no-cors" && (this._useDefaultCacheabilityPluginIfNeeded(), await t.cachePut(e, s.clone()));
    } else
      throw new l("missing-precache-entry", {
        cacheName: this.cacheName,
        url: e.url
      });
    return s;
  }
  async _handleInstall(e, t) {
    this._useDefaultCacheabilityPluginIfNeeded();
    const s = await t.fetch(e);
    if (!await t.cachePut(e, s.clone()))
      throw new l("bad-precaching-response", {
        url: e.url,
        status: s.status
      });
    return s;
  }
  _useDefaultCacheabilityPluginIfNeeded() {
    let e = null, t = 0;
    for (const [s, a] of this.plugins.entries())
      a !== d.copyRedirectedCacheableResponsesPlugin && (a === d.defaultPrecacheCacheabilityPlugin && (e = s), a.cacheWillUpdate && t++);
    t === 0 ? this.plugins.push(d.defaultPrecacheCacheabilityPlugin) : t > 1 && e !== null && this.plugins.splice(e, 1);
  }
}
d.defaultPrecacheCacheabilityPlugin = {
  async cacheWillUpdate({ response: n }) {
    return !n || n.status >= 400 ? null : n;
  }
};
d.copyRedirectedCacheableResponsesPlugin = {
  async cacheWillUpdate({ response: n }) {
    return n.redirected ? await S(n) : n;
  }
};
class z {
  constructor({ cacheName: e, plugins: t = [], fallbackToNetwork: s = !0 } = {}) {
    this._urlsToCacheKeys = /* @__PURE__ */ new Map(), this._urlsToCacheModes = /* @__PURE__ */ new Map(), this._cacheKeysToIntegrities = /* @__PURE__ */ new Map(), this._strategy = new d({
      cacheName: U.getPrecacheName(e),
      plugins: [
        ...t,
        new D({ precacheController: this })
      ],
      fallbackToNetwork: s
    }), this.install = this.install.bind(this), this.activate = this.activate.bind(this);
  }
  get strategy() {
    return this._strategy;
  }
  precache(e) {
    this.addToCacheList(e), this._installAndActiveListenersAdded || (self.addEventListener("install", this.install), self.addEventListener("activate", this.activate), this._installAndActiveListenersAdded = !0);
  }
  addToCacheList(e) {
    const t = [];
    for (const s of e) {
      typeof s == "string" ? t.push(s) : s && s.revision === void 0 && t.push(s.url);
      const { cacheKey: a, url: r } = q(s), c = typeof s != "string" && s.revision ? "reload" : "default";
      if (this._urlsToCacheKeys.has(r) && this._urlsToCacheKeys.get(r) !== a)
        throw new l("add-to-cache-list-conflicting-entries", {
          firstEntry: this._urlsToCacheKeys.get(r),
          secondEntry: a
        });
      if (typeof s != "string" && s.integrity) {
        if (this._cacheKeysToIntegrities.has(a) && this._cacheKeysToIntegrities.get(a) !== s.integrity)
          throw new l("add-to-cache-list-conflicting-integrities", {
            url: r
          });
        this._cacheKeysToIntegrities.set(a, s.integrity);
      }
      if (this._urlsToCacheKeys.set(r, a), this._urlsToCacheModes.set(r, c), t.length > 0) {
        const i = `Workbox is precaching URLs without revision info: ${t.join(", ")}
This is generally NOT safe. Learn more at https://bit.ly/wb-precache`;
        console.warn(i);
      }
    }
  }
  install(e) {
    return P(e, async () => {
      const t = new W();
      this.strategy.plugins.push(t);
      for (const [r, c] of this._urlsToCacheKeys) {
        const i = this._cacheKeysToIntegrities.get(c), o = this._urlsToCacheModes.get(r), h = new Request(r, {
          integrity: i,
          cache: o,
          credentials: "same-origin"
        });
        await Promise.all(this.strategy.handleAll({
          params: { cacheKey: c },
          request: h,
          event: e
        }));
      }
      const { updatedURLs: s, notUpdatedURLs: a } = t;
      return { updatedURLs: s, notUpdatedURLs: a };
    });
  }
  activate(e) {
    return P(e, async () => {
      const t = await self.caches.open(this.strategy.cacheName), s = await t.keys(), a = new Set(this._urlsToCacheKeys.values()), r = [];
      for (const c of s)
        a.has(c.url) || (await t.delete(c), r.push(c.url));
      return { deletedURLs: r };
    });
  }
  getURLsToCacheKeys() {
    return this._urlsToCacheKeys;
  }
  getCachedURLs() {
    return [...this._urlsToCacheKeys.keys()];
  }
  getCacheKeyForURL(e) {
    const t = new URL(e, location.href);
    return this._urlsToCacheKeys.get(t.href);
  }
  getIntegrityForCacheKey(e) {
    return this._cacheKeysToIntegrities.get(e);
  }
  async matchPrecache(e) {
    const t = e instanceof Request ? e.url : e, s = this.getCacheKeyForURL(t);
    if (s)
      return (await self.caches.open(this.strategy.cacheName)).match(s);
  }
  createHandlerBoundToURL(e) {
    const t = this.getCacheKeyForURL(e);
    if (!t)
      throw new l("non-precached-url", { url: e });
    return (s) => (s.request = new Request(e), s.params = Object.assign({ cacheKey: t }, s.params), this.strategy.handle(s));
  }
}
let b;
const k = () => (b || (b = new z()), b);
function J(n) {
  k().strategy.plugins.push(...n);
}
try {
  self["workbox:routing:7.0.0"] && _();
} catch {
}
const T = "GET", R = (n) => n && typeof n == "object" ? n : { handle: n };
class w {
  constructor(e, t, s = T) {
    this.handler = R(t), this.match = e, this.method = s;
  }
  setCatchHandler(e) {
    this.catchHandler = R(e);
  }
}
class X extends w {
  constructor(e, t, s) {
    const a = ({ url: r }) => {
      const c = e.exec(r.href);
      if (!!c && !(r.origin !== location.origin && c.index !== 0))
        return c.slice(1);
    };
    super(a, t, s);
  }
}
class Y {
  constructor() {
    this._routes = /* @__PURE__ */ new Map(), this._defaultHandlerMap = /* @__PURE__ */ new Map();
  }
  get routes() {
    return this._routes;
  }
  addFetchListener() {
    self.addEventListener("fetch", (e) => {
      const { request: t } = e, s = this.handleRequest({ request: t, event: e });
      s && e.respondWith(s);
    });
  }
  addCacheListener() {
    self.addEventListener("message", (e) => {
      if (e.data && e.data.type === "CACHE_URLS") {
        const { payload: t } = e.data, s = Promise.all(t.urlsToCache.map((a) => {
          typeof a == "string" && (a = [a]);
          const r = new Request(...a);
          return this.handleRequest({ request: r, event: e });
        }));
        e.waitUntil(s), e.ports && e.ports[0] && s.then(() => e.ports[0].postMessage(!0));
      }
    });
  }
  handleRequest({ request: e, event: t }) {
    const s = new URL(e.url, location.href);
    if (!s.protocol.startsWith("http"))
      return;
    const a = s.origin === location.origin, { params: r, route: c } = this.findMatchingRoute({
      event: t,
      request: e,
      sameOrigin: a,
      url: s
    });
    let i = c && c.handler;
    const o = e.method;
    if (!i && this._defaultHandlerMap.has(o) && (i = this._defaultHandlerMap.get(o)), !i)
      return;
    let h;
    try {
      h = i.handle({ url: s, request: e, event: t, params: r });
    } catch (u) {
      h = Promise.reject(u);
    }
    const g = c && c.catchHandler;
    return h instanceof Promise && (this._catchHandler || g) && (h = h.catch(async (u) => {
      if (g)
        try {
          return await g.handle({ url: s, request: e, event: t, params: r });
        } catch (L) {
          L instanceof Error && (u = L);
        }
      if (this._catchHandler)
        return this._catchHandler.handle({ url: s, request: e, event: t });
      throw u;
    })), h;
  }
  findMatchingRoute({ url: e, sameOrigin: t, request: s, event: a }) {
    const r = this._routes.get(s.method) || [];
    for (const c of r) {
      let i;
      const o = c.match({ url: e, sameOrigin: t, request: s, event: a });
      if (o)
        return i = o, (Array.isArray(i) && i.length === 0 || o.constructor === Object && Object.keys(o).length === 0 || typeof o == "boolean") && (i = void 0), { route: c, params: i };
    }
    return {};
  }
  setDefaultHandler(e, t = T) {
    this._defaultHandlerMap.set(t, R(e));
  }
  setCatchHandler(e) {
    this._catchHandler = R(e);
  }
  registerRoute(e) {
    this._routes.has(e.method) || this._routes.set(e.method, []), this._routes.get(e.method).push(e);
  }
  unregisterRoute(e) {
    if (!this._routes.has(e.method))
      throw new l("unregister-route-but-not-found-with-method", {
        method: e.method
      });
    const t = this._routes.get(e.method).indexOf(e);
    if (t > -1)
      this._routes.get(e.method).splice(t, 1);
    else
      throw new l("unregister-route-route-not-registered");
  }
}
let y;
const Z = () => (y || (y = new Y(), y.addFetchListener(), y.addCacheListener()), y);
function x(n, e, t) {
  let s;
  if (typeof n == "string") {
    const r = new URL(n, location.href), c = ({ url: i }) => i.href === r.href;
    s = new w(c, e, t);
  } else if (n instanceof RegExp)
    s = new X(n, e, t);
  else if (typeof n == "function")
    s = new w(n, e, t);
  else if (n instanceof w)
    s = n;
  else
    throw new l("unsupported-route-type", {
      moduleName: "workbox-routing",
      funcName: "registerRoute",
      paramName: "capture"
    });
  return Z().registerRoute(s), s;
}
function ee(n, e = []) {
  for (const t of [...n.searchParams.keys()])
    e.some((s) => s.test(t)) && n.searchParams.delete(t);
  return n;
}
function* te(n, { ignoreURLParametersMatching: e = [/^utm_/, /^fbclid$/], directoryIndex: t = "index.html", cleanURLs: s = !0, urlManipulation: a } = {}) {
  const r = new URL(n, location.href);
  r.hash = "", yield r.href;
  const c = ee(r, e);
  if (yield c.href, t && c.pathname.endsWith("/")) {
    const i = new URL(c.href);
    i.pathname += t, yield i.href;
  }
  if (s) {
    const i = new URL(c.href);
    i.pathname += ".html", yield i.href;
  }
  if (a) {
    const i = a({ url: r });
    for (const o of i)
      yield o.href;
  }
}
class se extends w {
  constructor(e, t) {
    const s = ({ request: a }) => {
      const r = e.getURLsToCacheKeys();
      for (const c of te(a.url, t)) {
        const i = r.get(c);
        if (i) {
          const o = e.getIntegrityForCacheKey(i);
          return { cacheKey: i, integrity: o };
        }
      }
    };
    super(s, e.strategy);
  }
}
function ne(n) {
  const e = k(), t = new se(e, n);
  x(t);
}
function ae(n) {
  k().precache(n);
}
function re(n, e) {
  ae(n), ne(e);
}
function ce() {
  self.addEventListener("activate", () => self.clients.claim());
}
function ie() {
  self.skipWaiting();
}
const v = [{"revision":null,"url":"assets/fa-brands-400.8ea87917.woff2"},{"revision":null,"url":"assets/fa-brands-400.a3b98177.svg"},{"revision":null,"url":"assets/fa-regular-400.be0a0849.svg"},{"revision":null,"url":"assets/fa-regular-400.e42a8844.woff2"},{"revision":null,"url":"assets/fa-solid-900.9674eb1b.svg"},{"revision":null,"url":"assets/fa-solid-900.9834b82a.woff2"},{"revision":null,"url":"assets/index.8dbc21da.js"},{"revision":null,"url":"assets/index.f2e7bb34.css"},{"revision":null,"url":"assets/merienda.be62e6a9.woff2"},{"revision":null,"url":"assets/secondPhase.7292b19a.css"},{"revision":null,"url":"assets/secondPhase.a4c50769.js"},{"revision":null,"url":"assets/workbox-window.prod.es5.e0cc53cf.js"},{"revision":"48e7c1775305ad7b964085a76d5526a3","url":"favicon.ico"},{"revision":"10d655fd70b17a7bfc286b16dba238a6","url":"index.html"},{"revision":"86ea18ace1f9c6086a55e060f9a1c137","url":"manifest.webmanifest"}];
console.log("UPDATED!");
console.log(v);
function N(n) {
  const e = new Headers(n);
  return e.set("Cross-Origin-Embedder-Policy", "require-corp"), e.set("Cross-Origin-Opener-Policy", "same-origin"), e;
}
J([{
  requestWillFetch: async (n) => {
    let e = n.request;
    return e.mode === "no-cors" && (e = new Request(e.url, {
      cache: e.cache,
      credentials: "omit",
      headers: e.headers,
      integrity: e.integrity,
      keepalive: e.keepalive,
      method: e.method,
      mode: e.mode,
      redirect: e.redirect,
      referrer: e.referrer,
      referrerPolicy: e.referrerPolicy,
      signal: e.signal
    })), e;
  },
  fetchDidSucceed: async (n) => {
    let e = n.response;
    const t = N(e.headers);
    return new Response(e.body, { status: e.status, statusText: e.statusText, headers: t });
  }
}]);
re(v);
x("/version", async (n) => new Response(`v1.5.1
`, {
  status: 200,
  headers: N(new Headers())
}));
ie();
ce();
//# sourceMappingURL=sw.js.map
