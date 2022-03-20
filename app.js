const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.json({
    message:
      'Welcome to the Pencil Project API! Please query /search with a topic or /ping to check the connection with DB ',
  });
});

app.use('/ping', require('./routes/ping'));
app.use('/search', require('./routes/search'));

const port = process.env.PORT || 3003;
module.exports = app.listen(port, () => {
  console.log(`server listening on port ${port}`);
});
