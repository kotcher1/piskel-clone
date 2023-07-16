import { APNGencoder } from '../libs/canvas2apng';

export default function makeApngExportLink(images, delay, canvasSize, callback) {
  const canvas = document.createElement('canvas');
  canvas.setAttribute('width', canvasSize);
  canvas.setAttribute('height', canvasSize);
  const context = canvas.getContext('2d');

  const image = new Image();

  const interval = delay && 1 / delay;
  const encoder = new APNGencoder(canvas);
  encoder.setDelay(interval);
  encoder.setRepeat(0);

  encoder.start();

  let curImg = 0;
  const lastImg = images.length - 1;

  function addImg() {
    if (curImg === lastImg) {
      encoder.finish();
      callback(encoder.stream().toStrBase64());
      return;
    }

    curImg += 1;
    context.drawImage(image, 0, 0);
    encoder.addFrame();

    image.src = images[curImg];
  }

  image.onload = addImg;
  image.src = images[curImg];
}
