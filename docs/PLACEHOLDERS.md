# Placeholders — what to replace before sharing widely

Nothing here is invented content. Everything marked as a placeholder is clearly
labelled on the page itself, so the site can be published safely as-is.

## 1. CV / résumé

- **File:** `assets/docs/Pari-Gull-CV-PLACEHOLDER.pdf`
- **Linked from:** hero → “Download CV”
- **Action:** replace it with your real CV, keeping the same filename (or update the
  `href` in `index.html`).

## 2. Certificates

- **Where:** `index.html` → `#certificates`
- **Current state:** one real certificate (ENI Solutions internship) + five dashed
  placeholder cards.
- **Action per certificate:**
  1. Save the image to `assets/img/` (e.g. `certificate-coursera.jpg`, ~1200px wide).
  2. Copy an `<article class="cert">` block from the real certificate.
  3. Update `src`, `alt`, title, issuing organisation and completion date.
  4. Remove the `cert--placeholder` class from `<article class="cert cert--placeholder">`.

## 3. Portrait photograph

- **File:** `assets/img/profile.jpg` (1080 × 1555)
- **Action:** replace with an updated professional photograph at the same 4:5-ish
  aspect ratio. The About section crops with `object-position: 50% 22%`, so keep the
  face in the upper third.

## 4. Contact form endpoint

- **Where:** `assets/js/main.js` → `CONFIG.formEndpoint`
- **Current behaviour:** the form validates input, then opens the visitor's email
  client with the message pre-filled. No success message is faked.
- **Action:** create a form at [Formspree](https://formspree.io) (free tier works) and
  paste the endpoint:

```js
const CONFIG = {
  formEndpoint: 'https://formspree.io/f/xxxxxxxx',
  email: 'parigull111094@gmail.com',
};
```

When an endpoint is set, the form posts with `fetch` and reports the real result.

## 5. Machine-learning project card

- **Where:** `assets/js/main.js` → the last `PROJECTS` entry (`Predictive Modelling Sandbox`)
- **Current state:** marked **Coming soon**, with no links, so nothing is claimed that
  does not exist.
- **Action:** once the project is published, set `status: 'live'`, add `image` and `links`.

## 6. Social preview image

- **File:** `assets/img/og-image.png` (1200 × 630)
- **Source:** `tools/og-card.html`
- **Action:** if you change the headline or tagline, edit the source file and
  re-render it at 1200 × 630 (any browser screenshot tool works).

## 7. Domain / canonical URL

The page currently assumes `https://parigull.github.io/my_portfolio/`. If you move to a
custom domain, update the `canonical`, Open Graph and JSON-LD URLs at the top of
`index.html`, plus `site.webmanifest`.
