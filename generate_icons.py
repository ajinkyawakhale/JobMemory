#!/usr/bin/env python3
"""Generate extension icons in different sizes."""

from PIL import Image, ImageDraw

def create_icon(size):
    """Create an icon of the specified size."""
    # Create image with purple background
    img = Image.new('RGB', (size, size), color=(102, 126, 234))
    draw = ImageDraw.Draw(img)

    # Draw checkmark
    margin = size // 8
    x1 = margin + size // 5
    y1 = size // 2
    x2 = size // 2
    y2 = size - margin
    x3 = size - margin
    y3 = margin

    # Draw checkmark lines
    thickness = max(1, size // 16)
    draw.line([(x1, y1), (x2, y2)], fill='white', width=thickness)
    draw.line([(x2, y2), (x3, y3)], fill='white', width=thickness)

    return img

# Generate icons in different sizes
sizes = [16, 32, 48, 128]
for size in sizes:
    icon = create_icon(size)
    icon.save(f'icons/icon{size}.png')
    print(f'Generated icons/icon{size}.png')

print('All icons generated successfully!')
