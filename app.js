// require express and mongoose
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const { queryDB } = require('./util/dbquery');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const uri = 'mongodb://localhost:27017';
const client = new MongoClient(uri);

app.get('/ping', (req, res) => {
  res.json({
    success: true,
  });
});

app.get('/search', async (req, res) => {
  try {
    client.connect(() => {
      console.log('[+] Connected to the cluster...');
    });

    const questions = await queryDB(client, req.query.q);
    res.json({
      questions,
    });
  } catch (err) {
    console.error(err);
  } finally {
    client.close();
  }
});

const port = process.env.PORT || 3003;
module.exports = app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
