const express = require('express');
const router = express.Router();
const { queryDB } = require('../util/dbquery');

router.get('/', async (req, res) => {
  const topic_id = req.query.q;

  if (!topic_id) {
    res.status(404).json({
      success: false,
      message: 'No topic provided',
    });
  }

  const questions = await queryDB(topic_id);

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
});
module.exports = router;
