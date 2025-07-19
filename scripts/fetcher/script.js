// https://khms3.google.com/kh/v=999?x=579434&y=767013&z=21

import fetch from 'node-fetch';
import { writeFileSync, mkdirSync, mkdir } from 'fs';

async function downloadImage(imageUrl, outputPath) {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      console.log(`HTTP error! status: ${response.status}`);
    }

    const imageBuffer = await response.buffer();

    writeFileSync(outputPath, imageBuffer);

  } catch (error) {
    console.log('Error downloading image:', error);
  }
}

async function downloadTile(x, y, zoom) {
  await downloadImage(
    `https://khms3.google.com/kh/v=999?x=${x}&y=${y}&z=${zoom}`,
    `../../tiles/${zoom}/${x}-${y}.png`
  );
}

async function downloadTiles(zoom) {
  mkdirSync(`./tiles/${zoom}`, { recursive: true })

  for (let y = 0; y < Math.pow(2, zoom); y++) {
    console.log(y);

    for (let x = 0; x < Math.pow(2, zoom); x++) {
      await downloadTile(x, y, zoom);
    }
  }
}

downloadTiles(7);
