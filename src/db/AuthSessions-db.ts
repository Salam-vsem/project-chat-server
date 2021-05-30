import { PoolClient } from "pg";
import { tables } from "./db-types";

export interface CreateSessionProps {
  token: string;
  userId: number;
  expires: Date;
}

export class AuthSessionsDb {
  private readonly _db: PoolClient;

  constructor(db: PoolClient) {
    this._db = db;
  }

  async create(session: CreateSessionProps){
    await this._db.query(
      `insert into ${tables.auth_sessions} (token, user_id, expires) values ($1, $2, $3);`,
      [session.token, session.userId, session.expires]
    );
  }

  async delete(token: string) {
    await this._db.query(
      `delete from ${tables.auth_sessions} where ${tables.auth_sessions.token} = $1`,
      [token]
    );
  }
}