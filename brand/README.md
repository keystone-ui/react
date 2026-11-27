# Keystone mark

A keystone arch drawn as 1-bit-style pixel art, on a dark tile. Every icon
file in the repo is generated from the bitmap masters in `masters.py`:

| Output | Where | Master |
| --- | --- | --- |
| Favicon (`favicon.ico`, `icon.svg`), nav logos, Storybook favicon and sidebar logo, social-card mark | `apps/docs`, `apps/storybook` | `FAV` (16-unit grid, so it is pixel-exact at 16/32/48 px) |
| Apple touch icon, web manifest icons | `apps/docs/app`, `apps/docs/public` | `L32` |
| macOS app icon (`.icns`, `.iconset`, PNGs), blue and mono | `brand/macos/` | `L32`, `L16`, `L8` |

The macOS set follows Apple's 1024 template: 824 px body at a 100 px inset,
corner radius 185.4, shadow 50% black, blur 28, y +12. Web icons are
full-bleed instead, since browsers and iOS apply their own masks.

## Regenerate

```bash
python3 -B brand/build.py   # needs Pillow; the .icns step needs macOS iconutil
```

Edit a master (each is the left half of a symmetric drawing), rerun, and commit
the outputs. Don't hand-edit the generated files.
