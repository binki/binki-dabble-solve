#!/usr/bin/env ts-node

import * as readline from 'readline';
import {
  createReadStream,
} from 'fs';
//import * as through2 from 'through2';

const wordsFile = process.argv[2];
const letters:Array<string> = [].slice.call(process.argv[3]);
const lettersMap = letters.reduce((acc, value) => {
  const originalValue = acc.get(value);
  acc.set(value, (originalValue === undefined ? 0 : originalValue) + 1);
  return acc;
}, new Map<string, number>());

// Unkown score: 'v'
const letterScores = new Map<string, number>('a3 b9 c9 d6 e3 f12 g6 h12 i3 j24 k15 l3 m9 n3 o3 p3 q30 r3 s3 t3 u3 w12 x24 y12 z30'.split(' ').map(entry => [entry[0], parseInt(entry.substring(1), 10)]));

(async () => {
  console.log(`wordsFile: ${wordsFile}, letters=${Array.from(lettersMap)}, letterScores=${Array.from(letterScores)}`);

  const wordsSet = await new Promise<Set<string>>((resolve, reject) => {
    const wordsSet = new Set<string>();
    readline.createInterface({
      input: createReadStream(wordsFile),
      //  output: process.stdout,
    }).on('line', line => {
      // Only accept words which could be valid.
      if (line.length < 7) {
        let lineI = -1;
        const backout = function () {
          for (lineI--; lineI >= 0; lineI--) {
            const c = line[lineI];
            lettersMap.set(c, (lettersMap.get(c) || 0) + 1);
          }
        };
        for (lineI = 0; lineI < line.length; lineI++) {
          const c = line[lineI];
          const currentValue = lettersMap.get(c);
          if (currentValue === undefined || currentValue === 0) {
            // The word is not usable with the input. Skip.
            backout();
            return;
          }
          lettersMap.set(c, currentValue - 1);
        }
        backout();
        wordsSet.add(line);
      }
    }).on('close', () => {
      resolve(wordsSet);
    }).on('error', ex => {
      reject(ex);
    });
  });

  // Remove junk words
  for (const junkWord of 'qs ls rsqat te et pe lm ts ns cs er re ps se es de ds un ut en xu xs ur rs ne lx zs ks ln gs js ws'.split(' ')) {
    wordsSet.delete(junkWord);
  }

  function search(remainingLetterCounts:Map<string, number>, unusedLetterCount:number, currentWord:string, foundWords:Array<string>, soughtLength:number, cb:(words:Array<string>)=>void) {
    //console.log(`search(${[Array.from(remainingLetterCounts.entries()), unusedLetterCount, currentWord, foundWords, soughtLength, 'cb()'].join(', ')})`);
    if (unusedLetterCount === 0) {
      if (currentWord.length === 0) {
        cb(foundWords);
      }
      return;
    }

    for (const remainingLetterCount of remainingLetterCounts.entries()) {
      if (remainingLetterCount[1] < 0) {
        throw new Error(`found negative count for “${remainingLetterCount[0]}”, ${Array.from(remainingLetterCount.entries())}`);
      }
      if (remainingLetterCount[1] === 0) {
        continue;
      }
      remainingLetterCounts.set(remainingLetterCount[0], remainingLetterCount[1] - 1);

      const nextWord = currentWord + remainingLetterCount[0];
      if (nextWord.length === soughtLength) {
        if (wordsSet.has(nextWord)) {
          foundWords.push(nextWord);
          search(remainingLetterCounts, unusedLetterCount - 1, '', foundWords, soughtLength - 1, cb);
          foundWords.pop();
        }
      } else {
        search(remainingLetterCounts, unusedLetterCount - 1, nextWord, foundWords, soughtLength, cb);
      }

      remainingLetterCounts.set(remainingLetterCount[0], remainingLetterCount[1]);
    }
  }

  search(lettersMap, letters.length, '', [], 6, words => {
    console.log(words.join(' '));
  });

  // for (const word of wordsSet) {
  //   console.log(word);
  // }

  // function probe(usedLetters:Array<boolean>, foundWords:Array<string>, soughtLength:number) {
  //   for (let 
  // }


  // const matchedLettersIndices:Array<boolean> = [];
  // for (let lineI = 0; lineI < line.length; lineI++) {
  //   let matched = false;
  //   for (let lettersI = 0; lettersI < letters.length; lettersI++) {
  //     if (line[lineI] === letters[lettersI] && matchedLettersIndices[lettersI] === undefined) {
  //       matchedLettersIndices[lettersI] = true;
  //       matched = true;
  //       break;
  //     }
  //   }
  //   if (!matched) {
  //     return;
  //   }
  // }
  // if (matchedLettersIndices.length < line.length || matchedLettersIndices.filter(c => c !== true).length > 0) {
  //   return;
  // }
})();
