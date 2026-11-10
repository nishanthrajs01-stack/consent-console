# Consent Console — Design System
### Extracted from the approved mockup for frontend implementation

Values below are read carefully off the mockup, not pixel-sampled — treat hex codes as a strong starting point to fine-tune in-browser against the reference image side by side.

---

## 1. Design intent

Dark, high-trust fintech-security aesthetic. The page stays calm and quiet by default — the whole point of the product is that silence signals safety. Boldness is spent in exactly one place: the red alert state when an attack is blocked. Everything else (stat cards, nav, activity feed) stays disciplined and low-contrast so that when red does appear, it actually reads as urgent instead of competing with ten other loud elements.

---

## 2. Color tokens

```css
:root {
  /* Base */
  --bg-canvas:        #080D1F;   /* page background, near-black navy */
  --bg-canvas-glow:    radial-gradient(circle at 80% 10%, #10224D 0%, #080D1F 55%);
  --bg-surface:        #0E1630;  /* card background */
  --bg-surface-alt:    #111A38;  /* sidebar, secondary panels */
  --border-subtle:     rgba(255, 255, 255, 0.08);
  --border-strong:     rgba(255, 255, 255, 0.14);

  /* Brand / primary (PayPal blue) */
  --brand-500:  #2E7CF6;
  --brand-600:  #1D63D8;
  --brand-glow: rgba(46, 124, 246, 0.35);

  /* Status */
  --success-500: #22C55E;   /* approved, active, uptrend */
  --success-bg:  rgba(34, 197, 94, 0.12);
  --danger-500:  #EF4444;   /* blocked, high risk */
  --danger-glow: rgba(239, 68, 68, 0.35);
  --danger-bg:   rgba(239, 68, 68, 0.10);
  --warning-500: #F5A623;   /* AI explanation callouts */

  /* Text */
  --text-primary:   #F5F7FA;
  --text-secondary: #94A3B8;
  --text-muted:     #5B6B87;
}
```

**Usage rules, not just a palette:**
- `--danger-500` and its glow are reserved for the blocked-attack state only. Never reuse red for anything else on the page — its rarity is what makes it legible as "something real happened."
- `--success-500` stays small and quiet (a checkmark, a word like "Active") — it should never be as visually loud as the danger state.
- `--brand-500` carries the hero headline gradient, the primary CTA, and the sidebar active-item fill. It is the identity color; red and green are state colors layered on top of it.

---

## 3. Typography

- **Family**: a geometric/humanist grotesque — **Inter** or **Manrope**, variable weight. Both are free, render well at small dashboard sizes, and match the rounded-but-confident character in the mockup's headline. Pick one family only; don't pair a second typeface in for this UI.
- **Scale** (desktop):

| Role | Size | Weight | Notes |
|---|---|---|---|
| Hero headline ("Consent Console") | 56–64px | 800 | `--text-primary` → `--brand-500` gradient on the second word only, matching the mockup |
| Section/card title | 18–20px | 600 | `--text-primary` |
| Body / feed text | 14–15px | 400–500 | `--text-secondary` for metadata, `--text-primary` for primary line |
| Stat value | 28–32px | 700 | `--text-primary` |
| Label / eyebrow | 12–13px | 500 | `--text-secondary`, sentence case — **not** tracked-out all-caps |
| Timestamp | 12px | 400 | `--text-muted` |

Keep line length under ~70 characters on the subheadline text; it's a dashboard, not an article, so most text elsewhere is short labels and single-line feed entries rather than paragraphs.

---

## 4. Layout

```
┌──────────┬──────────────────────────────────────────────────┐
│          │  [badge: PayPal AI Hackathon 2026]    [sandbox] [avatar]
│ Sidebar  │  Consent Console                                  │
│  ~240px  │  The human trust layer for AI purchases.          │
│          │  [View Demo] [View on GitHub]        (glow orb →) │
│ logo     ├──────────────────────────────────────────────────┤
│ nav ×5   │  [stat] [stat] [stat] [stat]   ← 4-col equal grid │
│          ├───────────────────────────┬──────────────────────┤
│ promo    │  Live Activity Feed        │  Attack Detected     │
│ card     │  (timeline, ~60% width)    │  (hero alert, ~40%,  │
│          │                            │   glow border)       │
│          ├───────────────────────────┴──────────────────────┤
│          │  trust strip: 3 icons + "Powered by PayPal"       │
└──────────┴──────────────────────────────────────────────────┘
```

- Sidebar is fixed-width, fixed-position, full viewport height, `--bg-surface-alt` background, no scroll with main content.
- Main content area has the subtle radial glow (`--bg-canvas-glow`) anchored top-right, behind the hero only — it should not bleed into the stat-card row below.
- Stat row: 4 equal-width cards, consistent internal padding, each with a small sparkline at the bottom-right of the card — sparkline color matches the card's semantic state (green uptrend, neutral blue otherwise).
- Two-column split below is the one place hierarchy breaks the grid on purpose: the alert card is taller and visually heavier than the feed beside it, because it's the thing the product exists to show off. Don't force it into equal visual weight with the feed.
- Alignment throughout: left-aligned text, left-aligned numerals in cards — no centered body content anywhere, this is a data product, not a marketing page.

---

## 5. Components

**Badge / pill** — `border-radius: 999px`, 1px `--border-subtle`, small dot or icon + label, used for "Sandbox Mode," "PayPal AI Hackathon 2026," "High Risk." Fill color only on the risk badge (`--danger-bg`); everything else stays outline-style on dark.

**Icon badge** — rounded-square (`border-radius: 10–12px`) container, ~36–40px, soft tinted background matching the card's semantic color (blue/green/red/amber at ~12% opacity), icon in the full-strength color on top. Every card leads with one of these — consistent across stat cards, feed items, and the alert card.

**Stat card** — `--bg-surface`, 1px `--border-subtle`, `border-radius: 16px`, padding ~20px. Icon badge top-left, label above value, value large and bold, small trend indicator (arrow + %) in `--success-500` when positive. No shadow beyond the border — avoid the generic soft-grey-shadow-on-everything look; let the border do the separation work on a dark background.

**Timeline / activity feed item** — vertical connecting line on the left (1px, `--border-subtle`), a colored dot per entry (green = approved, red = blocked, blue = info/system), icon badge, two-line text block (primary line + secondary detail), timestamp right-aligned in `--text-muted`. New items entering live should do one subtle thing: a brief fade-in + the connecting dot pulsing once — not a slide-and-bounce, not a per-item hover animation.

**Critical alert card (the hero differentiator)** — this is the one place to spend visual boldness:
- `--danger-bg` background wash, 1–2px border in `--danger-500`, soft outer glow (`box-shadow: 0 0 40px var(--danger-glow)`)
- Large icon badge (shield + X), "High Risk" pill top-right
- Structured evidence block (not prose): attempted item, amount, a short bulleted violation list — exactly what Section 6/7 of the build guide calls "raw evidence," never just an AI summary
- A distinct "AI Explanation" callout (amber icon badge) kept visually subordinate to the evidence block — explanation supports the evidence, it doesn't replace it
- One primary action button ("View Details"), outline style in `--danger-500` to stay consistent with the card's palette rather than introducing blue here

**Buttons** — primary: filled `--brand-500` → `--brand-600` gradient, `border-radius: 10px`, no icon unless functional (play icon on "View Demo" is functional, not decorative). Secondary: outline, 1px `--border-strong`, transparent fill. Keep button copy as plain verbs — "View Demo," not "Explore Now →." No trailing arrow glyphs appended to button or link text.

**Sidebar nav item** — icon + label inline, full-width tappable row, `border-radius: 10px`. Active state: solid `--brand-500` fill with white text, not just a colored left-border — matches the mockup's filled "Dashboard" treatment.

---

## 6. Motion — spend it once

Per the one-bold-moment principle: the single orchestrated motion worth building is the **alert card's entrance** when a block fires live — a brief glow pulse and gentle scale-in (not a bounce), happening once per event, not on every hover. Stat cards and feed items should NOT get individual hover-lift or shadow-grow effects — that's the generic SaaS-card-kit tell. Keep hover states to a simple, subtle background-lighten (`--bg-surface` → `--bg-surface-alt`) at most.

Respect `prefers-reduced-motion`: fall back to instant state changes with no pulse/scale for anyone with that setting on.

---

## 7. Responsive behavior

- **Below ~960px**: collapse the sidebar into a top bar (logo + hamburger), stack the two-column feed/alert section vertically with the alert card first (it's the priority content, not the feed).
- **Below ~640px**: stat row goes from 4-across to a 2×2 grid; hero CTA buttons stack full-width.
- Maintain visible keyboard focus rings (`--brand-500` outline, 2px, offset) on every interactive element — nav items, buttons, the "View All" / "View Details" links.

---

## 8. How this plugs into the build

This is the visual spec for **Section 8 (UX / screens)** of `paypalguide.md`. The MVP build only needs two real screens (Setup + Live Console) — treat the stat row, sidebar, and hero banner above as the fuller product vision, and prioritize getting the **Live Activity Feed + Critical Alert Card pairing** pixel-right first, since that's the pairing your demo video actually lives or dies on. Everything else in this file (sidebar nav, footer trust strip, stat sparklines) is marketing-site polish — build it only after the attack-demo flow itself is solid and recorded.
