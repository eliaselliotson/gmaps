import cv2
import os
import glob
import numpy as np

image_folder = "../../tiles/<your_number_here>"
output_file = "../../maps/<your_number_here>.png"

tile_paths = glob.glob(os.path.join(image_folder, "*.png"))
def parse_tile_info(path):
    filename = os.path.basename(path)
    name, _ = os.path.splitext(filename)
    x_str, y_str = name.split('-')
    return int(x_str), int(y_str), path

tiles_info = [parse_tile_info(p) for p in tile_paths]

tiles_info.sort(key=lambda t: (t[1], t[0])) 

xs = sorted(set(x for x, y, _ in tiles_info))
ys = sorted(set(y for x, y, _ in tiles_info))
cols = len(xs)
rows = len(ys)

tile_w, tile_h = None, None
stitched_image = None

for row_idx, y in enumerate(ys):
    row_images = []
    for col_idx, x in enumerate(xs):
        path = next(p for tx, ty, p in tiles_info if tx == x and ty == y)
        img = cv2.imread(path)
        if tile_w is None:
            tile_h, tile_w = img.shape[:2]
        row_images.append(img)
    row_combined = np.hstack(row_images)
    if stitched_image is None:
        stitched_image = row_combined
    else:
        stitched_image = np.vstack([stitched_image, row_combined])

cv2.imwrite(output_file, stitched_image)
print(f"✅ Correctly stitched map saved as: {output_file}")
