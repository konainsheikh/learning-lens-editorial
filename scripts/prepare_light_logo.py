from pathlib import Path

from PIL import Image


SOURCE = Path("/home/ubuntu/upload/the-learning-lens-logo-white-lightblue(1).png")
OUTPUT_DIR = Path("/home/ubuntu/webdev-static-assets/learning-lens-brand")
OUTPUT = OUTPUT_DIR / "learning-lens-light-logo.webp"


def main() -> None:
    if not SOURCE.is_file():
        raise FileNotFoundError(f"Supplied logo not found: {SOURCE}")

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    image = Image.open(SOURCE).convert("RGBA")
    image.thumbnail((720, 720), Image.Resampling.LANCZOS)
    image.save(OUTPUT, "WEBP", quality=92, method=6, lossless=False)

    with Image.open(OUTPUT) as result:
        print(f"source: {Image.open(SOURCE).size[0]}x{Image.open(SOURCE).size[1]}")
        print(f"output: {result.width}x{result.height}, {OUTPUT.stat().st_size} bytes")


if __name__ == "__main__":
    main()
