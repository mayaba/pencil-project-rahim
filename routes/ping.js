require('dotenv').config();
const express = require('express');
const router = express.Router();
const { MongoClient } = require('mongodb');

const DBHOST = process.env.DBHOST;
const DBUSERNAME = process.env.DBUSERNAME;
const DBPASSWORD = process.env.DBPASSWORD;

const uri = `mongodb+srv://${DBUSERNAME}:${DBPASSWORD}@${DBHOST}/pencil-project?retryWrites=true&w=majority`;
const mongo_client = new MongoClient(uri);

console.log(uri);
// console.log(require('dotenv').config());

router.get('/', async (req, res) => {
  try {
    await mongo_client.connect();
    await mongo_client.db('pencil-project').command({ ping: 1 });

    res.json({
      success: true,
      message: 'Connected to database',
    });
  } catch (err) {
    res.json({
      success: false,
      message: err,
    });
  } finally {
    await mongo_client.close();
  }
});

module.exports = router;
