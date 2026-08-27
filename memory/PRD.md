# PRD — dontblink (personal link-in-bio pages)

## Renamed 2026-08-27 (iteration 4): brand is now "dontblink" (was "sanctuary") — UI, tab title, claim prefixes, footer, profile badge, and Stripe product name all updated. Internal storage path and localStorage key unchanged (invisible).

## Original problem statement
"Build a landing page: can you build me a social media page, make me a setting to link my discord, when i link my discord display my profile photo + banner (if user has a banner) and name. + make a option for people to add their social media (make it auto detect the social media websites favicon) + add a last.fm option to track my music plays"

User choices: Discord linked by pasting user ID (no OAuth keys); Last.fm API key provided (in backend/.env); login-protected settings with per-user public page at /username; vibe: chill and simplistic.

## Architecture
- FastAPI + MongoDB (motor), JWT bearer auth (bcrypt hashing), all routes under /api
- Discord lookup: backend proxy to japi.rest public user API, cached 15 min in Mongo (`discord_cache`)
- Last.fm: backend proxy to ws.audioscrobbler.com user.getrecenttracks (key server-side only), 30s in-memory cache
- React + Tailwind + framer-motion + lenis smooth scroll; favicon autodetect client-side (Google s2 favicons → DuckDuckGo icons → brand glyph fallback)
- Design: warm Japanese tea & matte ceramic (design_guidelines.json), Cabinet Grotesk + Cormorant Garamond + Plus Jakarta Sans

## Implemented (2026-08-27)
- Landing page: masked-line hero, username claim box, live demo card, slow marquee, feature bento, live playground (real Discord ID fetch + favicon chip demo)
- Auth: register (username availability check), login (email or username), JWT in localStorage
- Settings: profile (name/bio), Discord ID with live test fetch, Last.fm username with test, social links editor (add/reorder/remove, auto label + favicon), live preview pane
- Public profile /:username: avatar (Discord avatar if linked), bio, Discord card (banner + avatar + name + copy ID), Last.fm card (spinning vinyl now playing + recent scrobbles, polls 45s), social chips, 404 claim page
- Test user: wren / wren@example.com / sanctuary123 (see /app/memory/test_credentials.md)

## Implemented (2026-08-27, iteration 2)
- Live Discord presence: Lanyard proxy (/api/lanyard/{id}, 15s cache) — "online now" badge, status dot, current activity/Spotify on the Discord card; falls back to static "connected" when user isn't in the Lanyard server
- Link click counts: POST /api/profile/{username}/click increments per-link counters (preserved across saves); shown as tap counts in the settings link editor
- Page themes: 5 themes (Paper + Charcoal free; Moss, Ember, Dusk paid). Settings shows live mini-previews per theme; profile renders via scoped data-theme CSS vars
- Paid theme pack via Stripe claimable sandbox ($4.99 one-time, tax handled by Stripe managed payments w/ automatic-tax fallback): checkout → success redirect → status poll grants entitlement; webhook at /api/stripe/webhook; server blocks paid themes with 403 before purchase
- Profile photo upload: object storage via Emergent integration proxy (sanctuary/avatars/...), served through /api/files/{path}; overrides Discord avatar; remove supported

## Implemented (2026-08-27, iteration 3)
- Page view counter: POST /api/profile/{username}/view on every public page load; settings "Your stats" shows total visits + top referrers (host-normalized, favicon per source, top 6); stats only visible to owner
- Spotify vinyl art: Lanyard proxy now passes album_art_url; Discord card shows spinning vinyl with live album cover + song/artist while listening to Spotify (falls back to activity pill otherwise)

## Implemented (2026-08-27, iteration 5)
- Blink favicon: custom eye SVG favicon; on tab hide it swaps to a closed-eye "wink" icon and the title changes to "don't blink…", restoring on return
- Theme scheduling: settings "auto day / night" switch (theme_auto field); profile resolves Paper 06:00-18:00, Charcoal otherwise, on the visitor's clock
- View sparkline: views tracked per day (views_by_day); settings stats shows a 14-day SVG sparkline above the total

## Implemented (2026-08-27, iteration 6)
- Landing redesign inspired by guns.lol (dark plum, glowing purple CTAs, floating glass pill nav, centered masked headline "Everything you are, right here.", tilted overlapping product mock cards — stats sparkline, live profile w/ online badge + Spotify vinyl, theme picker — purple glow shadows, dark marquee/features/playground). New component LandingDark.jsx; playground Discord card inherits dusk theme. Profile/auth/settings pages unchanged.

## Implemented (2026-08-27, iteration 7)
- App-wide dark plum reskin: root palette now deep plum + purple (#8B5CF6) accent; login/register and settings fully restyled (dark cards, purple CTAs, purple sparkline/focus rings/toggles). Public profile pages still honor the visitor-facing per-user theme (Paper/Charcoal/Moss/Ember/Dusk + auto day/night); settings live-preview pane renders the selected page theme.

## Implemented (2026-08-27, iteration 8)
- Nav links swapped: features/try-it removed (still on-page via scroll), now compare / leaderboard / pricing anchors
- Compare section: dontblink vs Linktree vs Carrd table (pricing + feature rows, checks/crosses)
- Leaderboard: GET /api/leaderboard (top 10 by views, public); landing section with medal-colored ranks, avatars, view counts, links to pages
- Pricing section: Free vs Premium ($4.99 one-time) cards; unlock button starts Stripe checkout when logged in, sends guests to register; shows "unlocked" state when owned

## Implemented (2026-08-27, iteration 9)
- Compare, Leaderboard, Pricing moved off the landing into standalone routes /compare, /leaderboard, /pricing (shared dark shell in InfoPages.jsx; Nav + sections exported from LandingDark.jsx; landing keeps hero, showcase, marquee, features, playground)

## Implemented (2026-08-27, iteration 10)
- Dashboard redesign (guns.lol-inspired, not copied): /settings now a sidebar dashboard — search sections (⌘K wired), tabs: Overview (stat cards: username/views/link taps/premium, profile-completion checklist with progress bar, quick actions, analytics sparkline + referrers), Customize (profile/photo/theme + live preview), Links, Connections (Discord + Last.fm with linked badges), Premium (unlock/owned states). Sidebar has my-page + share-profile buttons. New Dashboard.jsx; old Settings.jsx unused.

## Implemented (2026-08-27, iteration 11)
- Role system (Discord-style pills: colored dot + label + icon): V1 auto-assigned to all signups before 2027-01-01 (from created_at); Owner/Developer assigned via OWNER_USERNAMES / DEVELOPER_USERNAMES env lists. Roles on public profiles, leaderboard entries, and dashboard overview. Current: @test = Owner, @wren = Developer.
- RolePills component (crown/code/zap icons; colors purple/blue/gold)

## Implemented (2026-08-27, iteration 12)
- Username change: PUT /api/auth/username (JWT survives — token keyed on user id); dashboard Customize tab has username field with live debounced availability check, "username unavailable" state, disabled change button until free. Reserved names (compare/leaderboard/pricing/settings/login/register/api/dashboard) blocked at register + rename.

## Implemented (2026-08-27, iteration 13)
- Username changes limited to once per 30 days: username_changed_at stamped on change; repeat attempts get 429 with the next-available date; dashboard shows cooldown note and disables the field
- Brand prefix switched from dontblink.page to dontblink.site across landing, auth, dashboard, pricing copy

## Implemented (2026-08-27, iteration 14)
- Permanent UIDs: sequential atomic counter (counters collection), assigned at register; existing users backfilled by signup order (wren #1, hi2w #2); uid is public, never editable, survives username changes; dashboard username card shows "UID #N · unchangeable"
- Owner role re-pointed: user renamed test → hi2w (using the rename feature); OWNER_USERNAMES updated to hi2w

## Implemented (2026-08-27, iteration 15)
- Public UID badge: "#N" pill on profile pages next to roles
- Leaderboard crown: profile endpoint computes top viewer; #1 page gets gold "most viewed" crown pill (currently hi2w)
- Username history: renames push to username_history; dashboard Customize shows quiet "previously: @…" log; hi2w's pre-tracking rename from test backfilled

## Implemented (2026-08-27, iteration 16)
- Spotify 30s preview: Lanyard proxy passes track_id; Discord card vinyl row gets a play/pause button revealing a compact Spotify embed player
- Weekly digest email via Emergent-managed Resend (gate + from_name per playbook): Sunday 00:00 UTC hourly-check loop sends each user their week (visits, top referrer, most-tapped link), one per ISO week; dashboard "email me this week's digest now" button → POST /api/auth/digest-test
- Visitor greeting: localStorage per-page visit memory; returning visitors see "welcome back — you've been here before" under the badges

## Implemented (2026-08-27, iteration 17 — bugfix)
- Fixed 30s preview: it never appeared for the owner because it was tied to Lanyard (requires joining their Discord server). Reworked: preview now comes from the Last.fm now-playing track via Deezer public search (MP3, iTunes AAC fallback) — play/pause button on the Last.fm now-playing row, vinyl spins while playing. Verified live on /hi2w (audio playing, pause works)

## Implemented (2026-08-27, iteration 18)
- Owner premium bypass: has_premium() = theme_pack OR Owner role (UID #2, hi2w) — server-enforced for paid themes, checkout blocked for owner, dashboard/pricing show unlocked
- Anti-bot signup: honeypot field (hidden "website" input; filled = rejected) + IP rate limits (register 5/hour, login 10/5min; in-memory per worker, X-Forwarded-For aware)

## Implemented (2026-08-27, iteration 19)
- YouTube embed (premium): video URL embeds directly; channel/handle resolves via channel page + RSS to always show the latest upload. GET /api/youtube/resolve (10min cache)
- Twitch embed (premium): decapi.me uptime for live detection (30s cache, profile polls 60s) — live streams broadcast in-page, offline falls back to latest VOD (vod_replay). GET /api/twitch/{channel}
- Server gates youtube/twitch fields to premium (403); dashboard Connections has both inputs with lock overlay for free users
- Owner role is now UID-based (OWNER_UIDS="2") so it survives renames; Owner gets unlimited username changes (cooldown skipped)

## Implemented (2026-08-27, iteration 20)
- Profile song pin: dashboard Connections → pinned track input; backend /api/track/preview (Deezer, iTunes fallback) shared with Last.fm now-playing lookup; profile shows pinned track with playable 30s preview whenever the user isn't listening live
- Profile layout: two-column grid (lg) — Discord full width, Last.fm beside social links, YouTube beside Twitch; single items span full width

## Implemented (2026-08-27, iteration 21)
- Twitch clip fallback: offline channels now also fetch their all-time top clip via Twitch GQL (public client, persisted ClipsCards__User hash 90c33f5e…). Profile chain: live stream → latest VOD → top clip embed → channel link note

## Implemented (2026-08-27, iteration 22)
- Favorite song autoplay: favorite_track field (dashboard Connections); profile loads a floating mini-player (bottom-right) with cover art, pause/play and volume slider for visitors; attempts autoplay on load, falls back to a pulsing "tap to play" state when the browser blocks sound-autoplay. Audio via shared /api/track/preview (Deezer MP3)

## Implemented (2026-08-27, iteration 23)
- Custom audio upload for favorite song: POST/DELETE /api/auth/song (audio/*, ≤20MB, object storage at sanctuary/songs/); profile player uses the uploaded full song when present, else the Deezer 30s preview; dashboard has upload/remove with "custom audio active" badge
- Dashboard cooldown UI now skips the lock for Owner (server bypass was UID-based since iter 19)

## Backlog
- P1: Custom avatar upload / profile photo override — DONE
- P1: Page view analytics (click counts per link) — DONE (per-link taps; page views still open)
- P2: Dark mode toggle — DONE (as free Charcoal theme)
- P2: Discord presence/status via Lanyard — DONE
- P2: Custom themes per profile — DONE (paid pack)
- P3: Custom domain support
- P3: Total page view counter + referrers


## Imported (2026-07-XX, new workspace)
- Repo https://github.com/IgarashiJarad/hi.git imported into this workspace and run as-is (user chose: keep existing code, match repo branding).
- Fresh DB: re-registered hi2w (UID #2 → Owner role via OWNER_UIDS=2) and wren (UID #1, V1). Backend .env recreated: JWT_SECRET, STRIPE_SECRET_KEY=sk_test_emergent (sandbox), EMERGENT_LLM_KEY/EMERGENT_EMAIL_KEY, APP_URL.
- LASTFM_API_KEY is empty — Last.fm endpoints return 503 until the user provides a key.
- Verified: register/login, profile, leaderboard, username-check, landing + profile pages render.

## Prioritized backlog
- P0: Add LASTFM_API_KEY (user-provided) to enable scrobbles/now-playing

## Implemented (2026-07, iteration 24 — post-import)
- LASTFM_API_KEY added to backend/.env (user-provided) — Last.fm proxy verified live
- Song progress bar: thin purple line along the bottom edge of the floating music player, advances with playback
- View milestones on dashboard Overview → analytics: chips for 50/100/500/1000 visits, reached state with check, progress bar + "N to go" toward next, celebration line when a milestone is crossed
- Digest opt-out: dashboard toggle beside the digest test button; POST /api/auth/digest-opt-out; Sunday loop skips opted-out users (manual "send now" still works)


## Implemented (2026-07, iteration 25)
- Music Video Mode: GET /api/music-video?q= scrapes YouTube search ("{q} official music video"), validates candidates via oEmbed, caches 10 min. Profile shows MusicVideoCard (full width, thumbnail + purple play overlay → youtube-nocookie embed; NO autoplay=1 — it trips YouTube's bot wall). Known limit: top result may be a re-upload rather than the artist's official channel.
- Cloudflare Turnstile on /register: widget (dark theme, action=signup) via challenges.cloudflare.com script; token required when REACT_APP_TURNSTILE_SITE_KEY set; backend verify_turnstile → siteverify, fails closed. Currently running Cloudflare's always-pass TEST keypair (1x000...AA) in both .env files — swap in real dashboard keys for production.


## Implemented (2026-07, iteration 26)
- Account cleanup at user request: deleted wren (UID #1) and hi2w (UID #2); renumbered tomo #3 → #1; granted Owner (OWNER_UIDS=1) + Developer (DEVELOPER_USERNAMES=tomo) roles. UID counter left at 4 so new signups continue at #5. humantest1 (#4) test account retained.


## Implemented (2026-07, iteration 27)
- Main test account: dntblink (UID #5, display name DNTBLINK) — designated testing page for all new features. Seeded with dark theme, bio, 3 demo links (GitHub/YouTube/Spotify), favorite track "Nikes Frank Ocean" (player + music video card verified live).


## Implemented (2026-07, iteration 28)
- Music player progress bar v2: seekable purple bar with elapsed/total timestamps (tabular-nums), hover grow + dot handle, click-to-seek verified. Replaces the thin edge line.
- dntblink Discord presence: set discord_id=94490510688792576 (public Lanyard demo user "Phineas", MOCKED) — card shows banner, avatar, status pill, Spotify vinyl state. Swap in a real Discord ID for real presence.

## Implemented (2026-07, iteration 29)
- Mobile dropdown nav: shared MobileMenu component (hamburger → animated glass dropdown, outside-click close, auto-close on route change, light/dark variants). Wired into the dark Nav (LandingDark, shared by all InfoPages) and the light Landing nav. Desktop nav hidden below sm breakpoint; verified at 390px including menu navigation.


## Implemented (2026-07, iteration 30)
- Dashboard mobile cleanup: fixed page-level horizontal overflow (min-w-0 on content column), hidden scrollbar on the mobile tab strip, tighter card padding on mobile (p-5 sm:p-6 across all sections), responsive headings (text-xl → sm:text-2xl), wrapping roles row. Verified at 390px: scrollWidth == viewport on Overview + Customize.


## Implemented (2026-07, iteration 31)
- Dashboard mobile tab strip → dropdown menu: sticky mobile bar now shows brand + a pill button with the current section and chevron; opens an animated glass dropdown listing all 5 sections with a check on the active one. Outside-click closes, selection closes + switches tab. Verified at 390px on dntblink: no overflow, tab switching works.


## Fixed (2026-07, iteration 32 — mobile glitches)
- Root cause of small-screen glitches: profile card grid used an implicit auto column at mobile, so the widest card's min-content forced every card to ~413px on 375px screens (clipped timestamps, cut cards). Fix: explicit grid-cols-1 (minmax(0,1fr)).
- Music player mobile: max-w-[calc(100vw-2rem)], volume slider hidden below sm, narrower seek bar, tap hint repositioned; profile page gets bottom clearance (pb-36) when player is present.
- Global overflow-x guard on html/body. Verified at 375px: grid 343px, 0 overflowing elements, no page overflow on /, /leaderboard, /pricing, /compare, /login, /register, /tomo, /dntblink.

## Implemented (2026-07, iteration 33)
- Email verification on signup: 6-digit code emailed via managed Resend (EMAIL_FROM_NAME=dontblink), 10-min expiry, 5-attempt cap, rate-limited verify (10/10min) and resend (3/10min). New users start email_verified=false; register → /verify page; unverified logins redirect to /verify. Existing 4 users grandfathered as verified. Codes stored in email_codes collection, single-use (deleted on success). E2E verified via UI: register → verify page → code entry → dashboard; wrong codes rejected.


## Implemented (2026-07, iteration 34)
- Password reset: /reset page (identifier → emailed 6-digit code → new password → auto-login). POST /auth/forgot-password (no account-existence leak) + /auth/reset-password; reuses the code system (10-min expiry, 5 attempts, rate limits). "forgot password?" link on the login form. Resetting also marks the email verified.
- Verified badge: profiles with a confirmed email show a small "verified" check pill (public_user exposes `verified`).
- Page deletion: Danger zone at the bottom of Customize — type your username to confirm. DELETE /auth/account removes the account, cleans codes/files, renumbers all higher UIDs down by one, and resets the UID counter (verified: codetest #7 deleted, uitest moved 8→7, counter back to 7).

## Implemented (2026-07, iteration 35)
- Deletion goodbye email: DELETE /auth/account emails a server-side "goodbye" confirmation before wiping the account (failure never blocks deletion). Verified live via uitest deletion — profile 404s, codes cleaned, counter correct.
- Danger zone layout fix: removed negative margin, proper mt-6 spacing — no overlap with the live preview column; mobile stacks cleanly with zero overflow.

## Fixed (2026-07, iteration 36 — email outage)
- Root cause: EMERGENT_EMAIL_KEY held the LLM key (sk-emergent-…); the email proxy needs the dedicated per-app email key (ek_18e7c39cdb9f90a8f6b90741470f84b4). All sends were 401ing, and register/deletion swallowed the failure silently.
- After key swap: verification code, welcome email, password reset code and weekly digest all send cleanly (verified via register→verify flow and digest-test, zero email errors in logs).
- Welcome email: fires once on first successful verify-email, links to the user's new page.

## Implemented (2026-07, iteration 37)
- Admin selection (owner-only dashboard tab): look up any page by UID, see account card (email, views, verified, roles), live iframe preview of the page, delete with type-username confirm. GET/DELETE /api/admin/user/{uid}; non-owners 403, self/other-owner deletes blocked, shared wipe_user renumbers UIDs. Verified: deleted the slur test account via admin API, preview iframe renders, non-owner blocked.
- Content censoring: check_clean() applied to username (register + change), display name, bio, favorite/pinned track, YouTube/Twitch/Last.fm fields, link URLs + labels. Two-tier: severe slurs/porn terms matched as substrings after leetspeak normalization (catches n1gga, nigga123); ambiguous terms (jew, fag, xxx…) whole-word only so "jewelry" passes. Adult domains (pornhub, xvideos, onlyfans…) blocked in links. NOTE: no vision API available — uploaded image/video CONTENT is not scanned; censoring covers text, usernames, links and domains.


## Implemented (2026-07, iteration 38)
- Admin user list: GET /api/admin/users (owner only) + scrollable "all pages" list in the Admin section — avatar, username, uid, views, verified check; clicking a row loads it into the lookup card and syncs the UID input. List refreshes after admin deletion (UIDs renumber live — dntblink moved #5→#4 when other accounts were deleted in the wild).


## Hardened (2026-07, iteration 39 — security pass)
- Security headers on every response: X-Content-Type-Options, X-Frame-Options SAMEORIGIN (admin iframe preview still works), Referrer-Policy, Permissions-Policy
- Email codes now stored as SHA-256 hashes only (verification + reset); verified wrong-code reject + hashed-code accept + login with new password
- Login brute force: per-account limit (10/15min) on top of per-IP (10/5min) — hammer test confirmed 429s
- Rate limits added to all open proxies/trackers: Last.fm 30/min, iTunes preview 20/min, YouTube resolve 20/min, music-video 20/min, Twitch 30/min, Lanyard 90/min, view/click tracking 60/min — Last.fm hammer test confirmed 429 after 30
- Input caps: password ≤128 chars (bcrypt truncation guard), email ≤254, referrer ≤300 chars
- Confirmed already-solid: JWT 7-day expiry + HS256 pinned, bcrypt, upload type/size/ext validation, file serving gated by DB records (no traversal), forgot-password doesn't leak account existence, admin endpoints 403 for non-owners






- P1: Song progress bar on floating player; view milestones on dashboard
- P2: Digest opt-out toggle; Cloudflare Turnstile on signup
- P3: Custom domain support
