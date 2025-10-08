const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DBNAME || 'camelDB';
let client;

async function connectMongo() {
  if (!client) {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
  }
  return client.db(dbName);
}

async function updateWithRetry(collection, filter, update, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const db = await connectMongo();
      await db.collection(collection).updateOne(filter, { $set: update }, { upsert: false });
      console.log("Mongo update successful");
      return;
    } catch (err) {
      console.warn(`Mongo attempt ${i + 1} failed: ${err.message}`);
      if (i < retries - 1) await new Promise(r => setTimeout(r, 5 * 60 * 1000));
    }
  }
  throw new Error("Mongo update failed after retries");
}

async function findOne(collection, filter) {
  const db = await connectMongo();
  return db.collection(collection).findOne(filter);
}

module.exports = { updateWithRetry, connectMongo, findOne };
