require('dotenv').config();
const { MongoClient } = require('mongodb');
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

async function queryDB(topic_id) {
  // check if it is cached before connecting to the cluster
  const cached_query = await redis_client.get(topic_id);

  if (cached_query && redisinstalledlocally) {
    console.log('[+] Found cached query');
    return JSON.parse(cached_query);
  } else {
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

    await mongo_client.connect();
    const aggCursor = mongo_client
      .db('pencil-project')
      .collection('topics')
      .aggregate(pipline);

    const aggresult = await aggCursor.toArray();
    await mongo_client.close();

    const questionsnums = [];

    aggresult.forEach((qlist) => {
      qlist.questions_list.forEach((q) => {
        if (!questionsnums.includes(q._id)) {
          questionsnums.push(q._id);
        }
      });
    });

    questionsnums.sort((a, b) => a - b);

    if (redisinstalledlocally) {
      redis_client.set(topic_id, JSON.stringify(questionsnums));
      console.log('[+] Cached query');
    }

    return questionsnums;
  }
}

exports.queryDB = queryDB;
