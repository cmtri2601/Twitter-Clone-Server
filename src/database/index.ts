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

      // Init index
      await this.initIndexes();
    } catch (error) {
      console.log('Error', error);
      throw error;
    }
  }

  /**
   * Init index
   */
  async initIndexes() {
    await this.initUserIndexes();
    await this.initRefreshTokenIndexes();
    await this.initFollowerIndexes();
  }

  /**
   * Get users collection
   */
  get users(): Collection<UserEntity> {
    return this.db.collection('users');
  }

  /**
   * Init indexes of user collection
   */
  async initUserIndexes() {
    // Check indexes are already existed
    const isExisted = await this.users.indexExists([
      'email_1',
      'username_1',
      'email_1_password_1'
    ]);

    if (isExisted) {
      return;
    }

    // Create indexes
    await this.users.createIndex({ email: 1 }, { unique: true });
    await this.users.createIndex({ username: 1 }, { unique: true });
    await this.users.createIndex({ email: 1, password: 1 });
  }

  /**
   * Get refresh_token collection
   */
  get refreshTokens(): Collection<RefreshTokenEntity> {
    return this.db.collection('refresh_tokens');
  }

  /**
   * Init indexes of user collection
   */
  async initRefreshTokenIndexes() {
    // Check indexes are already existed
    const isExisted = await this.refreshTokens.indexExists([
      'token_1',
      'exp_1'
    ]);

    if (isExisted) {
      return;
    }

    // Create indexes
    await this.refreshTokens.createIndex({ token: 1 }, { unique: true });
    await this.refreshTokens.createIndex({ exp: 1 }, { expireAfterSeconds: 0 });
  }

  /**
   * Get followers collection
   */
  get followers(): Collection<FollowerEntity> {
    return this.db.collection('followers');
  }

  /**
   * Init indexes of user collection
   */
  async initFollowerIndexes() {
    // Check indexes are already existed
    const isExisted = await this.followers.indexExists([
      'user_id_1',
      'follower_id_1',
      'user_id_1_follower_id_1'
    ]);

    if (isExisted) {
      return;
    }

    // Create indexes
    await this.followers.createIndex({ user_id: 1 });
    await this.followers.createIndex({ follower_id: 1 });
    await this.followers.createIndex({ user_id: 1, follower_id: 1 });
  }
}

// init uri
const uri = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@study.ifaon.mongodb.net/?retryWrites=true&w=majority&appName=Study`;

// create database
const database = new DataBase(uri, process.env.MONGO_DATABASE);

export default database;
