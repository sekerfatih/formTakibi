import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
let client;

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
  }
  const db = client.db("aselsan");
  return { db };
}