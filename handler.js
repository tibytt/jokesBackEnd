const jokes = require('./jokes/index.json');

//lastJokeId  based on the existing jokes
let lastJokeId = jokes.length > 0
  ? Math.max(...jokes.map(jk => Number(jk.id) || 0))
  : 0;

jokes.forEach(jk => jk.id = ++lastJokeId);

const types = Array.from(new Set(jokes.map(joke => joke.type)));

const randomJoke = () => {
  return jokes[Math.floor(Math.random() * jokes.length)];
}

/**
 * Get N random jokes from a jokeArray
 */
const randomN = (jokeArray, n) => {
  const limit = jokeArray.length < n ? jokeArray.length : n;
  const randomIndicesSet = new Set();

  while (randomIndicesSet.size < limit) {
    const randomIndex = Math.floor(Math.random() * jokeArray.length);
    if (!randomIndicesSet.has(randomIndex)) {
      randomIndicesSet.add(randomIndex);
    }
  }

  return Array.from(randomIndicesSet).map(randomIndex => {
    return jokeArray[randomIndex];
  });
};

const randomTen = () => randomN(jokes, 10);

const randomSelect = (number) => randomN(jokes, number);

//modification to allow array of types
const jokeByType = (types, n) => {
  const filteredJokes = jokes.filter(joke => types.includes(joke.type));
  return randomN(filteredJokes, n);
};
const count = jokes.length; // Count the total jokes in the array

/** 
 * Get the next available joke ID
 */
const getNextJokeId = () => {
  lastJokeId += 1;
  return lastJokeId;
};

/** 
 * @param {Number} id - joke id
 * @returns a single joke object or undefined
 */
const jokeById = (id) => (jokes.filter(jk => jk.id === id)[0]);

module.exports = { jokes, types, randomJoke, randomN, randomTen, randomSelect, jokeById, jokeByType, count, getNextJokeId};
