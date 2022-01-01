let _aryInitRot = [];
let _myObject;

function setup() {
  let canvasSize;
  if (windowWidth <= windowHeight) {
    canvasSize = windowWidth;
  } else {
    canvasSize = windowHeight;
  }
  createCanvas(500, 500, WEBGL);
  document.getElementsByTagName('main')[0].style.margin = 0;
  setAttributes('premultipliedAlpha', true);
  frameRate(30);
  noStroke();
  for (let i = 0; i < 3; i++) {
    _aryInitRot[i] = [random(2*PI), random([-1, 1])];
  }

  _myObject = new Parts(350);
}

function draw() {
  ortho(-width/2, width/2, -width/2, width/2, 0, width*2);
  background(200);
  ambientLight(60);
  let ang = _aryInitRot[1][0] + frameCount/100;
  directionalLight(255, 255, 255, -sin(ang), 1, -cos(ang));
  let c = (height/2) / tan(PI/6);
  camera(c*sin(ang), 0, c*cos(ang), 0, 0, 0, 0, 1, 0);
  rotateZ(PI/4);

  _myObject.update();
}

function drawPart(startX, startY, startZ, endX, endY, endZ, w, col) {
  let angAxisZ = atan2(endY - startY, endX - startX);
  let distXY = dist(startX, startY, endX, endY);
  let angAxisY = -atan2(endZ - startZ, distXY);
  let distXYZ = dist(0, startZ, distXY, endZ);
  push();
  translate(startX, startY, startZ);
  rotateZ(angAxisZ);
  rotateY(angAxisY);
  translate(distXYZ/2, 0, 0);
  ambientMaterial(col);
  box(distXYZ + w, w, w); //length + w
  pop();
}

class Part {
  constructor(startX, startY, startZ, endX, endY, endZ, w, totalTime, partCount, maxW) {
    this.startX = startX;
    this.startY = startY;
    this.startZ = startZ;
    this.endX = endX;
    this.endY = endY;
    this.endZ = endZ;
    this.w = w;
    this.totalTime = totalTime;
    this.currentTime = 0;
    this.direction = true; //true -> extend, false -> shrink
    this.erase = false;
    this.col = color(255 * w / maxW);
  }
  update() {
    let currentX;
    let currentY;
    let currentZ;
    if (this.direction == true) { //extend
      let ratio = (this.currentTime / this.totalTime)**0.5;
      currentX = this.startX + (this.endX - this.startX) * ratio;
      currentY = this.startY + (this.endY - this.startY) * ratio;
      currentZ = this.startZ + (this.endZ - this.startZ) * ratio;
      if (this.currentTime < this.totalTime) { this.currentTime ++; }
      drawPart(this.startX, this.startY, this.startZ, currentX, currentY, currentZ, this.w, this.col);
    } else { //shrink
      let ratio = (1 - (this.currentTime - this.totalTime) / this.totalTime)**0.5;
      currentX = this.endX + (this.startX - this.endX) * ratio;
      currentY = this.endY + (this.startY - this.endY) * ratio;
      currentZ = this.endZ + (this.startZ - this.endZ) * ratio;
      this.currentTime ++;
      if (this.currentTime > this.totalTime * 2) { this.erase = true; }
      drawPart(this.endX, this.endY, this.endZ, currentX, currentY, currentZ, this.w, this.col);
    }
  }
}

class Parts {
  constructor(numPart) {
    this.maxArea = width/3.4;
    this.maxW = width/10;
    this.t = 3;
    this.maxL = this.maxArea;
    this.parts = [];
    let w = max(width/300, this.maxW * random() **12);
    let startX = -this.maxArea/2;
    let startY = -this.maxArea/2;
    let startZ = -this.maxArea/2;
    let aryEndXYZ = this.randomDirection(startX, startY, startZ);
    while (abs(aryEndXYZ[0]) > this.maxArea || abs(aryEndXYZ[1]) > this.maxArea || abs(aryEndXYZ[2]) > this.maxArea) {
      aryEndXYZ = this.randomDirection(startX, startY, startZ);
    }
    let endX = aryEndXYZ[0];
    let endY = aryEndXYZ[1];
    let endZ = aryEndXYZ[2];
    this.partCount = int(random(1000));
    this.parts.push(new Part(startX, startY, startZ, endX, endY, endZ, w, this.t, this.partCount, this.maxW));
    this.numPart = numPart;
    this.isGenerate = false;
  }
  update() {
    for (let i = 0; i < this.parts.length; i++) {
      this.parts[i].update();
    }
    if (this.parts[this.parts.length-1].currentTime >= this.parts[this.parts.length-1].totalTime) {
      this.isGenerate = true;
    }

    if (this.isGenerate == true && this.parts.length < this.numPart) {
      let w = max(width/300, this.maxW * random() **12);
      let startX = this.parts[this.parts.length-1].endX;
      let startY = this.parts[this.parts.length-1].endY;
      let startZ = this.parts[this.parts.length-1].endZ;
      let aryEndXYZ = this.randomDirection(startX, startY, startZ);
      while (abs(aryEndXYZ[0]) > this.maxArea || abs(aryEndXYZ[1]) > this.maxArea || abs(aryEndXYZ[2]) > this.maxArea) {
        aryEndXYZ = this.randomDirection(startX, startY, startZ);
      }
      let endX = aryEndXYZ[0];
      let endY = aryEndXYZ[1];
      let endZ = aryEndXYZ[2];
      this.partCount ++;
      this.parts.push(new Part(startX, startY, startZ, endX, endY, endZ, w, this.t, this.partCount, this.maxW));
      this.isGenerate = false;
    }

    if (this.parts.length >= this.numPart) {
      this.parts[0].direction = false;
    }

    if (this.parts[0].erase == true) { this.parts.shift(); }
  }
  randomDirection(startX, startY, startZ) {
    let endX = startX;
    let endY = startY;
    let endZ = startZ;
    let direction = random(["-x", "x", "-y", "y", "-z", "z"]);
    switch(direction) {
      case "-x":
        endX = startX + this.maxL * random(-1, 0);
        break;
      case "x":
        endX = startX + this.maxL * random(0, 1);
        break;
      case "-y":
        endY = startY + this.maxL * random(-1, 0);
        break;
      case "y":
        endY = startY + this.maxL * random(0, 1);
        break;
      case "-z":
        endZ = startZ + this.maxL * random(-1, 0);
        break;
      case "z":
        endZ = startZ + this.maxL * random(0, 1);
        break;
    }
    return [endX, endY, endZ];
  }
}

function mouseReleased() {
  screenReset();
}

function screenReset() {
  for (let i = 0; i < 3; i++) {
    _aryInitRot[i] = [random(2*PI), random([-1, 1])];
  }
  _myObject = new Parts(350);
}