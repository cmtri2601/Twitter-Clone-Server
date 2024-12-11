import { Collection, MongoClient, ServerApiVersion } from 'mongodb';
import { FollowerEntity } from '~/models/schemas/Followers.schema';
import { RefreshTokenEntity } from '~/models/schemas/RefreshToken.schema';
import { UserEntity } from '~/models/schemas/User.schema';

class DataBase {
  public client;
  private db;

  constructor(uri: string, databaseName?: string) {
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    });
    this.db = this.client.db(databaseName);
  }

  /**
   * Run database
   */
  async run() {
    try {
      // Connect the client to the server	(optional starting in v4.7)
      await this.client.connect();
      // Send a ping to confirm a successful connection
      await this.db.command({ ping: 1 });
      console.log(
        'Pinged your deployment. You successfully connected to MongoDB!'
      );
    } catch (error) {
      console.log('Error', error);
      throw error;
    }
  }

  /**
   * get users collection
   */
  get users(): Collection<UserEntity> {
    return this.db.collection('users');
  }

  /**
   * get refresh_token collection
   */
  get refreshTokens(): Collection<RefreshTokenEntity> {
    return this.db.collection('refresh_tokens');
  }

  /**
   * get followers collection
   */
  get followers(): Collection<FollowerEntity> {
    return this.db.collection('followers');
  }
}

// init uri
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@study.ifaon.mongodb.net/?retryWrites=true&w=majority&appName=Study`;

// create database
const database = new DataBase(uri, process.env.MONGO_DATABASE);

export default database;
