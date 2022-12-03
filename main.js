const WIDTH  = 600;
const HEIGHT = 600;
const CELL_SIZE = 10;
const ROWS = HEIGHT / CELL_SIZE;
const COLS = WIDTH / CELL_SIZE;
const BLACK = '#000000';
const RED = '#FF0000';

let ctx = null;
let grid = [];
let lastFrameTs;
let delay = 500;
let delaySoFar = 0;
let running = false;

const createBlankGrid = () => {
  let newGrid = [];

  for (let y = 0; y < ROWS; y++) {
    newGrid.push(new Array(COLS).fill(0));
  }

  return newGrid;
};

const drawLine = (x1, y1, x2, y2) => {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
};

const drawGridLines = () => {
  ctx.fillStyle = BLACK;

  for (let x = CELL_SIZE; x < WIDTH; x += CELL_SIZE) {
    drawLine(x, 0, x, HEIGHT);
  }

  for (let y = CELL_SIZE; y < HEIGHT ; y += CELL_SIZE) {
    drawLine(0, y, WIDTH, y);
  }
};

const drawCell = (x, y) => {
  ctx.fillStyle = RED;
  x = x * CELL_SIZE;
  y = y * CELL_SIZE;
  ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE);
};

const drawGrid = () => {
  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      if (grid[y][x]) {
        drawCell(x, y);
      }
    }
  }
};

const countNeighbors = (x, y) => {
  let neighbors = 0;

  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx != 0 || dy != 0) {
        let nx = x + dx;
        let ny = y + dy;
        if ((nx >= 0 && nx < COLS) &&
            (ny >= 0 && ny < ROWS)) 
          neighbors += grid[ny][nx];
      }
    }
  }

  return neighbors;
};

const gameOfLife = () => {
/*
  These simple rules are as follows: 
  1. If the cell is alive, then it stays alive if:
   it has either 2 or 3 live neighbors; 
  2. If the cell is dead, then it springs to life only:
   it has 3 live neighbors.
*/
  let newGrid = createBlankGrid();

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      let neighbors = countNeighbors(x, y);
      if (grid[y][x] === 1) { // if the cell is live => rule #1
        if (neighbors === 2 || neighbors === 3) {
          newGrid[y][x] = 1;
        } else {
          newGrid[y][x] = 0;
        }
      } else { // if the cell is dead => rule #2
        if (neighbors === 3) {
          newGrid[y][x] = 1;
        }
      }
    }
  }

  grid = newGrid;
};

const draw = () => {
  let now = Date.now();
  let deltaT = now - lastFrameTs;
  lastFrameTs = now;

  delaySoFar += deltaT;

  document.getElementById('delay_label').textContent = '' + delay;
  
  if (delaySoFar >= delay) {
    delaySoFar = 0;
    if (running) {
      gameOfLife();
    }
  }

  ctx.globalCompositeOperation = 'destination-over';
  ctx.clearRect(0, 0, WIDTH, HEIGHT); // clear canvas

  drawGridLines();
  drawGrid();

  window.requestAnimationFrame(draw);
};

const onMouseMove = (event) => {
  if (event.buttons === 1) {
    let x = parseInt(event.clientX / CELL_SIZE) - 1;
    let y = parseInt(event.clientY / CELL_SIZE) - 1;
    grid[y][x] = !event.shiftKey;
  } 
};

const toggleSimulation = () => {
  running = !running;
  
  let button = document.getElementById('simulation_button');

  button.textContent = running ? 'Stop Simulation' : 'Start Simulation';
};

const changeDelay = () => {
  let slider = document.getElementById('delay_range');
  delay = parseInt(slider.value);
};

const main = () => {
  const canvas = document.getElementById('game_of_life');
  canvas.onmousemove = onMouseMove;
  ctx = canvas.getContext('2d');

  ctx.canvas.width  = WIDTH;
  ctx.canvas.height = HEIGHT;

  grid = createBlankGrid();
  lastFrameTs = Date.now();

  window.requestAnimationFrame(draw);
}
