const express = require('express');
const LimitingMiddleware = require('limiting-middleware');
const bodyParser = require('body-parser');
const { types, randomJoke, randomTen, randomSelect, jokeByType, jokeById, count, getNextJokeId, jokes} = require('./handler');

const app = express();

app.use(bodyParser.json());
//cors was preventing to create post request
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

app.use(new LimitingMiddleware().limitByIp());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

app.get('/', (req, res) => {
  res.send('Try /random_joke, /random_ten, /jokes/random, or /jokes/ten , /jokes/random/<any-number>');
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.get('/random_joke', (req, res) => {
  res.json(randomJoke());
});

app.get('/random_ten', (req, res) => {
  res.json(randomTen());
});

app.get('/jokes/random', (req, res) => {
  res.json(randomJoke());
});

app.get(" ", (req, res) => {
  let num;
  try {
    num = parseInt(req.params.num);
    if (!num) {
      res.send("The passed path is not a number.");
    } else {
      if (num > count) {
        res.send(`The passed path exceeds the number of jokes (${count}).`);
      } else {
        res.json(randomSelect(num));
      }
    }
  } catch (e) {
    return next(e);
  } 
});

app.get('/jokes/ten', (req, res) => {
  res.json(randomTen());
});

app.get('/jokes/:type/random', (req, res) => {
  res.json(jokeByType(req.params.type, 1));
});
//modification to allow more than ten jokes
app.get('/jokes/:type/:num', (req, res, next) => {
  let num;
  try {
    num = parseInt(req.params.num);
    if (isNaN(num)) {
      return res.send("The passed path is not a valid number.");
    }
    const types = req.params.type.split(',');
    const jokesOfType = jokeByType(types, num); 
    if (!jokesOfType || jokesOfType.length === 0) {
      return res.send(`No jokes found for types: ${req.params.type}`);
    } else {
      return res.json(jokesOfType);
    }
  } catch (e) {
    return next(e);
  }
});
app.get('/jokes/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const joke = jokeById(+id);
    if (!joke) return next({ statusCode: 404, message: 'joke not found' });
    return res.json(joke);
  } catch (e) {
    return next(e);
  }
});
//adding a new joke
app.post('/jokes/add', (req, res, next) => {
  try {
    console.log('Received data:', req.body);
    let { type, setup, punchline } = req.body;
    if (!type || !setup || !punchline) {
      console.log('Validation failed:', { type, setup, punchline });
      return res.status(400).json({
        type: 'error', message: 'Joke must have a type, setup, and punchline.'
      });
    }
    const newJokeId = getNextJokeId();
    const newJoke = {
      id: newJokeId,  
      type,
      setup,
      punchline
    };

    console.log('New joke to add:', newJoke);
    jokes.push(newJoke); 
    if (!types.includes(type)) {
      types.push(type);
    }

    res.status(201).json({
      type: 'success',
      message: 'Joke added successfully',
      joke: newJoke
    });
  } catch (e) {
    console.error('Error in /jokes/add route:', e);
    return next(e); 
  }
});

//delete existing joke
app.delete('/jokes/:id', (req, res, next) => {
  try {
    const { id } = req.params;
    const jokeIndex = jokes.findIndex(joke => joke.id === parseInt(id));

    if (jokeIndex === -1) {
      return res.status(404).json({ type: 'error', message: 'Joke not found' });
    }

    jokes.splice(jokeIndex, 1);
    res.status(200).json({ type: 'success', message: 'Joke deleted successfully' });
  } catch (error) {
    console.error('Error deleting joke:', error);
    return next(error);
  }
});

app.get('/types', (req, res, next) => {
  res.json(types);
})

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    type: 'error', message: err.message
  });
});

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`listening on ${PORT}`));

