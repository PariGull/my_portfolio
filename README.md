# Pari Gull — Portfolio

Premium dark-editorial portfolio for **Pari Gull — Web Developer | Data Analyst | Problem Solver**.

Live site: **https://parigull.github.io/my_portfolio/**

---

## Stack

Deliberately dependency-free — no frameworks, no build step, no CDN CSS.

| Layer | Choice |
| --- | --- |
| Markup | Semantic HTML5, single page |
| Styling | Hand-written CSS with design tokens (`:root` variables) |
| Scripting | Vanilla JavaScript, three small modules |
| Fonts | Space Grotesk · Inter · JetBrains Mono (Google Fonts) |
| Icons | Inline SVG sprite (no icon library) |
| Hosting | GitHub Pages (branch `main`, folder `/`) |

## Structure

```
.
├── index.html                     # the whole page
├── 404.html                       # branded not-found page
├── site.webmanifest               # PWA metadata
├── assets/
│   ├── css/styles.css             # design system + all components
│   ├── js/
│   │   ├── main.js                # nav, reveal, project data, modals, form
│   │   ├── calculator.js          # scientific calculator
│   │   └── mathlab.js             # graphing, stats, LP, population, Monte Carlo
│   ├── img/
│   │   ├── profile.jpg            # portrait (About section)
│   │   ├── cert-eni-solutions.jpg # internship certificate
│   │   ├── og-image.png           # social sharing card (1200×630)
│   │   ├── favicon.svg
│   │   └── projects/              # project thumbnails
│   └── docs/Pari-Gull-CV-PLACEHOLDER.pdf
├── tools/og-card.html             # source for the OG image
└── archive/portfolio-v1.html      # previous single-file version (reference)
```

## Local development

No tooling required. Any static server works:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly via `file://` mostly works, but a local server is
recommended so that fonts, the manifest and relative paths behave exactly as in
production.

## Editing content

### Add or reorder projects

Open `assets/js/main.js` and edit the `PROJECTS` array near the top. Each entry:

```js
{
  title: 'Project name',
  category: 'web',            // 'web' | 'data' | 'ml' | 'math'
  year: '2026',
  status: 'live',             // 'live' | 'demo' | 'soon'
  description: 'One or two sentences.',
  problem: 'The problem it solves.',
  tech: ['Python', 'SQL'],
  image: 'assets/img/projects/my-project.jpg',   // optional
  links: [{ label: 'Live demo', href: 'https://…', primary: true, external: true }],
  demos: [{ label: 'Calculator', modal: 'calcModal' }] // optional, opens an in-page modal
}
```

Cards render automatically, and the filter buttons derive from `category`.

### Add a certificate

Certificates are plain HTML in `index.html` (section `#certificates`) so they stay
readable without JavaScript. Copy an existing `<article class="cert">` block, drop
your image into `assets/img/`, then update `src`, `alt`, title, issuer and date.
Delete the `cert--placeholder` class once a real certificate is in place.

### Enable the contact form (optional)

The form posts nothing by default — it hands the message to the visitor's email
client and says so. For real submissions, set `CONFIG.formEndpoint` in
`assets/js/main.js` to a Formspree (or similar) endpoint:

```js
const CONFIG = { formEndpoint: 'https://formspree.io/f/xxxxxxxx', email: '…' };
```

### Replace placeholders

See [docs/PLACEHOLDERS.md](docs/PLACEHOLDERS.md) for the CV, certificates, portrait
and form-endpoint checklist.

## The interactive mathematics suite

Six tools run entirely in the browser using the Canvas API:

1. Scientific calculator (`calcModal`) — trigonometry, logs, factorials, memory, history.
2. Function graphing (`mathModal1`) — y = x², y = 2x + 3, y = sin(x) with adjustable range.
3. Probability & statistics playground (`mathModal2`) — mean, median, mode, variance, SD + bar chart.
4. Linear programming visualiser (`mathModal3`) — feasible region and optimal corner point.
5. Population growth simulator (`mathModal4`) — exponential vs logistic models.
6. Monte Carlo studio (`mathModal5`) — π estimation by random sampling.

## Accessibility & performance notes

- One `<h1>`, ordered headings, skip link, visible focus states.
- Every control is keyboard reachable; modals trap focus, close on `Esc`, and lock scroll.
- All images have meaningful `alt` text; decorative visuals are `aria-hidden`.
- Text contrast meets WCAG AA (body and meta text ≥ 4.5:1 on their backgrounds).
- `prefers-reduced-motion` disables canvas animation, marquee and reveal transitions.
- No render-blocking CSS frameworks; JS is deferred; images are lazy-loaded.

## Deployment

GitHub Pages serves this repository from `main` / root. Pushing to `main` is all
that is required:

```bash
git add .
git commit -m "Describe the change"
git push origin main
```

Verify the build under **Settings → Pages** or via:
`gh api /repos/PariGull/my_portfolio/pages`.
