"""Regenerate every Keystone icon from the bitmap masters in masters.py.

    python3 brand/build.py        (needs Pillow; .icns needs macOS iconutil)

Writes the web icons into apps/docs and apps/storybook, and the macOS app
icon set into brand/macos/. Edit a master, rerun, commit the outputs.
"""
import json, os
from PIL import Image, ImageDraw
from masters import G32, GFAV, shade
import macos

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
DOCS = f"{ROOT}/apps/docs"
SB = f"{ROOT}/apps/storybook"

TILE_TOP, TILE_BOT = "#1E212C", "#0C0D13"
INK = {"#": "#E8ECF2", "K": "#0072F5", "H": "#6EB2FF", "S": "#0048AA"}
INK_ON_LIGHT = "#09090b"
INK_ON_DARK = "#ffffff"


def runs(grid):
    """Horizontal runs of one colour per row: (x, y, w, colour)."""
    for y, row in enumerate(grid):
        x = 0
        while x < len(row):
            c = row[x]
            if c == ".":
                x += 1
                continue
            w = 1
            while x + w < len(row) and row[x + w] == c:
                w += 1
            yield x, y, w, INK[c]
            x += w


def tile_svg_body(prefix):
    """The 16-unit full-bleed tile with its glyph, as SVG elements."""
    g = shade(GFAV)
    rects = "".join(
        f'<rect x="{x}" y="{y}" width="{w}" height="1" fill="{c}"/>'
        for x, y, w, c in runs(g)
    )
    return (
        f'<defs><linearGradient id="{prefix}t" x1="0" y1="0" x2="0" y2="1">'
        f'<stop offset="0" stop-color="{TILE_TOP}"/><stop offset="1" stop-color="{TILE_BOT}"/>'
        f"</linearGradient></defs>"
        f'<rect width="16" height="16" rx="3.5" fill="url(#{prefix}t)"/>'
        f'<g shape-rendering="crispEdges">{rects}</g>'
    )


def icon_svg():
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16">'
        f"{tile_svg_body('ks')}</svg>\n"
    )


def logo_full_svg(text_fill):
    # 5:1 box to match the 120x24 nav image; the tile fills the height so
    # each bitmap cell is 1.5 CSS px (3 device px on a 2x screen).
    return (
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 16" width="120" height="24">'
        f"{tile_svg_body('ks')}"
        '<text x="20.5" y="12.4" font-family="Inter, -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, Helvetica, sans-serif" '
        f'font-size="11.6" font-weight="800" letter-spacing="-0.45" fill="{text_fill}">keystone</text>'
        "</svg>\n"
    )


def raster_tile(size, cell, radius_frac, glyph):
    """Full-bleed square raster: gradient tile plus a crisp glyph."""
    ss = 4
    big = Image.new("RGBA", (size * ss, size * ss), (0, 0, 0, 0))
    grad = Image.new("RGBA", big.size)
    gd = ImageDraw.Draw(grad)
    top = tuple(int(TILE_TOP[i : i + 2], 16) for i in (1, 3, 5))
    bot = tuple(int(TILE_BOT[i : i + 2], 16) for i in (1, 3, 5))
    for y in range(big.size[1]):
        t = y / (big.size[1] - 1)
        gd.line([(0, y), (big.size[0], y)], fill=tuple(round(top[i] + (bot[i] - top[i]) * t) for i in range(3)) + (255,))
    mask = Image.new("L", big.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, big.size[0] - 1, big.size[1] - 1], radius_frac * big.size[0], fill=255)
    big.paste(grad, (0, 0), mask)
    img = big.resize((size, size), Image.LANCZOS)
    rows = [y for y, r in enumerate(glyph) if r.strip(".")]
    cols = [x for r in glyph for x, c in enumerate(r) if c != "."]
    x0, x1, y0, y1 = min(cols), max(cols), min(rows), max(rows)
    ox = round((size - (x1 - x0 + 1) * cell) / 2)
    oy = round((size - (y1 - y0 + 1) * cell) / 2)
    d = ImageDraw.Draw(img)
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            c = glyph[y][x]
            if c != ".":
                X, Y = ox + (x - x0) * cell, oy + (y - y0) * cell
                d.rectangle([X, Y, X + cell - 1, Y + cell - 1], fill=INK[c])
    return img


def fav_raster(size):
    """The favicon grid at an exact multiple of 16, nearest-neighbour."""
    k = size // 16
    img = raster_tile(size, k, 3.5 / 16, shade(GFAV))
    return img


def write(path, data):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    mode = "wb" if isinstance(data, bytes) else "w"
    with open(path, mode) as f:
        f.write(data)


def main():
    # Favicon: SVG on a 16-unit grid stays pixel-exact at 16, 32, 48 px.
    write(f"{DOCS}/app/icon.svg", icon_svg())
    fav_raster(48).save(f"{DOCS}/app/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)],
                        append_images=[fav_raster(16), fav_raster(32)])
    # iOS masks the touch icon itself, so it is opaque and square.
    raster_tile(180, 4, 0, shade(G32)).convert("RGB").save(f"{DOCS}/app/apple-icon.png")
    # Web app manifest icons. The maskable one keeps the glyph inside the
    # 80% safe circle.
    raster_tile(192, 4, 0.2, shade(G32)).save(f"{DOCS}/public/icon-192.png")
    raster_tile(512, 11, 0.2, shade(G32)).save(f"{DOCS}/public/icon-512.png")
    raster_tile(512, 9, 0, shade(G32)).convert("RGB").save(f"{DOCS}/public/icon-maskable-512.png")
    # Nav logos. "-dark" has dark text (light theme), "-light" has light text.
    write(f"{DOCS}/public/logo-icon-dark.svg", icon_svg())
    write(f"{DOCS}/public/logo-icon-light.svg", icon_svg())
    write(f"{DOCS}/public/logo-full-dark.svg", logo_full_svg(INK_ON_LIGHT))
    write(f"{DOCS}/public/logo-full-light.svg", logo_full_svg(INK_ON_DARK))
    # Social card mark, inlined because the card renders without file access.
    write(f"{DOCS}/lib/brand-mark.ts",
          "// Generated by brand/build.py. Do not edit.\n"
          "/** The Keystone tile (16-unit pixel grid) as an SVG string. */\n"
          f"export const BRAND_MARK_SVG =\n  '{icon_svg().strip()}';\n")
    write(f"{DOCS}/public/site.webmanifest", json.dumps({
        "name": "Keystone UI", "short_name": "Keystone",
        "icons": [
            {"src": "/icon-192.png", "sizes": "192x192", "type": "image/png"},
            {"src": "/icon-512.png", "sizes": "512x512", "type": "image/png"},
            {"src": "/icon-maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
        "theme_color": TILE_BOT, "background_color": TILE_BOT, "display": "browser",
    }, indent=2) + "\n")
    # Storybook
    write(f"{SB}/public/favicon.svg", icon_svg())
    write(f"{SB}/public/logo-full-dark.svg", logo_full_svg(INK_ON_LIGHT))
    # macOS app icon (blue and mono)
    macos.build(f"{HERE}/macos")
    print("ok")


if __name__ == "__main__":
    main()
