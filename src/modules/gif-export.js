import { createGIF } from 'gifshot';

export default function makeGifExportLink(images, delay, callback) {
  const options = {
    images,
    interval: 1,
  };

  if (delay !== 0) {
    options.interval = 1 / delay;
  }

  createGIF(options, (result) => {
    const { error, image } = result;

    if (!error) {
      callback(image);
    }
  });
}
