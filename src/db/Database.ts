import { PoolClient, Pool } from "pg";
import { UsersDb } from "./Users-db";
import { AuthSessionsDb } from "./AuthSessions-db";
import { RoomsDb } from "./Rooms-db";
import { MessagesDb } from "./Messages-db";

// 1



// 3

export interface ResultId {
  id: number;
}

// 2

export class Database {
  private readonly _db: PoolClient;
  private _pool: Pool;

  readonly users: UsersDb;
  readonly auth_sessions: AuthSessionsDb;
  readonly rooms: RoomsDb;
  readonly messages: MessagesDb;
 
  static async connect() {
    const pool = new Pool({
      database: 'superchat',
      user: 'postgres',
      password: 'postgres',
    });
    return new Database(pool, await pool.connect());
  }

  get db() {
    return this._db;
  }

  private constructor (pool: Pool, connection: PoolClient) {
    this._db = connection;
    this._pool = pool;
    
    this.users = new UsersDb(this.db);
    this.messages = new MessagesDb(this.db);
    this.auth_sessions = new AuthSessionsDb(this.db);
    this.rooms = new RoomsDb(this.db);

  }

  disconnect() {
    this._pool.end();
  }
}