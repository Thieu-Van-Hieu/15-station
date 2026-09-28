---
name: Bureaucracy 1980
colors:
  surface: '#17130f'
  surface-dim: '#17130f'
  surface-bright: '#3e3834'
  surface-container-lowest: '#110d0a'
  surface-container-low: '#1f1b17'
  surface-container: '#231f1b'
  surface-container-high: '#2e2925'
  surface-container-highest: '#39342f'
  on-surface: '#ebe1da'
  on-surface-variant: '#e1bfb9'
  inverse-surface: '#ebe1da'
  inverse-on-surface: '#352f2b'
  outline: '#a88a85'
  outline-variant: '#59413d'
  surface-tint: '#ffb4a9'
  primary: '#ffb4a9'
  on-primary: '#690001'
  primary-container: '#c0392b'
  on-primary-container: '#ffe5e1'
  inverse-primary: '#b02d21'
  secondary: '#61de8a'
  on-secondary: '#00391a'
  secondary-container: '#18a659'
  on-secondary-container: '#003115'
  tertiary: '#ffb3ae'
  on-tertiary: '#65080f'
  tertiary-container: '#b44441'
  on-tertiary-container: '#ffe4e2'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffdad5'
  primary-fixed-dim: '#ffb4a9'
  on-primary-fixed: '#410000'
  on-primary-fixed-variant: '#8e130c'
  secondary-fixed: '#7efba4'
  secondary-fixed-dim: '#61de8a'
  on-secondary-fixed: '#00210c'
  on-secondary-fixed-variant: '#005228'
  tertiary-fixed: '#ffdad7'
  tertiary-fixed-dim: '#ffb3ae'
  on-tertiary-fixed: '#410004'
  on-tertiary-fixed-variant: '#852222'
  background: '#17130f'
  on-background: '#ebe1da'
  surface-variant: '#39342f'
typography:
  headline-lg:
    fontFamily: Domine
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: 0.02em
  headline-lg-mobile:
    fontFamily: Domine
    fontSize: 26px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: 0.01em
  headline-md:
    fontFamily: Domine
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: 0.03em
  headline-sm:
    fontFamily: Domine
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
    letterSpacing: 0.04em
  body-lg:
    fontFamily: Courier Prime
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Courier Prime
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0.01em
  body-sm:
    fontFamily: Courier Prime
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-lg:
    fontFamily: Space Mono
    fontSize: 13px
    fontWeight: '700'
    lineHeight: 18px
    letterSpacing: 0.08em
  label-md:
    fontFamily: Space Mono
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  label-sm:
    fontFamily: Space Mono
    fontSize: 9px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.12em
spacing:
  gutter: 1.25rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system channels the austere, tangible atmosphere of late subsidy-era Vietnam (thời kỳ bao cấp, 1979–1987) bureaucratic administration, fused with the mechanical dread and tactile tact of investigative document simulation. The emotional response is one of calculated scrutiny, mechanical precision, and tactile nostalgia: heavy wooden desks, aged off-white administrative forms, ink-bleed endorsements, and solemn archival gravity.

The visual style is **Tactile Skeuomorphism crossed with Documentarian Brutalism**. Interfaces are structured not as abstract digital viewports, but as physical surfaces: dark lacquer walnut desks, Manila archival folders, ration permits, carbon-copy quadruplicates, and ink-stained physical validation mechanics. Every state change mimics physical archival custody—stamped approvals, stapled endorsements, and folded card edges.

## Colors

The system operates on an archival desk paradigm where the viewport background represents the worn desktop surface, while documents and workspace panels occupy aged paper tiers.

- **Primary (`#C0392B`) — Ink Stamp Vermilion:** Reserved for state authority, critical inspection seals, "DENIED" / "TỪ CHỐI" endorsements, urgent registry warnings, and destructive state actions.
- **Secondary (`#27AE60`) — Registry Green:** Dedicated to authorized status approvals ("CHẤP THUẬN"), validated dossier indicators, balance parity, and passing administrative states.
- **Tertiary (`#8B2626`) — Oxidized Iron Red:** Used for faded secondary seals, expired permit markers, warning margins, and secondary stamps.
- **Neutral Surface Palette:**
  - Desk Base Canvas: `#1F1C1A` (Deep smoked walnut wood base).
  - Desk Surface Workplane: `#2B2622` (Oiled lacquer desk planking).
  - Folder Manila Board: `#D4C5A9` (Heavy stock bureaucratic filing paper).
  - Document Parchment Light: `#F0EAD6` (Standard administrative paper stock).
  - Carbon Copy Neutral: `#E2D7C3` (Secondary duplicate slip paper).
  - Archival Ink Black: `#181513` (Slightly faded mechanical typewriter ribbon black).
  - Faded Rule Line: `#A89A84` (Document grid boundaries and ruled tabulation lines).

## Typography

Typography embodies the formal friction between state printing presses and desk-level mechanical typewriters:

- **Headlines (Domine):** Chosen for its authoritative, sturdy, early-twentieth-century editorial gravitas. Used for official mastheads, decree titles, departmental headers, and registry ledger headings. Set primarily in uppercase or sentence case with wide letter tracking.
- **Body Text (Courier Prime):** The workhorse typeface representing standard ribbon-typed administrative documents, dossier notes, witness statements, and inspector records.
- **Data & Metadata Labels (Space Mono):** Used for serialized identity numbers, date stamps, grain ledger tallies, validation criteria, and metric comparison keys.

Text rendered on `#F0EAD6` or `#E2D7C3` surfaces must strictly use `#181513` ink. Text rendered directly against the walnut `#1F1C1A` desktop must use `#D4C5A9` for high-legibility archival reading.

## Layout & Spacing

The layout operates as a simulated desktop workspace. The core structure is a dual-pane or tri-pane physical staging area:
- **Left / Dossier Bay:** Permanent incoming documentation, registry files, and reference guidelines.
- **Center / Inspection Stage:** Active validation viewport where documents lie flat under inspection.
- **Right / Ledger & Stamping Station:** Verdict validation controls, dual-metric comparison cards, and stamp tools.

Grid behavior:
- **Desktop (1200px+):** Fixed desk viewport layout with independent vertical panning per paper document lane. Panels separated by `gutter` (1.25rem) representing wood divider trim or paper overlaps.
- **Tablet (768px - 1199px):** Split-view workspace with collapsable reference rule drawer.
- **Mobile (<768px):** Stacked sheet hierarchy. Physical tabs simulate stacked folders anchored to the bottom edge, allowing inspectors to flick between citizen identity cards, registry rulebooks, and inspection verification sheets.

## Elevation & Depth

Visual depth avoids modern diffused drop shadows. Instead, it relies strictly on **layered paper tactility, card stacking, and mechanical contact shadows**:

- **Level 0 (Desk Surface):** Dark matte walnut wood `#1F1C1A` with subtle linear grain texture and low specular finish.
- **Level 1 (Archival Dossier / Manila Folder):** Color `#D4C5A9`. Shadow: `2px 3px 0px rgba(0, 0, 0, 0.45)`—hard, close, offset drop shadow simulating stiff paperboard resting on wood.
- **Level 2 (Active Paper Document):** Color `#F0EAD6` or `#E2D7C3`. Shadow: `3px 5px 0px rgba(18, 15, 13, 0.35)`. Documents feature a 1px solid border of `#C2B59D` to define page boundaries against stacked forms.
- **Level 3 (Focused Document / Overlay Inset):** Raised active forms feature `6px 10px 0px rgba(10, 8, 7, 0.5)` with a subtle -0.5deg to +0.5deg rotational skew to convey hand-placed desk documents.
- **Level 4 (Physical Fasteners & Metal Pins):** Paperclips, brass split pins, and stamp handles cast an immediate directional contact shadow: `1px 2px 1px rgba(0, 0, 0, 0.6)`.

## Shapes

The geometry is uncompromisingly **Sharp (`0`)**. 

All identity cards, permits, ration books, and comparison blocks are cut at exact 90-degree right angles, mirroring physical industrial guillotine-cut paper stock. The only non-rectangular forms are physically motivated:
- Trimmed 45-degree top-right corners for official file-tag cards (`clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)`).
- Circular or double-ringed oval vectors used strictly for red and green ink verification stamps.
- Perforated receipt teardown strips simulated via dashed stroke borders (`border-style: dashed; border-width: 1px`).

## Components

### 1. Verification Buttons & Rubber Stamps
- **Rubber Stamps (Primary Actions):** Rather than standard digital buttons, decision triggers act as stamp impressions. Rectangular double-bordered boxes (`3px double #C0392B` for Deny, `#27AE60` for Approve) angled at -3° or +2° with rough interior uppercase typography (`Space Mono` 13px, tracking `0.15em`). On hover or active state, opacity shifts with an ink-smudge imprint animation.
- **Utility Buttons:** Stiff paperboard tabs (`#D4C5A9`) bordered with `1px solid #A89A84`, text in `#181513`. Hover state shifts background to `#C7B696` with an immediate `1px 1px 0px #000` press offset.

### 2. Dual-Metric Comparison Cards
- Designed as physical ledger slips with two side-by-side tabular columns comparing Citizen Declarations against State Registry Records (e.g., Household Book [Sổ Hộ Khẩu] versus Identity Card).
- Separated by a faint vertical dotted boundary (`1px dashed #A89A84`). Discrepancies are highlighted by an oxidized red pencil underline (`border-bottom: 2px solid #8B2626`) and an alert indicator.

### 3. Identity Dossiers & Paper Documents
- Constructed using background `#F0EAD6`, containing header bands with typewriter rules (`====`, `----`).
- Black-and-white grain-filtered citizen portraits secured with simulated metal corner clips or a stamped boundary edge.
- Folders carry a top tab with typed monospaced serial reference codes (e.g., `KT3-1983-0498`).

### 4. Form Inputs & Text Fields
- Input fields are not inset boxes; they are underscored paper lines (`border-bottom: 1px solid #181513`, `background: transparent`).
- Input text appears in `Courier Prime` dark ink (`#181513`). Focused fields show a faint carbon-paper ink-blot caret.

### 5. Checkboxes & Stamp Selectors
- Checkboxes render as printed square registration marks (`[]` or `14px x 14px` raw border box `1px solid #181513`).
- Checked state is an energetic handwritten ink "X" or diagonal slash in primary red or registry green ink.

### 6. Fasteners & Attachment Elements
- **Paperclips:** Metallic wire graphics (`#7F8C8D`) anchored to top-left corners of nested permits, anchoring supplemental receipts to main dossiers.
- **Perforated Vouchers:** Removable coupon chits featuring scissor dash boundaries and serialized tally numbers.