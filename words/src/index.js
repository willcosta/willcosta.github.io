import { getLetters, wordExists } from './game.js';

const CELL_SIZE = 30;
const CELL_BORDER_SIZE = 2;
const CELL_SIZE_TOTAL = CELL_SIZE + CELL_BORDER_SIZE;

const GRID_WIDTH = 15;
const GRID_HEIGHT = 30;
const NUM_LETTERS = 15;

let draggedLetter;
let mousePos = { x: 0, y: 0 };
let grid = {};

function setGrid(x, y, element) {
  if (!element) {
    grid[`${x}_${y}`] = null;
    return;
  }
  const letter = element.dataset.letter;
  grid[`${x}_${y}`] = {
    el: element,
    x,
    y,
    letter,
    v: false,
    h: false,

    getCellsH() {
      const cells = [this];
      let r = this.right;
      while (r) {
        cells.push(r);
        r = r.right;
      }
      return cells;
    },

    getCellsV() {
      const cells = [this];
      let b = this.bottom;
      while (b) {
        cells.push(b);
        b = b.bottom;
      }
      return cells;
    },

    getWordH() {
      let word = this.letter;
      let r = this.right;
      while (r) {
        word += r.letter;
        r = r.right;
      }
      return word;
    },

    getWordV() {
      let word = this.letter;
      let b = this.bottom;
      while (b) {
        word += b.letter;
        b = b.bottom;
      }
      return word;
    },

    get left() {
      return getGrid(x - 1, y);
    },
    get right() {
      return getGrid(x + 1, y);
    },
    get top() {
      return getGrid(x, y - 1);
    },
    get bottom() {
      return getGrid(x, y + 1);
    },
    get isFirstLetterH() {
      return !this.left && this.right;
    },
    get isFirstLetterV() {
      return !this.top && this.bottom;
    },
    get isValid() {
      if (this.h) {
        return this.v || (!this.top && !this.bottom);
      }

      if (this.v) {
        return this.h || (!this.left && !this.right);
      }
      return false;
    },

    get isPartial() {
      return this.v || this.h;
    },
  };
}

function getGrid(x, y) {
  return grid[`${x}_${y}`];
}

function getCells() {
  return Object.values(grid).filter(Boolean);
}

function getFirstLetterTopLeft() {
  for (let y = 0; y < GRID_HEIGHT; y++) {
    for (let x = 0; x < GRID_WIDTH; x++) {
      if (getGrid(x, y)) {
        return [x, y];
      }
    }
  }
  return [-1, -1];
}

function traverse(x, y, visisted, count) {
  visisted[`${x}_${y}`] = true;
  count++;

  const left = x > 0 ? getGrid(x - 1, y) : null;
  const right = x < GRID_WIDTH - 1 ? getGrid(x + 1, y) : null;
  const top = y > 0 ? getGrid(x, y - 1) : null;
  const bottom = y < GRID_HEIGHT - 1 ? getGrid(x, y + 1) : null;

  if (left && !visisted[`${x - 1}_${y}`]) {
    count = traverse(x - 1, y, visisted, count);
  }

  if (right && !visisted[`${x + 1}_${y}`]) {
    count = traverse(x + 1, y, visisted, count);
  }

  if (top && !visisted[`${x}_${y - 1}`]) {
    count = traverse(x, y - 1, visisted, count);
  }

  if (bottom && !visisted[`${x}_${y + 1}`]) {
    count = traverse(x, y + 1, visisted, count);
  }
  return count;
}

function areAllLettersConnected() {
  const [x, y] = getFirstLetterTopLeft();
  let count = 0;
  let visisted = {};
  const connected = traverse(x, y, visisted, count);
  console.log('connected', connected);

  return connected === NUM_LETTERS;
}

function onMouseDown(event) {
  console.log(event);
  event.preventDefault();

  const { x, y } = event;
  mousePos.x = x;
  mousePos.y = y;

  draggedLetter = event.currentTarget;
  draggedLetter.classList.add('letter--drag');

  const ix = Math.floor(draggedLetter.offsetLeft / CELL_SIZE_TOTAL);
  const iy = Math.floor(draggedLetter.offsetTop / CELL_SIZE_TOTAL);
  if (getGrid(ix, iy) && draggedLetter.dataset.cell === `${ix}_${iy}`) {
    setGrid(ix, iy, null);
    console.log('empty', ix, iy);
  }

  document.addEventListener('mouseup', onMouseUp);
  document.addEventListener('mousemove', onMouseMove);
}

function onMouseMove(event) {
  const { x, y } = event;
  const dx = x - mousePos.x;
  const dy = y - mousePos.y;

  mousePos.x = x;
  mousePos.y = y;

  draggedLetter.style.left = draggedLetter.offsetLeft + dx;
  draggedLetter.style.top = draggedLetter.offsetTop + dy;
}

function onMouseUp(event) {
  draggedLetter.classList.remove('letter--drag');

  const ix = Math.floor((draggedLetter.offsetLeft + CELL_SIZE_TOTAL / 2) / CELL_SIZE_TOTAL);
  const iy = Math.floor((draggedLetter.offsetTop + CELL_SIZE_TOTAL / 2) / CELL_SIZE_TOTAL);

  if (!getGrid(ix, iy)) {
    const finalX = Math.max(0, ix * CELL_SIZE_TOTAL) + CELL_BORDER_SIZE;
    const finalY = Math.max(0, iy * CELL_SIZE_TOTAL) + CELL_BORDER_SIZE;

    draggedLetter.style.left = finalX;
    draggedLetter.style.top = finalY;
    draggedLetter.dataset.cell = `${ix}_${iy}`;
    setGrid(ix, iy, draggedLetter);
  }

  draggedLetter = null;

  checkWords();

  document.removeEventListener('mouseup', onMouseUp);
  document.removeEventListener('mousemove', onMouseMove);
}

function resetLetters() {
  getCells().forEach((cell) => {
    cell.h = false;
    cell.v = false;
    cell.el.classList.remove('letter--valid');
    cell.el.classList.remove('letter--partial');
  });

  //   document.querySelectorAll('#main .letter').forEach((el) => {
  //     el.classList.remove('letter--highlight-v');
  //     el.classList.remove('letter--highlight-h');
  //   });
}

function checkWords() {
  resetLetters();
  const cells = getCells();
  const horizontalWords = cells.filter((c) => c.isFirstLetterH);
  const verticalWords = cells.filter((c) => c.isFirstLetterV);

  horizontalWords.forEach((edge) => {
    const wordH = edge.getWordH();

    edge.getCellsH().forEach((c) => {
      c.h = wordExists(wordH);
    });
  });

  verticalWords.forEach((edge) => {
    const wordV = edge.getWordV();

    edge.getCellsV().forEach((c) => {
      c.v = wordExists(wordV);
    });
  });

  highlightWords();
}

function highlightWords() {
  const cells = getCells();
  for (const cell of cells) {
    if (cell.isValid) {
      cell.el.classList.add('letter--valid');
    } else if (cell.isPartial) {
      cell.el.classList.add('letter--partial');
    } else {
      cell.el.classList.remove('letter--valid');
      cell.el.classList.remove('letter--partial');
    }
  }
}

function checkWords2() {
  resetLetters();
  for (let key in grid) {
    const [xs, ys] = key.split('_');
    const x = Number(xs);
    const y = Number(ys);

    if (getGrid(x, y)) {
      iterateH(x, y);
      iterateV(x, y);
    }
  }
  highlightWords();

  areAllLettersConnected();
}

function highlightHWord(x, y, word) {
  console.log('highlightHWord', word, x, y);
  for (let i = x; i < x + word.length; i++) {
    let el = getGrid(i, y).el;
    el.classList.add('letter--highlight-h');
  }
}

function highlightVWord(x, y, word) {
  console.log('highlightVWord', word, x, y);
  for (let i = y; i < y + word.length; i++) {
    let el = getGrid(x, i).el;
    el.classList.add('letter--highlight-v');
  }
}

function iterateH(x, y) {
  if (x === 0 || !getGrid(x - 1, y)) {
    const firstCell = getGrid(x, y);
    let word = firstCell.letter;
    const cells = [firstCell];
    let i;

    for (i = x + 1; i < GRID_WIDTH; i++) {
      const cell = getGrid(i, y);
      if (cell) {
        cells.push(cell);
        word += cell.letter;
      } else {
        break;
      }
    }

    if (wordExists(word)) {
      cells.forEach((cell) => (cell.h = true));
      //   console.log('word exists:', word, x, i);
      //   highlightHWord(x, y, word);
    } else {
      cells.forEach((cell) => (cell.h = false));
    }

    // console.log('word', word, wordExists(word));
  }
}

function iterateV(x, y) {
  if (y === 0 || !getGrid(x, y - 1)) {
    const firstCell = getGrid(x, y);
    let word = firstCell.letter;
    const cells = [firstCell];
    let i;
    for (i = y + 1; i < GRID_HEIGHT; i++) {
      const cell = getGrid(x, i);
      if (cell) {
        cells.push(cell);
        word += getGrid(x, i).letter;
      } else {
        break;
      }
    }

    if (wordExists(word)) {
      cells.forEach((cell) => (cell.v = true));
      console.log('word exists:', word, x, i);
      //   highlightVWord(x, y, word);
    } else {
      cells.forEach((cell) => (cell.v = false));
    }

    // console.log('word', word, wordExists(word));
  }
}

function init() {
  const letters = getLetters();
  const main = document.querySelector('#main');
  letters.forEach((letter, index) => {
    const el = document.createElement('div');
    el.innerText = letter;
    el.classList.add('letter');
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('touchstart', onMouseDown);
    el.style.left = index * CELL_SIZE_TOTAL;
    el.style.top = CELL_SIZE_TOTAL * 20;
    el.dataset.letter = letter;
    el.id = `${letter}_${index}`;
    main.appendChild(el);
  });
}

/**
 *          e
 *         ere
 *        erure
 *         ere
 *          e
 *
 */

init();
