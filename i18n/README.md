# CGoUI website internationalization

The Chinese website remains the canonical source. Localized pages (`en/`, `ja/`, `ko/`, `zh-HK/`, `zh-TW/`) are thin wrappers that load the corresponding canonical page and apply the shared browser-side localization runtime.

## Published locale entry points

- Chinese (Simplified): `index.html`
- English: `en/index.html`
- Japanese: `ja/index.html`
- Korean: `ko/index.html`
- Traditional Chinese (Hong Kong): `zh-HK/index.html`
- Traditional Chinese (Taiwan): `zh-TW/index.html`

The same mirrored paths are available for the standalone demos:

- `cdn_demo.html`
- `test_no_css.html`
- `examples/metro-demo/index.html`

## Files

- `localized-page.js` redirects localized wrapper pages to the canonical page with `?locale=<lang>` while preserving hash routes.
- `runtime.js` loads the single JSON dictionary matching the active non-Chinese locale (`locales/<locale>.json`), translates normal DOM text, selected user-facing attributes, dynamically routed documentation, and open Shadow DOM content, keeps links inside the active locale, and wires the language switcher. In Chinese (`zh`), dictionary loading and DOM mutation observation are skipped.
- `locales/{en,ja,ko,zh-HK,zh-TW}.json` contain per-locale `{ sourceZh: translatedText }` mappings.

## Adding or changing copy

1. Edit the Chinese source first.
2. Add or update the matching phrase in `i18n/locales/<locale>.json`.
3. Prefer complete sentences or UI phrases over short word-by-word replacements. The runtime matches longer phrases first.
4. Keep behavior-bearing identifiers, CSS variables, component tags, and API names unchanged.
5. Pass `?i18n_debug=1` on an English page to log any remaining untranslated Chinese text candidates to the console.
