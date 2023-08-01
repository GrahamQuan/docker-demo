const express = require('express');
const redis = require('redis');
require('dotenv').config()

const PORT = process.env.PORT;
const app = express();

const DOCKER_REDIS = {
  url: process.env.REDIS_URL,
}

const client = redis.createClient(DOCKER_REDIS);

client.on('connect', () => {
  console.log('Connected to Redis');
});

client.on('error', (err) => {
  console.error('Redis Error:', err);
});

app.get('/', async (req, res) => {
  try {
    const redisGetRes = await client.get('node_key')
    if (!redisGetRes) {
      const redisSetRes = await client.set('node_key', 'Congratulations!!');
      if (redisSetRes) {
        res.send(`
          <p>Success: save data to redis</p>
          <p>
            <a href="/">show redis data</a>
          </p>
          <p>
            <a href="/delete">delete redis cache</a>
          </p>
        `)
      } else {
        res.send(`
          <p>Fail: save data to redis</p>
        `)
      }
    } else {
      res.send(`
        <p>Redis from docker: ${redisGetRes}</p>
        <a href="/delete">delete redis cache</a>
      `)
    }
  } catch (error) {
    console.log(error)
  }
});

// delete redis cache
app.get('/delete', async (req, res) => {
  try {
    const delCount = await client.del('node_key')
    if (delCount) {
      res.send(`
        <p>Success: delete redis cache</p>
        <a href="/">Back to home</a>
      `)
    } else {
      res.send(`
        <p>There is no cache in redis</p>
        <a href="/">Back to home</a>
      `)
    }
  } catch (error) {
    console.log(error)
  }
})

client.connect();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
