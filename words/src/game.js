import words from './words.js';

const NUM_LETTERS = 15;

function randomInt(max) {
  return Math.floor(Math.random() * max);
}

function getMainWord() {
  const MAIN_WORD_MIN_LENGTH = 4;
  const MAIN_WORD_MAX_LENGTH = 8;
  const wordsThatMatch = words.filter((word) => word.length >= MAIN_WORD_MIN_LENGTH && word.length <= MAIN_WORD_MAX_LENGTH);
  const i = randomInt(wordsThatMatch.length - 1);
  return wordsThatMatch[i];
}

function getRandomWordWith(letter, length) {
  const wordsThatMatch = words.filter((word) => word.includes(letter) && word.length === length);
  const i = randomInt(wordsThatMatch.length - 1);
  const word = wordsThatMatch[i];
  console.log('#getRandomWordWith', letter, length, wordsThatMatch.length, word);
  return word;
}

function getTwoRandomLettersFromWord(word = '') {
  const l = word.length;
  const a = randomInt(l - 1);
  let b = null;
  let safetyCount = 0;
  while ((b === null || b === a || b === a - 1 || b === a + 1) && safetyCount < 1000) {
    b = randomInt(l - 1);
    safetyCount++;
  }

  console.log('getTwoRandomLettersFromWord', a, b);

  if (safetyCount === 1000) {
    console.log('something went wrong');
  }

  return [word.charAt(a), word.charAt(b)];
}

function removeAccents(word) {
  return word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function wordExists(word) {
  return (
    word.length > 2 &&
    (words.includes(word) ||
      words.some((wordFromList) => {
        if (removeAccents(wordFromList) === word) {
          console.log(word, 'matches word with accent', wordFromList);
          return true;
        }
        return false;
      }))
  );
}

export function getLetters() {
  //   const word = getMainWord();
  const word = 'zurrá';
  const lettersFromMainWord = getTwoRandomLettersFromWord(word);

  const MAX_LETTERS = 15;

  const left = MAX_LETTERS - word.length;

  //console.log("left", left);

  let word2Length;
  let word3Length;

  if (left % 2 === 0) {
    console.log('isEven');
    word2Length = word3Length = left / 2 + 1;
  } else {
    console.log('isOdd');
    word2Length = Math.floor(left / 2) + 1;
    word3Length = Math.ceil(left / 2) + 1;
  }

  console.log('init', word, word.length);
  console.log('letters', lettersFromMainWord);
  console.log('word2Length', word2Length);
  console.log('word3Length', word3Length);

  const word2 = getRandomWordWith(lettersFromMainWord[0], word2Length);
  const word3 = getRandomWordWith(lettersFromMainWord[1], word3Length);

  let allLetters = [...word, ...word2, ...word3].join('');
  allLetters = allLetters.replace(lettersFromMainWord[0], '');
  allLetters = allLetters.replace(lettersFromMainWord[1], '');

  console.log('allLetters', allLetters, allLetters.length);
  // remove accents
  return removeAccents(allLetters).split('').sort();
}
