import { Sortable } from '@shopify/draggable';
import './screens/index.css';
import makeGifExportLink from './modules/gif-export';
import makeApngExportLink from './modules/apng-export';

const main = document.getElementById('main');

function addElement(element, elementClass, elementId, parent) {
  const elem = document.createElement(element);
  elem.id = elementId;
  elem.className = elementClass;
  parent.appendChild(elem);
  return elem;
}

function add(element, elementClass, elementId, elemX, isAfter) {
  const elem = document.createElement(element);
  elem.id = elementId;
  elem.className = elementClass;
  if (isAfter) {
    elemX.after(elem);
  } else {
    elemX.before(elem);
  }
  return elem;
}

let sizeInSquares = localStorage.getItem('squares') || 32;
const canvasSize = 512;
let scale = canvasSize / sizeInSquares;
const gallery = JSON.parse(localStorage.getItem('gallery')) || {};
const galleryKeys = Object.keys(gallery);

const toolsContainer = addElement('section', 'tools-container', 'toolsContainer', main);
const resizeSet = addElement('div', 'resize-set', 'resizeSet', toolsContainer);

const numberOfSizes = 4;
for (let i = 1; i <= numberOfSizes; i += 1) {
  const elem = addElement('div', `size x${i}`, `size${i}`, resizeSet);
  elem.innerHTML = `x${i}`;
}

let mouseSize = localStorage.getItem('mouseSize') || 1;

const toolsSet = addElement('div', 'tools-set', 'toolsSet', toolsContainer);
const numberOfInstruments = 6;
const toolsList = ['pen', 'eraser', 'stroke', 'bucket', 'onecolor', 'picker'];
for (let i = 1; i <= numberOfInstruments; i += 1) {
  addElement('div', `tool ${toolsList[i - 1]}`, toolsList[i - 1], toolsSet);
}

const pageSizeContainer = addElement('div', 'page-sizes', 'pageSizes', toolsContainer);
const pageSize32 = addElement('div', 'page-s size32', 'size32', pageSizeContainer);
pageSize32.innerHTML = '32';
const pageSize64 = addElement('div', 'page-s size64', 'size64', pageSizeContainer);
pageSize64.innerHTML = '64';
const pageSize128 = addElement('div', 'page-s size128', 'size128', pageSizeContainer);
pageSize128.innerHTML = '128';

const defaultColor = '#ffffff';

const colorsButton = addElement('input', 'colors-button', 'colorsButton', toolsContainer);
colorsButton.setAttribute('type', 'color');
colorsButton.setAttribute('value', localStorage.getItem('color') || defaultColor);

let currentColor = colorsButton.value;

const shortcutsButton = addElement('div', 'shortcuts', 'shortcuts', toolsContainer);

const framesContainer = addElement('div', 'frames-container', 'framesContainer', main);

let frameNumber = 0;
let activeFrameNumber = 1;
let frameToAction = 1;

const addFrameButton = addElement('div', 'add-frame', 'addFrame', framesContainer);
addFrameButton.innerHTML = 'Add new frame';

function fillImage(color) {
  const currentImage = [];
  for (let i = 0; i < sizeInSquares; i += 1) {
    currentImage.push([]);
    for (let j = 0; j < sizeInSquares; j += 1) {
      currentImage[i][j] = color;
    }
  }
  return currentImage;
}

let image = fillImage(defaultColor);

function createFrame(val, elem, frame) {
  if (frame > frameNumber) {
    frameNumber = frame;
  } else {
    frameNumber += 1;
  }

  const frameToInteract = frame || frameNumber;

  add('div', 'frame', `frame${frameToInteract}`, elem, val);

  addElement('div', 'frame-pic', `framePic${frameToInteract}`, document.getElementById(`frame${frameToInteract}`));
  document.getElementById(`framePic${frameToInteract}`).setAttribute('data-frame', `${frameToInteract}`);
  document.getElementById(`framePic${frameToInteract}`).setAttribute('data-action', 'img');
  const elemFramePic = elem.querySelector('[data-action="img"]');
  const prevFrame = elemFramePic && elemFramePic.dataset.frame;

  if (val && document.getElementById(`img${prevFrame}`)) {
    const copyImg = document.getElementById(`img${prevFrame}`).cloneNode(false);
    copyImg.setAttribute('id', `img${frameToInteract}`);
    document.getElementById(`framePic${frameToInteract}`).appendChild(copyImg);
  }
  if (document.getElementById(`img${frameToInteract}`)) {
    gallery[`img${frameToInteract}`] = image.map((line) => [...line]);
  } else {
    gallery[`img${frameToInteract}`] = gallery[`img${frameToInteract}`] || fillImage(defaultColor);
  }
  addElement('div', 'frame-but-container', `frameButContainer${frameToInteract}`, document.getElementById(`frame${frameToInteract}`));
  addElement('div', 'frame-number', `frame${frameToInteract}Number`, document.getElementById(`frameButContainer${frameToInteract}`));
  document.getElementById(`frame${frameToInteract}Number`).innerHTML = `${frameToInteract}`;
  document.getElementById(`frame${frameToInteract}Number`).setAttribute('data-action', 'number');
  document.getElementById(`frame${frameToInteract}Number`).setAttribute('data-frame', `${frameToInteract}`);
  addElement('div', 'copy-frame', `copyFrame${frameToInteract}`, document.getElementById(`frameButContainer${frameToInteract}`));
  document.getElementById(`copyFrame${frameToInteract}`).setAttribute('data-action', 'copy');
  document.getElementById(`copyFrame${frameToInteract}`).setAttribute('data-frame', `${frameToInteract}`);
  addElement('div', 'delete-frame', `deleteFrame${frameToInteract}`, document.getElementById(`frameButContainer${frameToInteract}`));
  document.getElementById(`deleteFrame${frameToInteract}`).setAttribute('data-action', 'delete');
  document.getElementById(`deleteFrame${frameToInteract}`).setAttribute('data-frame', `${frameToInteract}`);
  for (let i = 0; i < document.querySelectorAll('.frame-number').length; i += 1) {
    if (document.querySelectorAll('.frame-number')[i]) {
      document.querySelectorAll('.frame-number')[i].innerHTML = `${i + 1}`;
    }
  }
}

const canvasContainer = addElement('section', 'canvas-container', 'canvasContainer', main);
const canvas = addElement('canvas', 'canvas', 'canvas', canvasContainer);
canvas.setAttribute('width', canvasSize);
canvas.setAttribute('height', canvasSize);

const previewBlock = addElement('div', 'preview-block', 'previewBlock', main);
addElement('div', 'preview-image', 'previewImage', previewBlock);
const fpsBlock = addElement('div', 'fps-block', 'fpsBlock', previewBlock);
const minusFps = addElement('div', 'fps-button minus-fps', 'minusFps', fpsBlock);
minusFps.innerHTML = '-';
const fpsValue = addElement('div', 'fps-button fps', 'fps', fpsBlock);
let fps = 0;
fpsValue.innerHTML = fps;

const plusFps = addElement('div', 'fps-button plus-fps', 'plusFps', fpsBlock);
plusFps.innerHTML = '+';

const ctx = canvas.getContext('2d');

function drawImage(img, frame) {
  const frameToInteract = frame || activeFrameNumber;
  for (let i = 0; i < sizeInSquares; i += 1) {
    for (let j = 0; j < sizeInSquares; j += 1) {
      ctx.fillStyle = img[i][j];
      ctx.fillRect(j * scale, i * scale, scale, scale);
    }
  }

  const imageMini = document.getElementById(`img${frameToInteract}`) || new Image();
  imageMini.height = '110';
  imageMini.width = '110';
  imageMini.src = canvas.toDataURL('image/png');
  if (!imageMini.hasAttribute('id')) {
    imageMini.setAttribute('id', `img${frameToInteract}`);
  }
  if (document.getElementById(`img${frameToInteract}`)) {
    document.getElementById(`img${frameToInteract}`).remove();
  }
  document.getElementById(`framePic${frameToInteract}`).appendChild(imageMini);
  imageMini.setAttribute('id', `img${frameToInteract}`);
  gallery[`img${frameToInteract}`] = img.map((line) => [...line]);
  localStorage.setItem('gallery', JSON.stringify(gallery));
}


if (galleryKeys.length) {
  galleryKeys.forEach((frameName) => {
    const currentFrame = parseInt(frameName.replace(/\D/g, ''), 10);

    activeFrameNumber = currentFrame;
    image = gallery[frameName];
    createFrame(false, addFrameButton, currentFrame);
    drawImage(gallery[frameName], currentFrame);
  });
} else {
  createFrame(false, addFrameButton);
  drawImage(image);
}

const pencill = document.getElementById('pen');
const eraser = document.getElementById('eraser');
const stroke = document.getElementById('stroke');
const fillBucket = document.getElementById('bucket');
const colorPicker = document.getElementById('picker');
const oneColor = document.getElementById('onecolor');
let currentTool = localStorage.getItem('currentTool') || 'pencill';

toolsSet.addEventListener('click', (e) => {
  if (e.target === eraser) {
    currentTool = 'eraser';
    localStorage.setItem('currentTool', 'eraser');
    currentColor = defaultColor;
  }
  if (e.target === pencill) {
    currentTool = 'pencill';
    localStorage.setItem('currentTool', 'pencill');
    currentColor = colorsButton.value;
    localStorage.setItem('color', currentColor);
  }
  if (e.target === stroke) {
    currentTool = 'stroke';
    localStorage.setItem('currentTool', 'stroke');
    currentColor = colorsButton.value;
    localStorage.setItem('color', currentColor);
  }
  if (e.target === fillBucket) {
    currentTool = 'bucket';
    localStorage.setItem('currentTool', 'bucket');
    currentColor = colorsButton.value;
    localStorage.setItem('color', currentColor);
  }
  if (e.target === colorPicker) {
    currentTool = 'picker';
    localStorage.setItem('currentTool', 'picker');
    currentColor = colorsButton.value;
    localStorage.setItem('color', currentColor);
  }
  if (e.target === oneColor) {
    currentTool = 'onecolor';
    localStorage.setItem('currentTool', 'onecolor');
    currentColor = colorsButton.value;
    localStorage.setItem('color', currentColor);
  }
});

let xPosition = 0;
let yPosition = 0;
let imageStorage = [];

function mousePosition(element) {
  xPosition = Math.floor(element.offsetX / scale);
  yPosition = Math.floor(element.offsetY / scale);
}


function mouse(x, y, color) {
  for (let i = 0; i < mouseSize; i += 1) {
    for (let j = 0; j < mouseSize; j += 1) {
      if (image[y + i] && image[y + i][x + j]) {
        image[y + i][x + j] = color;
      }
    }
  }
}

const doLine = function line(x0, y0, x1, y1, col) {
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = (x0 < x1) ? 1 : -1;
  const sy = (y0 < y1) ? 1 : -1;
  let err = dx - dy;
  let newX0 = x0;
  let newY0 = y0;
  while (!((newX0 === x1) && (newY0 === y1))) {
    mouse(newX0, newY0, col);
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      newX0 += sx;
    }
    if (e2 < dx) {
      err += dx;
      newY0 += sy;
    }
  }
};


let xx0 = 0;
let yy0 = 0;

canvas.addEventListener('mousemove', (e) => {
  if ((e.which === 1) && (currentTool === 'pencill')) {
    mousePosition(e);
    mouse(xPosition, yPosition, currentColor);
    drawImage(image);
  }
  if ((e.which === 1) && (currentTool === 'eraser')) {
    mousePosition(e);
    mouse(xPosition, yPosition, currentColor);
    drawImage(image);
  }
  if ((e.which === 1) && (currentTool === 'stroke')) {
    image = imageStorage.map((line) => [...line]);
    mousePosition(e);
    doLine(xx0, yy0, xPosition, yPosition, currentColor);
    drawImage(image);
  }
});

function fill(color, initColor, [y, x], imageFill) {
  const currentColorForFill = imageFill[y] && imageFill[y][x];
  if (currentColorForFill === undefined) {
    return;
  }
  if (color === initColor) {
    return;
  }
  if (currentColorForFill !== initColor) {
    return;
  }
  image[y][x] = color;

  fill(color, initColor, [y + 1, x], image);
  fill(color, initColor, [y, x + 1], image);
  fill(color, initColor, [y - 1, x], image);
  fill(color, initColor, [y, x - 1], image);
}

function colorDifference(mainColor, oldColor) {
  image.forEach((elem) => {
    const element = elem;
    for (let i = 0; i < sizeInSquares; i += 1) {
      if (element[i] === oldColor) {
        element[i] = mainColor;
      }
    }
  });
}

canvas.addEventListener('mousedown', (e) => {
  if ((e.which === 1) && (currentTool === 'pencill')) {
    mousePosition(e);
    mouse(xPosition, yPosition, currentColor);
    drawImage(image);
  }
  if ((e.which === 1) && (currentTool === 'eraser')) {
    mousePosition(e);
    mouse(xPosition, yPosition, currentColor);
    drawImage(image);
  }
  if ((e.which === 1) && (currentTool === 'stroke')) {
    imageStorage = image.map((line) => [...line]);
    mousePosition(e);
    xx0 = xPosition;
    yy0 = yPosition;
  }
  if ((e.which === 1) && (currentTool === 'bucket')) {
    mousePosition(e);
    const initColor = image[yPosition][xPosition];
    const initPoint = [yPosition, xPosition];
    fill(currentColor, initColor, initPoint, image);
    drawImage(image);
  }
  if ((e.which === 1) && (currentTool === 'picker')) {
    mousePosition(e);
    colorsButton.value = image[yPosition][xPosition];
  }
  if ((e.which === 1) && (currentTool === 'onecolor')) {
    mousePosition(e);
    colorDifference(currentColor, image[yPosition][xPosition]);
    drawImage(image);
  }
});

resizeSet.addEventListener('click', (e) => {
  if (e.target === document.getElementById('size1')) {
    mouseSize = 1;
    localStorage.setItem('mouseSize', 1);
  } else if (e.target === document.getElementById('size2')) {
    mouseSize = 2;
    localStorage.setItem('mouseSize', 2);
  } else if (e.target === document.getElementById('size3')) {
    mouseSize = 3;
    localStorage.setItem('mouseSize', 3);
  } else {
    mouseSize = 4;
    localStorage.setItem('mouseSize', 4);
  }
});

pageSizeContainer.addEventListener('click', (e) => {
  if (e.target === pageSize32) {
    sizeInSquares = 32;
    localStorage.setItem('squares', 32);
    scale = canvasSize / sizeInSquares;
    image = fillImage(defaultColor);
    drawImage(image);
  } else if (e.target === pageSize64) {
    sizeInSquares = 64;
    localStorage.setItem('squares', 64);
    scale = canvasSize / sizeInSquares;
    image = fillImage(defaultColor);
    drawImage(image);
  } else {
    sizeInSquares = 128;
    localStorage.setItem('squares', 128);
    scale = canvasSize / sizeInSquares;
    image = fillImage(defaultColor);
    drawImage(image);
  }
});

colorsButton.addEventListener('change', () => {
  currentColor = colorsButton.value;
  localStorage.setItem('color', currentColor);
});

addFrameButton.addEventListener('click', () => {
  createFrame(false, addFrameButton);
});

framesContainer.addEventListener('click', (e) => {
  if (e.target.dataset.action === 'img' || e.target.parentNode.dataset.action === 'img') {
    activeFrameNumber = e.target.dataset.frame || e.target.parentNode.dataset.frame;
    image = gallery[`img${activeFrameNumber}`];
    drawImage(image);
  }
  if (e.target.dataset.action === 'copy') {
    frameToAction = Number(e.target.dataset.frame);
    createFrame(true, document.getElementById(`frame${frameToAction}`));
  }
  if (e.target.dataset.action === 'delete') {
    if (document.querySelectorAll('.frame-number').length > 1) {
      const deleteFrame = Number(e.target.dataset.frame);
      if (e.target.dataset.frame === activeFrameNumber) {
        activeFrameNumber = document.querySelectorAll('.frame-number')[0].dataset.frame;
        image = gallery[`img${activeFrameNumber}`];
        drawImage(image);
      }
      document.getElementById(`frame${deleteFrame}`).remove();
      for (let i = 0; i < document.querySelectorAll('.frame-number').length; i += 1) {
        if (document.querySelectorAll('.frame-number')[i]) {
          document.querySelectorAll('.frame-number')[i].innerHTML = `${i + 1}`;
        }
      }
    }
  }
});

function SortedPreviews(containerSelector, itemSelector) {
  const containers = document.querySelectorAll(containerSelector);
  const sortable = new Sortable(containers, {
    draggable: itemSelector,
  });
  return sortable;
}

const sortable = SortedPreviews('#framesContainer', '.frame');

sortable.on('sortable:start');
sortable.on('sortable:sort');
sortable.on('sortable:sorted');
sortable.on('sortable:stop', () => {
  requestAnimationFrame(() => {
    for (let i = 0; i < document.querySelectorAll('.frame-number').length; i += 1) {
      if (document.querySelectorAll('.frame-number')[i]) {
        document.querySelectorAll('.frame-number')[i].innerHTML = `${i + 1}`;
      }
    }
  });
});

const previewImage = document.getElementById('previewImage');

let picNumber = document.querySelectorAll('.frame-pic img').length;

let interval;

fpsBlock.addEventListener('click', (e) => {
  if (e.target === minusFps) {
    if (fps > 0) {
      fps -= 1;
      fpsValue.innerHTML = fps;
    }
  }
  if (e.target === plusFps) {
    if (fps < 24) {
      fps += 1;
      fpsValue.innerHTML = fps;
    }
  }
  if (fps === 0) {
    if (interval) {
      clearInterval(interval);
    }
  }

  if (fps > 0) {
    if (previewImage.hasChildNodes()) {
      previewImage.removeChild(document.getElementById(`pic${picNumber - 1}`));
    }
    picNumber = document.querySelectorAll('.frame-pic img').length;

    const pictures = document.querySelectorAll('.frame-pic img');

    if (interval) {
      clearInterval(interval);
    }
    interval = setInterval(() => {
      if (previewImage.hasChildNodes()) {
        previewImage.removeChild(document.getElementById(`pic${picNumber - 1}`));
      }
      if (picNumber > pictures.length) {
        picNumber = 1;
      }
      const newNew = pictures[picNumber - 1].cloneNode();
      previewImage.appendChild(newNew);
      newNew.id = `pic${picNumber}`;
      picNumber += 1;
    }, 1000 / fps);
  }
});

const shortcuts = JSON.parse(localStorage.getItem('shortcuts')) || {
  pen: [68, 'P', 'Pencill'],
  bucket: [66, 'B', 'Fill Bucket'],
  onecolor: [65, 'A', 'Paint all pixels of the same color'],
  eraser: [69, 'E', 'Eraser'],
  picker: [79, 'O', 'Color Picker'],
  stroke: [76, 'L', 'Stroke'],
  frame: [78, 'N', 'Add new frame'],
  x1: [49, '1', 'Pen size 1'],
  x2: [50, '2', 'Pen size 2'],
  x3: [51, '3', 'Pen size 3'],
  x4: [52, '4', 'Pen size 4'],
  size32: [56, '8', 'Canvas size 32x32'],
  size64: [57, '9', 'Canvas size 64x64'],
  size128: [58, '0', 'Canvas size 128x128'],
  fpsPlus: [81, 'Q', 'FPS +'],
  fpsMinus: [87, 'W', 'FPS -'],
};

document.addEventListener('keydown', (event) => {
  if (event.which === shortcuts.pen[0]) {
    currentTool = 'pencill';
    currentColor = colorsButton.value;
    localStorage.setItem('currentTool', 'pencill');
    localStorage.setItem('color', currentColor);
  }
  if (event.which === shortcuts.bucket[0]) {
    currentTool = 'bucket';
    currentColor = colorsButton.value;
    localStorage.setItem('currentTool', 'bucket');
    localStorage.setItem('color', currentColor);
  }
  if (event.which === shortcuts.onecolor[0]) {
    currentTool = 'onecolor';
    currentColor = colorsButton.value;
    localStorage.setItem('currentTool', 'onecolor');
    localStorage.setItem('color', currentColor);
  }
  if (event.which === shortcuts.eraser[0]) {
    currentTool = 'eraser';
    localStorage.setItem('currentTool', 'eraser');
    currentColor = defaultColor;
  }
  if (event.which === shortcuts.picker[0]) {
    currentTool = 'picker';
    currentColor = colorsButton.value;
    localStorage.setItem('currentTool', 'picker');
    localStorage.setItem('color', currentColor);
  }
  if (event.which === shortcuts.stroke[0]) {
    currentTool = 'stroke';
    currentColor = colorsButton.value;
    localStorage.setItem('currentTool', 'stroke');
    localStorage.setItem('color', currentColor);
  }
  if (event.which === shortcuts.frame[0]) {
    createFrame(false, addFrameButton);
  }
  if (event.which === shortcuts.x1[0]) {
    mouseSize = 1;
    localStorage.setItem('mouseSize', 1);
  }
  if (event.which === shortcuts.x2[0]) {
    mouseSize = 2;
    localStorage.setItem('mouseSize', 2);
  }
  if (event.which === shortcuts.x3[0]) {
    mouseSize = 3;
    localStorage.setItem('mouseSize', 3);
  }
  if (event.which === shortcuts.x4[0]) {
    mouseSize = 4;
    localStorage.setItem('mouseSize', 4);
  }
  if (event.which === shortcuts.size32[0]) {
    sizeInSquares = 32;
    localStorage.setItem('squares', 32);
    scale = canvasSize / sizeInSquares;
    image = fillImage(defaultColor);
    drawImage(image);
  }
  if (event.which === shortcuts.size64[0]) {
    sizeInSquares = 64;
    localStorage.setItem('squares', 64);
    scale = canvasSize / sizeInSquares;
    image = fillImage(defaultColor);
    drawImage(image);
  }
  if (event.which === shortcuts.size128[0]) {
    sizeInSquares = 128;
    localStorage.setItem('squares', 128);
    scale = canvasSize / sizeInSquares;
    image = fillImage(defaultColor);
    drawImage(image);
  }
  if (event.which === shortcuts.fpsPlus[0]) {
    if (fps < 24) {
      fps += 1;
      fpsValue.innerHTML = fps;
    }
  }
  if (event.which === shortcuts.fpsMinus[0]) {
    if (fps > 0) {
      fps -= 1;
      fpsValue.innerHTML = fps;
    }
  }
});

const shortcutArr = ['pen', 'bucket', 'onecolor', 'eraser', 'picker', 'stroke', 'frame', 'x1', 'x2', 'x3', 'x4', 'size32', 'size64', 'size128', 'fpsPlus', 'fpsMinus'];

const keysInstructions = addElement('section', 'keys-instructions', 'keysInstructions', document.body);
const keysBox = addElement('div', 'keys-box', 'keysBox', keysInstructions);

for (let i = 0; i < shortcutArr.length; i += 1) {
  addElement('div', 'shortcut-line', `shortCutLine${i}`, document.getElementById('keysBox'));
  addElement('div', 'shortcut-button', `shortcutButton${i}`, document.getElementById(`shortCutLine${i}`));
  addElement('div', 'shortcut-description', `shortcutDescription${i}`, document.getElementById(`shortCutLine${i}`));
  [,
    document.getElementById(`shortcutButton${i}`).innerHTML,
    document.getElementById(`shortcutDescription${i}`).innerHTML,
  ] = shortcuts[shortcutArr[i]];
}

shortcutsButton.addEventListener('click', () => {
  keysInstructions.style.visibility = 'visible';
});

keysInstructions.addEventListener('click', (e) => {
  if (e.target === keysInstructions) {
    keysInstructions.style.visibility = 'hidden';
  }
});

const changeKeyInfo = [false, '', ''];

keysBox.addEventListener('click', (e) => {
  for (let i = 0; i < shortcutArr.length; i += 1) {
    if (e.target.innerHTML === shortcuts[shortcutArr[i]][1]) {
      changeKeyInfo[1] = shortcutArr[i];
      changeKeyInfo[0] = true;
      changeKeyInfo[2] = i;
    }
  }
});

document.addEventListener('keydown', (e) => {
  if (changeKeyInfo[1] && changeKeyInfo[0]) {
    for (let i = 0; i < shortcutArr.length; i += 1) {
      if (shortcuts[shortcutArr[i]][1] === e.code.slice(-1)) {
        shortcuts[shortcutArr[i]][0] = ' ';
        shortcuts[shortcutArr[i]][1] = '???';
        document.getElementById(`shortcutButton${i}`).innerHTML = '???';
      }
    }
    shortcuts[changeKeyInfo[1]][0] = e.which;
    shortcuts[changeKeyInfo[1]][1] = e.code.slice(-1);
    [, e.target.htmlInner] = changeKeyInfo;

    [, document.getElementById(`shortcutButton${changeKeyInfo[2]}`).innerHTML] = shortcuts[changeKeyInfo[1]];
    changeKeyInfo[0] = false;
    localStorage.setItem('shortcuts', JSON.stringify(shortcuts));
  }
});

const btt = addElement('div', 'btt', 'btt', previewBlock);
btt.innerHTML = 'Full screen';
btt.addEventListener('click', () => {
  if (previewImage.requestFullScreen) {
    previewImage.requestFullScreen();
  } else if (previewImage.mozRequestFullScreen) {
    previewImage.mozRequestFullScreen();
  } else if (previewImage.webkitRequestFullScreen) {
    previewImage.webkitRequestFullScreen();
  }
});

const gifButton = addElement('div', 'gif-button', 'gifButton', previewBlock);
gifButton.innerHTML = 'GIF. export';

gifButton.addEventListener('click', () => {
  const frameImgs = document.querySelectorAll('.frame-pic img');
  const frames = Array.prototype.map.call(frameImgs, ({ src }) => src);
  makeGifExportLink(frames, fps, (link) => {
    const linkA = document.createElement('a');
    linkA.setAttribute('href', link);
    linkA.setAttribute('download', link);
    linkA.click();
  });
});

const apngButton = addElement('div', 'apng-button', 'apngButton', previewBlock);
apngButton.innerHTML = 'APNG. export';

apngButton.addEventListener('click', () => {
  const frameImgs = document.querySelectorAll('.frame-pic img');
  const frames = Array.prototype.map.call(frameImgs, ({ src }) => src);

  makeApngExportLink(frames, fps, canvasSize, (bin) => {
    const link = `data:image/png;base64,${bin}`;

    const linkA = document.createElement('a');
    linkA.setAttribute('href', link);
    linkA.setAttribute('download', link);
    linkA.click();
  });
});
