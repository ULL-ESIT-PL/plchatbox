import { Pinecone } from "@pinecone-database/pinecone";
import { env } from "./config";
import { delay } from "./utils";

let pineconeClient: Pinecone | null = null;

async function createIndex(pinecone: Pinecone, indexName: string) {
    try {
        await pinecone.createIndex({
            name: indexName,
            dimension: 1536,
            metric: 'cosine',
            spec: { 
                serverless: { 
                  cloud: 'aws', 
                  region: 'us-east-1' 
                }
            }
          });

          console.log(
            `Waiting for ${env.INDEX_INIT_TIMEOUT} seconds for index initialization to complete...`
          );
          await delay(env.INDEX_INIT_TIMEOUT);
          console.log("Index created !!");
        }
        catch (error) {
            console.error("error", error);
            throw new Error("Failed to create index");
        }
    }

async function initPinecone() {
  try {
  const pinecone = new Pinecone({
    apiKey: env.PINECONE_API_KEY,
  });

  const indexName = env.PINECONE_INDEX_NAME;

  const existingIndexes = await pinecone.listIndexes();


    if (existingIndexes && existingIndexes.indexes && existingIndexes.indexes.some((index) => index.name === indexName)) {
        console.log(`Index ${indexName} already exists`);
        //delete all vectors from the index
    } else {
        await createIndex(pinecone, indexName);
    }

    return pinecone;
  } catch (error) {
    console.error("error", error);
    throw new Error("Failed to initialize Pinecone");
    }
}

export async function getPineconeClient() {
    if(!pineconeClient) {
        pineconeClient = await initPinecone();
    }
    return pineconeClient;
}
    