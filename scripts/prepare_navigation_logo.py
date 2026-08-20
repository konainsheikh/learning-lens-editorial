from pathlib import Path

from PIL import Image


SOURCE = Path("/home/ubuntu/upload/the-learning-lens-logo-nobg-cropped.png")
OUTPUT_DIR = Path("/home/ubuntu/webdev-static-assets/learning-lens-brand")
NAV_OUTPUT = OUTPUT_DIR / "learning-lens-navigation-logo.webp"
FAVICON_OUTPUT = OUTPUT_DIR / "learning-lens-favicon.png"


def save_navigation_logo(image: Image.Image) -> None:
    logo = image.copy()
    logo.thumbnail((560, 320), Image.Resampling.LANCZOS)
    logo.save(NAV_OUTPUT, "WEBP", quality=92, method=6, lossless=False)


def save_favicon(image: Image.Image) -> None:
    favicon = image.copy()
    favicon.thumbnail((128, 128), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
    x = (128 - favicon.width) // 2
    y = (128 - favicon.height) // 2
    canvas.alpha_composite(favicon, (x, y))
    canvas.save(FAVICON_OUTPUT, "PNG", optimize=True)


def main() -> None:
    if not SOURCE.is_file():
        raise FileNotFoundError(f"Supplied logo not found: {SOURCE}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    image = Image.open(SOURCE).convert("RGBA")
    save_navigation_logo(image)
    save_favicon(image)

    print(f"source: {image.width}x{image.height}, mode={image.mode}")
    for path in (NAV_OUTPUT, FAVICON_OUTPUT):
        with Image.open(path) as result:
            print(f"{path.name}: {result.width}x{result.height}, {path.stat().st_size} bytes")


if __name__ == "__main__":
    main()
