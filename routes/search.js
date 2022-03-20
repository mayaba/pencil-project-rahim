require('dotenv').config();
const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');
const { queryDB } = require('../util/dbquery');
const Redis = require('ioredis');

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';
const redis_client = new Redis(REDIS_URL);
// PLEASE SET THE BELOW FLAG TO TRUE IF YOU HAVE REDIS INSTALLED LOCALLY
const redisinstalledlocally = true;

const DBHOST = process.env.DBHOST;
const DBUSERNAME = process.env.DBUSERNAME;
const DBPASSWORD = process.env.DBPASSWORD;

const uri = `mongodb+srv://${DBUSERNAME}:${DBPASSWORD}@${DBHOST}/pencil-project?retryWrites=true&w=majority`;
const mongo_client = new MongoClient(uri);

router.get('/', async (req, res) => {
  const topic_id = req.query.q;

  if (!topic_id) {
    res.status(404).json({
      success: false,
      message: 'No topic provided',
    });
  }

  // check if it is cached before connecting to the cluster
  const cached_query = await redis_client.get(topic_id);

  if (cached_query && redisinstalledlocally) {
    console.log('[+] Found cached query');
    const questions = JSON.parse(cached_query);

    if (questions.length > 0) {
      res.json({
        success: true,
        questions,
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Invalid topic',
      });
    }
  } else {
    try {
      mongo_client.connect(async () => {
        console.log('[+] Connected to the cluster...');

        const questions = await queryDB(
          mongo_client,
          topic_id,
          redis_client,
          redisinstalledlocally
        );

        if (questions.length > 0) {
          res.json({
            success: true,
            questions,
          });
        } else {
          res.status(404).json({
            success: false,
            message: 'Invalid topic or No Questions found',
          });
        }
        await mongo_client.close();
      });
    } catch (err) {
      console.error(err);
    }
  }
});

module.exports = router;