const { MongoClient } = require('mongodb');

async function queryDB(client, topic_id) {
  const pipline = [
    { '$match': { '_id': topic_id } },
    {
      '$lookup': {
        'from': 'questions',
        'localField': 'topiclist',
        'foreignField': 'annotation1',
        'as': 'enrolled_questions_1',
      },
    },
    {
      '$lookup': {
        'from': 'questions',
        'localField': 'topiclist',
        'foreignField': 'annotation2',
        'as': 'enrolled_questions_2',
      },
    },
    {
      '$lookup': {
        'from': 'questions',
        'localField': 'topiclist',
        'foreignField': 'annotation3',
        'as': 'enrolled_questions_3',
      },
    },
    {
      '$lookup': {
        'from': 'questions',
        'localField': 'topiclist',
        'foreignField': 'annotation4',
        'as': 'enrolled_questions_4',
      },
    },
    {
      '$lookup': {
        'from': 'questions',
        'localField': 'topiclist',
        'foreignField': 'annotation5',
        'as': 'enrolled_questions_5',
      },
    },
    {
      '$project': { '_id': 0, 'topiclist': 0, '__v': 0 },
    },
    {
      '$project': {
        'questions_list': {
          '$concatArrays': [
            '$enrolled_questions_1',
            '$enrolled_questions_2',
            '$enrolled_questions_3',
            '$enrolled_questions_4',
            '$enrolled_questions_5',
          ],
        },
      },
    },
    { '$project': { 'questions_list._id': 1 } },
  ];

  const aggCursor = client
    .db('pencil-project')
    .collection('topics')
    .aggregate(pipline);

  const aggresult = await aggCursor.toArray();
  const questionsnums = [];

  aggresult.forEach((qlist) => {
    qlist.questions_list.forEach((q) => {
      if (!questionsnums.includes(q._id)) {
        questionsnums.push(q._id);
      }
    });
  });

  return questionsnums.sort((a, b) => a - b);
}

exports.queryDB = queryDB;