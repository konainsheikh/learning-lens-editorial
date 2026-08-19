"""Optimize the deployed Learning Lenz visual assets with Pillow."""

from pathlib import Path
from PIL import Image, ImageOps


SOURCE_DIR = Path("/home/ubuntu/webdev-static-assets")
TARGET_DIR = SOURCE_DIR / "optimized"
TARGET_DIR.mkdir(parents=True, exist_ok=True)

JOBS = (
    ("a-level-study-student.jpg", "learning-lenz-intro.webp", 1600, 82, False),
    ("a-level-study-notes.jpg", "learning-lenz-notes.webp", 1600, 82, False),
    ("a-level-study-notebook.jpg", "learning-lenz-notebook.webp", 1200, 80, False),
    ("learning-lens-final-logo.png", "learning-lenz-logo.webp", 512, 90, True),
)


def human_size(byte_count: int) -> str:
    return f"{byte_count / 1024:.1f} KB"


def save_webp(source_name: str, target_name: str, max_width: int, quality: int, preserve_alpha: bool) -> tuple[int, int, tuple[int, int]]:
    source = SOURCE_DIR / source_name
    target = TARGET_DIR / target_name

    with Image.open(source) as raw_image:
        image = ImageOps.exif_transpose(raw_image)
        image.thumbnail((max_width, max_width), Image.Resampling.LANCZOS)
        has_alpha = preserve_alpha and "A" in image.getbands()
        output = image.convert("RGBA" if has_alpha else "RGB")
        output.save(target, format="WEBP", quality=quality, method=6)

    return source.stat().st_size, target.stat().st_size, output.size


def save_favicon() -> tuple[int, tuple[int, int]]:
    source = SOURCE_DIR / "learning-lens-final-logo.png"
    target = TARGET_DIR / "learning-lenz-favicon.png"

    with Image.open(source) as raw_image:
        image = ImageOps.exif_transpose(raw_image).convert("RGBA")
        image.thumbnail((112, 112), Image.Resampling.LANCZOS)
        favicon = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
        offset = ((128 - image.width) // 2, (128 - image.height) // 2)
        favicon.alpha_composite(image, offset)
        favicon.save(target, format="PNG", optimize=True)

    return target.stat().st_size, favicon.size


def main() -> None:
    print("Optimized active assets")
    print("source\toutput\tdimensions\tbefore\tafter\treduction")
    for source_name, target_name, max_width, quality, preserve_alpha in JOBS:
        before, after, dimensions = save_webp(source_name, target_name, max_width, quality, preserve_alpha)
        reduction = (1 - after / before) * 100
        print(
            f"{source_name}\t{target_name}\t{dimensions[0]}x{dimensions[1]}\t"
            f"{human_size(before)}\t{human_size(after)}\t{reduction:.1f}%"
        )

    favicon_size, favicon_dimensions = save_favicon()
    print(f"learning-lenz-favicon.png\t{favicon_dimensions[0]}x{favicon_dimensions[1]}\t{human_size(favicon_size)}")


if __name__ == "__main__":
    main()
