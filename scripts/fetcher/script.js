// https://khms3.google.com/kh/v=999?x=579434&y=767013&z=21

import fetch from 'node-fetch';
import { writeFileSync, mkdirSync } from 'fs';
import readline from 'readline';
import cliProgress from 'cli-progress';

const rl = readline.createInterface({input: process.stdin, output: process.stdout});
let failedDownloads = 0;

async function downloadImage(imageUrl, outputPath) {
  try {
    const response = await fetch(imageUrl);

    if (!response.ok) {
      // console.log(`HTTP error! status: ${response.status}`);
      failedDownloads++;
      return;
    }

    const imageBuffer = await response.buffer();

    writeFileSync(outputPath, imageBuffer);

  } catch (error) {
    // console.log('Error downloading image:', error);
    failedDownloads++;
  }
}

async function downloadTile(x, y, zoom, outputPath) {
  await downloadImage(
    `https://khms3.google.com/kh/v=999?x=${x}&y=${y}&z=${zoom}`,
    outputPath
  );
}

async function downloadTiles({ zoom, minX, minY, maxX, maxY, progressBar, outputDirectory }) {
  let count = 0;

  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      await downloadTile(x, y, zoom, `${outputDirectory}/${x - minX}-${y - minY}.png`);
      count++;
      progressBar.update(count);
    }
  }

  progressBar.stop();
}



// Give the user some instructions about input
console.log(`
Enter a zoom level between 0-21 and optionally 2 coordinates
defining a bounding box.

Format: zoom x1 y1 x2 y2
Example: 19 136273 194941 136294 194962
`);

// Wait for user input
rl.question('> ', async (ans) => {
  // Close the input
  rl.close();

  // Initialize some variables
  let settings = ans.split(' ').map(e => +e);
  let zoom = settings[0];
  let scale = Math.pow(2, zoom);
  let coords = [0, 0, scale, scale];
  let tileCount = 0;

  // Process the coordinates, if any
  if (settings.length === 5) {
    const x1 = settings[1];
    const y1 = settings[2];
    const x2 = settings[3];
    const y2 = settings[4];
    const xs = [Math.min(x1, x2), Math.max(x1, x2)];
    const ys = [Math.min(y1, y2), Math.max(y1, y2)];

    coords = [xs[0], ys[0], xs[1], ys[1]];
  }

  tileCount = (coords[2] - coords[0]) * (coords[3] - coords[1]);

  // Output some debug info
  console.log("");
  console.log(`Tile zoom: x${Math.pow(2, zoom)} (level ${zoom})`);
  console.log(`Tile coords: (${coords[0]}, ${coords[1]}) to (${coords[2]}, ${coords[3]})`);
  console.log(`Tile range: ${coords[2] - coords[0]} x ${coords[3] - coords[1]}`);
  console.log(`Tile count: ${tileCount}`)
  console.log("");

  // Create a directory for to output the files to
  const dirID = BigInt(zoom + coords.join('') + Date.now()).toString(36);
  const dirname = `gmap-${dirID}`;

  mkdirSync(`./${dirname}`, { recursive: true });
  console.log(`Files will be downloaded to: ${process.cwd()}/${dirname}\n`);

  // Create a visual progress bar
  const progressBar = new cliProgress.SingleBar({
    format: `Downloading |\x1b[32m {bar} \x1b[0m| {percentage}% | {value}/{total} Tiles`,
    barsize: 60
  }, cliProgress.Presets.shades_classic);

  progressBar.start(tileCount, 0);

  // Download the gmaps tiles
  await downloadTiles({
    zoom: zoom,
    minX: coords[0],
    minY: coords[1],
    maxX: coords[2],
    maxY: coords[3],
    progressBar: progressBar,
    outputDirectory: `./${dirname}`
  });

  // Create a debug report for the number of successful downloads
  console.log('');
  console.log(`Total tiles: ${tileCount}`);
  console.log(`Failed tiles: ${failedDownloads}`);
  console.log(`Successful tiles: ${tileCount - failedDownloads}`);
  console.log(`Success rate: ${((1 - (failedDownloads / tileCount)) * 100).toFixed(2)}%`);
  console.log('');
});
