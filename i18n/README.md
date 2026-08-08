# CGoUI website internationalization

The Chinese website remains the canonical source. English and Japanese pages are thin wrappers that load the corresponding canonical page and apply the shared browser-side localization runtime.

## Published locale entry points

- Chinese: `index.html`
- English: `en/index.html`
- Japanese: `ja/index.html`

The same mirrored paths are available for the current standalone demos:

- `cdn_demo.html`
- `test_no_css.html`
- `examples/metro-demo/index.html`

## Files

- `localized-page.js` loads the canonical page while preserving the localized URL and hash route.
- `runtime.js` translates normal DOM text, selected user-facing attributes, dynamically routed documentation, and open Shadow DOM content. It also keeps links inside the active locale and adds a language switcher.
- `catalog-core.js` contains shared UI, component-documentation, component-default and common example translations.
- `catalog-foundation.js` contains welcome, foundation, metro-color and deployment-guide translations.
- `catalog-demos.js` contains standalone demo and long example translations.

## Adding or changing copy

1. Edit the Chinese source first.
2. Add or update the matching phrase in the appropriate catalogue.
3. Prefer a complete sentence or complete UI phrase over short word-by-word replacements. The runtime applies longer phrases first.
4. Keep behavior-bearing identifiers, CSS variables, component tags and API names unchanged.
5. When a copied code sample contains a localized human-readable string, make sure the translation still produces valid sample code.

English pages log remaining Chinese text candidates to the browser console after load. This is intended as a maintenance aid when new Chinese copy is added to the canonical site.
