// https://khms3.google.com/kh/v=999?x=579434&y=767013&z=21

import { createWriteStream, mkdirSync } from 'fs';
import request from 'request';

let counter = 0;

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
    try {
        request(uri).pipe(createWriteStream(filename)).on('close', callback);
    } catch(e) {}
  });
};

function downloadZoom(z) {
  for (let y = 0; y < Math.pow(2, z); y++) {
    for (let x = 0; x < Math.pow(2, z); x++) {
      download(`https://khms3.google.com/kh/v=999?x=${x}&y=${y}&z=${z}`, `./tiles/${z}/${x}-${y}.png`, function() {
        counter++;
        if (counter%100 === 0) {
          console.log(counter);
        }
      });
    }
  }
}

mkdirSync(`./tiles/5`, { recursive: true })
downloadZoom(5);
