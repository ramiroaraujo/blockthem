# BlockThem

Context for Claude Code sessions working on this project. End-user docs live in `README.md`.

## What this is

BlockThem is a Chrome extension (Manifest V3) for blocking distracting websites. URL/regex rules, schedules, password protection, and bundled category blocklists for adult/gambling content. Personal project — keep it simple and barebones.

## Tech stack

React 19 + TypeScript • Vite + `@crxjs/vite-plugin` • Tailwind CSS v4 • Zod • Vitest (`vitest-chrome` + `happy-dom`) • pnpm • Chrome Manifest V3 + Declarative Net Request API

## Common commands

| Command | What it does |
|---|---|
| `pnpm dev` | Vite dev server with hot reload (load `dist/` as unpacked extension) |
| `pnpm build` | Type-check + production build to `dist/` |
| `pnpm test` | Run Vitest suite once |
| `pnpm lint` / `lint:fix` | ESLint (flat config) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm format` / `format:fix` | Prettier check / write |
| `pnpm generate-rulesets` | Re-fetch StevenBlack/hosts and regenerate `rulesets/{adult,gambling}.json` |
| `pnpm zip` | Build + create `blockthem.zip` for Chrome Web Store upload |
| `pnpm release <patch\|minor\|major>` | Bump version in `package.json` AND `manifest.json`, regenerate rulesets, build, commit, tag, push, create GitHub release with zip attached |

**Always run `pnpm lint && pnpm typecheck && pnpm test` before committing.**

## Architecture

```
manifest.json                          MV3, host_permissions <all_urls>, declares static
                                       rule_resources for "adult" and "gambling" (start disabled)

src/background/service-worker.ts       Syncs dynamic DNR rules from storage on every state change.
                                       syncStaticRulesets() toggles category rulesets via
                                       updateEnabledRulesets(). webNavigation + tabs.onUpdated
                                       fallback catches server-side redirects DNR misses
                                       (e.g. x.com → x.com/home). Alarm re-evaluates schedules
                                       every minute.

src/shared/types.ts                    StorageState shape, DEFAULT_STATE
src/shared/storage.ts                  get/set/updateState. Spreads DEFAULT_STATE on read for
                                       forward compat with new fields.
src/shared/rules.ts                    buildDNRRules() — uses redirect action to the blocked page
src/shared/schedule.ts                 isScheduleActive, formatSchedule (handles overnight ranges)
src/shared/password.ts                 SHA-256 + per-state random salt. NOT a slow KDF —
                                       acceptable for the moment-of-weakness threat model
                                       (hash never leaves chrome.storage.local).
src/shared/schemas.ts                  Zod schemas

src/popup/Popup.tsx                    Toggle blocking, "Block This" button (one-click block of
                                       current domain), password gate for disabling only.
src/options/App.tsx                    Top-level options page. Sets unlocked=true on initial load
                                       when no password exists, so setting a password mid-session
                                       does not re-prompt.
src/options/components/                BlockList, SchedulePage, PasswordPage, PasswordGate,
                                       Sidebar, AddRuleModal, ScheduleEditor

src/blocked/{index.html,main.ts}       Blocked page. Reads ?rule=...&type=... for user rules,
                                       or ?category=adult|gambling for static rulesets.

rulesets/                              Generated, gitignored. ~15MB adult.json, ~1MB gambling.json.
                                       Regenerate after fresh checkout.
scripts/release.sh                     Release pipeline
scripts/generate-rulesets.ts           Downloads StevenBlack porn-only + gambling-only hosts files,
                                       converts to Chrome DNR JSON with `||domain` urlFilter
                                       (matches subdomains too)
```

## DNR notes

- **Dynamic rules** (user-created): managed via `updateDynamicRules()`, limit ~30k. Use `redirect` action to `/src/blocked/index.html?rule=<encoded>&type=url|regex`.
- **Static category rulesets**: declared in manifest, indexed by Chrome in C++ at install time, **zero JS overhead per request**. Limit 300k enabled rules. Toggled via `updateEnabledRulesets()` gated on `blockingEnabled && state.blockXxxSites`.
- The webNavigation fallback only checks dynamic rules — static rulesets are handled natively before JS runs, so they don't need a fallback.

## Conventions / important rules

- **No `Co-Authored-By:` trailers** in commit messages. They were stripped from history once via `filter-branch` — do not reintroduce.
- **Commit messages**: conventional prefixes (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `style:`, `release:`). Short and factual, no fluff. Focus on the *why* when non-obvious.
- **Dark theme consistency**: never introduce light/white backgrounds — they break the visual cohesion. Form inputs need adequate height.
- **Keep it simple**: barebones personal project. Don't over-engineer, don't speculatively add features.
- **Don't commit `rulesets/`, `dist/`, `blockthem*.zip`, `.DS_Store`, `.superpowers/`** — all gitignored.

## Releases & versioning

- Semver: **patch** = bug fix, **minor** = new feature, **major** = breaking change.
- The release script is the only way to release — it keeps `package.json` and `manifest.json` versions in lockstep, regenerates rulesets, builds, commits, tags, pushes, and creates the GitHub release with the built zip attached.
- Working tree must be clean before running `pnpm release`.
- Repo: `ramiroaraujo/blockthem` (personal GitHub; `gh` CLI authenticated via SSH).

## Chrome Web Store

- No working CLI publishing flow. Upload `blockthem.zip` manually via the developer dashboard at https://chrome.google.com/webstore/devconsole.
- Store screenshots live in `docs/cws/` (1280x800, dark background).
- The broad `<all_urls>` host permission triggers an "in-depth review" warning. Acceptable — we need it for the redirect action on dynamic rules. The user is aware.

## Testing

Vitest with `vitest-chrome` (chrome API mocks) and `happy-dom`. Tests live next to the code as `*.test.ts`. New shared logic should have tests.

## Memory of past decisions

- Adult blocklist comes from StevenBlack `alternates/porn-only/hosts` (~77k domains), gambling from `alternates/gambling-only/hosts` (~6k). These exclude the base adware list to keep the categories clean.
- The "Block This" button bypasses password protection by design — user explicitly wanted one-click blocking with no friction. It also forces `blockingEnabled: true` so the rule actually takes effect.
- The blocked page's "Go Back" button was removed because it didn't actually navigate anywhere useful.
- Import/export only handles the `rules` array — not schedule, password, blocking state, or category settings.
