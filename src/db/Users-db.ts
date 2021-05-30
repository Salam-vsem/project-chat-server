import { PoolClient } from "pg";
import { tables, tryQuery, User } from "./db-types";
import { ResultId } from './Database';
import { Theme, UserInfo } from "../types";
import { Keys, sqlResultKey } from './db-types';

export interface CreateUserProps {
  login: string;
  password: string;
  isAdmin?: boolean;
}

export interface FindUserProps {
  login: string;
  password: string;
}

export class UsersDb {
  private readonly _db: PoolClient;

  constructor(db: PoolClient) {
    this._db = db;
  }

  // async updateRoom(userId: number, newValue: any) { // !!! ошибка при изменении room_id на ${tables.users.room_id}
  //   await this._db.query(
  //     `update ${tables.users} ` +
  //     `set room_id = $2 ` + // !!!
  //     `where ${tables.users.id} = $1;`,
  //     [userId, newValue]
  //   );
  // }

  async updateAvatar(userId: number, avatar: string) { // !!! ошибка при изменении room_id на ${tables.users.room_id}
    await this._db.query(
      `update ${tables.users} ` +
      `set avatar = $2 ` + // !!!
      `where ${tables.users.id} = $1;`,
      [userId, avatar]
    );
  }

  async findByToken(token: string) {
    const userKeys = sqlResultKey<UserInfo>();
    const result = await tryQuery('find user by token', () => 
      this._db.query<UserInfo>( //!!! типизация
        `select ${tables.auth_sessions.user_id} as ${userKeys.id}, ${tables.users.login}, ${tables.users.is_admin} as ${userKeys.isAdmin}, ` +
        `${tables.users.theme}, ${tables.users_rooms.room_id} as ${userKeys.roomId}, ${tables.users.avatar} from ${tables.auth_sessions} ` +
        `left join ${tables.users} on ${tables.auth_sessions.user_id} = ${tables.users.id} ` +
        `left join ${tables.users_rooms} on ${tables.users_rooms.room_id} = ${tables.users.id} ` +
        `where ${tables.auth_sessions.token} = $1`,
        [token]
      )
    )
    return result.rows[0];
  }

  async create(user: CreateUserProps) {
    const userKeys = sqlResultKey<UserInfo>();
    const { id, login, password, is_admin } = tables.users;
    // tables.users.
    const result = await this._db.query<UserInfo>( //!!! не полностью добавил типизацию
      `insert into ${tables.users} (login, password, is_admin) values ($1, $2, $3) ` +
      `returning ${id}, ${login}, ${is_admin} as ${userKeys.isAdmin}, ${userKeys.theme};`,
      [user.login, user.password, user.isAdmin ?? false]
    );
    return result.rows[0];
  }

  async find(user: FindUserProps) {
    const userKeys = sqlResultKey<UserInfo>();
    const result = await this._db.query<UserInfo>(
      `select ${tables.users.id}, ${tables.users.is_admin} as ${userKeys.isAdmin}, ${tables.users.login}, ${tables.users.avatar}, ${tables.users.theme} ` +
      `from ${tables.users} ` +
      `where ${tables.users.login} = $1 AND ${tables.users.password} = $2;`,
      [user.login, user.password]
    );
    return result.rows[0];
  }

  async findByLogin(login: string) {
    const result = await this._db.query<ResultId>(
      `select ${tables.users.id} from ${tables.users} where ${tables.users.login} = $1;`,
      [login]
    );
    return result.rows[0].id;
  }

  // async findByRoomid(roomId: number) {
  //   const result = await this._db.query<UserInfo>(
  //     `select ${tables.users.id}, ${tables.users.login}, ${tables.users.is_admin} from ${tables.users} where room_id = $1;`,
  //     [roomId]
  //   );
  //   return result.rows;
  // }

  async updateTheme(userId: number, theme: Theme) {
    const result = await this._db.query<UserInfo>(
      `update ${tables.users} set "theme" = $1 where ${tables.users.id} = $2`,
      [theme, userId]
    );
    return result.rows;
  }

  async updateLogin(userId: number, newLogin: string) {
    return await this._db.query<UserInfo>(
      `update ${tables.users} set "login" = $1 where ${tables.users.id} = $2`,
      [newLogin, userId]
    );
  }
}