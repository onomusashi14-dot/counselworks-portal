/**
 * src/config.ts
 *
 * Runtime configuration for the CounselWorks portal frontend.
 *
 * API_BASE is the prefix prepended to every fetch() call made from
 * src/api/portalApi.ts. Resolution order:
 *
 *   1. VITE_API_BASE from the build environment (set in Vercel for prod,
 *      or in a local .env.local for ad-hoc testing). Trailing slash stripped.
 *   2. In production builds without VITE_API_BASE, the hardcoded
 *      Railway-backed API URL scoped to the seeded dev firm.
 *   3. In development, the relative prefix "/api" — Vite's dev proxy
 *      rewrites this to http://localhost:4000/firms/{FIRM_A_ID}/portal.
 *
 * FIRM_A_ID is the seeded dev firm used for all portal traffic until real
 * firm-scoped auth lands. It must match the value in vite.config.ts and
 * the DEV_FIRM_ID constant in the backend seed scripts.
 */

const FIRM_A_ID = '11111111-1111-1111-1111-111111111111';

// Vite exposes build-time environment variables via import.meta.env. Any
// key prefixed with VITE_ is inlined at build time; everything else is
// stripped. VITE_API_BASE should be a full origin+path, e.g.
//   https://api.counselintake.com/firms/<firm-id>/portal
const rawEnvBase = (import.meta.env.VITE_API_BASE as string | undefined)?.trim();

function resolveApiBase(): string {
  if (rawEnvBase && rawEnvBase.length > 0) {
    return rawEnvBase.replace(/\/$/, '');
  }
  if (import.meta.env.PROD) {
    return `https://api.counselintake.com/firms/${FIRM_A_ID}/portal`;
  }
  // Dev: relative path; Vite proxy rewrites to the backend.
  return '/api';
}

export const API_BASE: string = resolveApiBase();

/**
 * AUTH_BASE — root URL for /auth/* endpoints (login, logout, me, refresh).
 * Auth routes live at the API root, NOT under /firms/:firmId/portal.
 * Derived by stripping the /firms/... suffix from API_BASE.
 */
export const AUTH_BASE: string = API_BASE.replace(/\/firms\/.*$/, '');

export const IS_PRODUCTION: boolean = !!import.meta.env.PROD;
