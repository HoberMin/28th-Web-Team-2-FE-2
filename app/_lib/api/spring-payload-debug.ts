import "server-only";

const ALLOWED_ENDPOINTS = new Set([
  "GET /api/kamis/daily-prices",
  "GET /api/v1/items",
  "GET /api/v1/news",
  "GET /api/v1/regions/nearby",
  "GET /api/v1/regions/search",
  "GET /api/v1/stores/nearby",
]);

const SENSITIVE_KEYS = new Set([
  "accesstoken",
  "authorization",
  "certid",
  "certkey",
  "clientsecret",
  "cookie",
  "idtoken",
  "pcertid",
  "pcertkey",
  "refreshtoken",
]);

const MAX_ARRAY_ITEMS = 10;
const MAX_KEY_LENGTH = 100;
const MAX_OBJECT_FIELDS = 50;
const MAX_STRING_LENGTH = 500;
const MAX_PREVIEW_NODES = 250;
const MAX_DEPTH = 6;

interface PreviewBudget {
  remaining: number;
}

function isPayloadDebugEnabled(endpoint: string): boolean {
  if (process.env.NODE_ENV !== "development") return false;
  if (process.env.VERCEL === "1" || process.env.VERCEL_ENV) return false;
  return process.env.SPRING_API_DEBUG_PAYLOAD?.trim().toLowerCase() === "true" &&
    ALLOWED_ENDPOINTS.has(endpoint);
}

function normalizedKey(key: string): string {
  return key.replaceAll("-", "").replaceAll("_", "").toLowerCase();
}

function previewKey(key: string): string {
  if (key.length <= MAX_KEY_LENGTH) return key;
  return `${key.slice(0, MAX_KEY_LENGTH)}… [${String(key.length - MAX_KEY_LENGTH)} chars omitted]`;
}

function payloadPreview(value: unknown, budget: PreviewBudget, depth = 0): unknown {
  if (budget.remaining <= 0) return "[PREVIEW_LIMIT]";
  budget.remaining -= 1;

  if (typeof value === "string") {
    if (value.length <= MAX_STRING_LENGTH) return value;
    return `${value.slice(0, MAX_STRING_LENGTH)}… [${String(value.length - MAX_STRING_LENGTH)} chars omitted]`;
  }
  if (value === null || typeof value !== "object") return value;
  if (depth >= MAX_DEPTH) return "[MAX_DEPTH]";

  if (Array.isArray(value)) {
    const visibleItems = value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => payloadPreview(item, budget, depth + 1));
    const omittedItems = value.length - visibleItems.length;
    if (omittedItems > 0) visibleItems.push({ $omittedItems: omittedItems });
    return visibleItems;
  }

  const entries: Array<[string, unknown]> = [];
  let visitedFields = 0;
  for (const key in value) {
    if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
    visitedFields += 1;
    if (visitedFields > MAX_OBJECT_FIELDS || budget.remaining <= 0) {
      entries.push(["$truncated", "additional fields omitted"]);
      break;
    }
    const fieldValue = SENSITIVE_KEYS.has(normalizedKey(key))
      ? "[REDACTED]"
      : payloadPreview(Reflect.get(value, key), budget, depth + 1);
    entries.push([previewKey(key), fieldValue]);
  }
  return Object.fromEntries(entries);
}

interface SpringPayloadDebugRequest {
  endpoint: string;
  payload: unknown;
  personalized: boolean;
}

export function debugSpringPayload(request: SpringPayloadDebugRequest): void {
  const { endpoint, payload, personalized } = request;
  if (personalized) return;
  if (!isPayloadDebugEnabled(endpoint)) return;

  const preview = payloadPreview(payload, { remaining: MAX_PREVIEW_NODES });
  console.info(`[spring-api:payload] ${endpoint}\n${JSON.stringify(preview, null, 2)}`);
}
