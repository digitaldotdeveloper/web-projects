# Web Projects — Digital Dot

A live showcase of front-end work by [Digital Dot](https://digitaldotdeveloper.com): hand-built HTML sliders and full website concepts.

**Live gallery:** https://digitaldotdeveloper.github.io/web-projects/

## What's inside

| Project | Type | Open |
|---|---|---|
| Cedar Flame — Resto Slider | Slider | [`sliders/resto-cedar-flame/`](sliders/resto-cedar-flame/) |
| Veloura — Chocolate Brand | Slider | [`sliders/chocolate-veloura/`](sliders/chocolate-veloura/) |
| Rachidi Home — Live Slider | Slider | [`sliders/rachidi/`](sliders/rachidi/) |
| FleetRemarket — Concept 1 | Website | [`sites/fleetremarket/`](sites/fleetremarket/) |
| FleetRemarket — Concept 2 | Website | [`sites/fleetremarket/concept-2/`](sites/fleetremarket/concept-2/) |
| Batroun Golden Sky Hotel | Website | [`sites/batroun-golden-sky-hotel/`](sites/batroun-golden-sky-hotel/) |
| Ember Noir | Website | [`sites/ember-noir/`](sites/ember-noir/) |

## Structure

```
index.html      → the gallery (front door)
sliders/        → one folder per slider, each with its own index.html
sites/          → one folder per website, each with its own index.html
```

## Adding a new project

1. Drop the project into `sliders/<name>/` or `sites/<name>/` with an `index.html` inside.
2. Add a matching `<a class="card">` block to `index.html`.
3. Commit and push — GitHub Pages redeploys automatically.

## Notes

- Hosted free on **GitHub Pages** (public repo required on the free plan).
- No credentials or API keys live in this repo — showcase front-end only.
- All images are WebP and below-the-fold images lazy-load, with `fetchpriority="high"` hints on each page's hero for fast first paint.
