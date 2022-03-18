// require express and mongoose
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const { queryDB } = require('./util/dbquery');
const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const dbhost = process.env.DBHOST;
const dbusername = process.env.DBUSERNAME;
const dbpassword = process.env.DBPASSWORD;

const uri = `mongodb+srv://${dbusername}:${dbpassword}@${dbhost}/pencil-project?retryWrites=true&w=majority`;
const client = new MongoClient(uri);

app.get('/ping', (req, res) => {
  res.json({
    success: true,
  });
});

app.get('/search', async (req, res) => {
  try {
    await client.connect(async () => {
      console.log('[+] Connected to the cluster...');
      const topic = req.query.q;

      if (!topic) {
        res.status(404).json({
          success: false,
          message: 'No topic provided',
        });
      }

      const questions = await queryDB(client, req.query.q);
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
