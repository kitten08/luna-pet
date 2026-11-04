"""Render the 10-second sleep animation from the separately generated pose."""
import math
import sys
from PIL import Image, ImageDraw, ImageFont

WIDTH, HEIGHT, FPS = 384, 576, 20
SPRITE = Image.open(sys.argv[1]).convert("RGBA")
PULSES = [(1.35, 7.6, 212, 182, 19), (4.05, 8.4, 253, 180, 17),
          (5.4, 8.95, 293, 178, 14)]


def ease(value):
    value = min(1.0, max(0.0, value))
    return value * value * (3 - 2 * value)


def breathing(t):
    if 1 <= t < 4:
        return ease((t - 1) / 3)
    if 4 <= t < 7:
        return 1 - ease((t - 4) / 3)
    if 7 <= t < 9:
        return .26 * math.sin(math.pi * (t - 7) / 2) ** 2
    return 0


def load_font(size):
    try:
        return ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia Italic.ttf", size)
    except OSError:
        return ImageFont.load_default(size=size)


fonts = {size: load_font(size) for _, _, _, _, size in PULSES}
scale_x = SPRITE.width / WIDTH
scale_y = SPRITE.height / HEIGHT
floor = HEIGHT - 8
for index in range(10 * FPS):
    t = index / FPS
    stretch = 1 + .0055 * breathing(t)
    # Subpixel motion around a fixed floor line keeps the feet anchored.
    pose = SPRITE.transform(
        (WIDTH, HEIGHT), Image.Transform.AFFINE,
        (scale_x, 0, 0, 0, scale_y / stretch, floor * scale_y * (1 - 1 / stretch)),
        resample=Image.Resampling.BICUBIC
    )
    captions = Image.new("RGBA", pose.size)
    draw = ImageDraw.Draw(captions)
    for start, end, x, y, size in PULSES:
        if start < t < end:
            phase = (t - start) / (end - start)
            opacity = round(180 * ease((t - start) / .8) * ease((end - t) / 1.15))
            draw.text((x + 8 * phase, y - 35 * phase), "Zzz", font=fonts[size],
                      fill=(147, 109, 173, opacity), anchor="ls")
    sys.stdout.buffer.write(Image.alpha_composite(pose, captions).tobytes())
