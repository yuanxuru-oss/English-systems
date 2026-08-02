const ANALYTICS_STORAGE_PREFIX = "review-system:analytics-user-id:";
const POSTHOG_TOKEN = "phc_nN7VnQ5KUs6snfdM7VhT9nES4fTY9Vyrbi5PpT73U9C7";
const POSTHOG_HOST = "https://us.i.posthog.com";

let adapter = createNoopAdapter();
let posthogLoadPromise = null;
const queuedCalls = [];

function createNoopAdapter() {
  return {
    identify(userId, traits = {}) {
      queuedCalls.push({ type: "identify", userId, traits });
    },
    track(name, properties = {}) {
      queuedCalls.push({ type: "track", name, properties });
    },
  };
}

function flushQueuedCalls(nextAdapter) {
  while (queuedCalls.length > 0) {
    const call = queuedCalls.shift();
    if (call.type === "identify") {
      nextAdapter.identify(call.userId, call.traits);
    } else if (call.type === "track") {
      nextAdapter.track(call.name, call.properties);
    }
  }
}

function hashString(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

function randomId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function storageFor(storage = globalThis.localStorage) {
  if (!storage || typeof storage.getItem !== "function" || typeof storage.setItem !== "function") {
    return null;
  }
  return storage;
}

export function normalizeEventProperties(properties = {}) {
  return Object.entries(properties).reduce((result, [key, value]) => {
    if (value === undefined || value === null) return result;
    const type = typeof value;
    if (type === "string" || type === "number" || type === "boolean") {
      result[key] = value;
    }
    return result;
  }, {});
}

export function getOrCreateAnalyticsIdentity(userName = "", storage = globalThis.localStorage) {
  const safeStorage = storageFor(storage);
  const normalizedName = String(userName || "").trim().toLowerCase();
  const key = `${ANALYTICS_STORAGE_PREFIX}${normalizedName || "__anonymous__"}`;

  if (!safeStorage) {
    return `anon_${normalizedName ? hashString(normalizedName) : randomId()}`;
  }

  const existing = safeStorage.getItem(key);
  if (existing) return existing;

  const nextId = `anon_${normalizedName ? hashString(normalizedName) : randomId()}`;
  try {
    safeStorage.setItem(key, nextId);
  } catch {}
  return nextId;
}

function buildAssetHost(apiHost) {
  return apiHost.replace(".i.posthog.com", "-assets.i.posthog.com");
}

function loadPostHog() {
  if (typeof document === "undefined") return Promise.resolve(null);
  if (globalThis.posthog?.__loaded) return Promise.resolve(globalThis.posthog);
  if (posthogLoadPromise) return posthogLoadPromise;

  posthogLoadPromise = new Promise((resolve) => {
    const script = document.createElement("script");
    script.async = true;
    script.crossOrigin = "anonymous";
    script.src = `${buildAssetHost(POSTHOG_HOST)}/static/array.js`;
    script.onload = () => resolve(globalThis.posthog || null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });

  return posthogLoadPromise;
}

export async function initAnalytics({ userName = "", storage = globalThis.localStorage } = {}) {
  const userId = getOrCreateAnalyticsIdentity(userName, storage);
  const posthog = await loadPostHog();

  if (!posthog?.init) {
    adapter = createNoopAdapter();
    return { userId, ready: false };
  }

  posthog.init(POSTHOG_TOKEN, {
    api_host: POSTHOG_HOST,
    defaults: "2026-05-30",
    person_profiles: "identified_only",
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
  });

  adapter = {
    identify(id, traits = {}) {
      posthog.identify(id, normalizeEventProperties(traits));
    },
    track(name, properties = {}) {
      posthog.capture(name, normalizeEventProperties(properties));
    },
  };

  flushQueuedCalls(adapter);

  if (userName) {
    adapter.identify(userId, { user_name: userName });
  }

  return { userId, ready: true };
}

export function identify(userId, traits = {}) {
  adapter.identify(userId, traits);
}

export function track(name, properties = {}) {
  adapter.track(name, properties);
}
