import { Database } from "./Database";
import { Pool, PoolClient } from "pg";
import { MessageProps, UserInfo, MessageType, RoomEvent } from "../types";
import { tables, Message, sqlResultKey, Keys, tryQuery, SaveMessageProps } from "./db-types";
import delay = require("delay");
import { avatarPath } from "../pathes";

const N = 20;

export class MessagesDb {
  private readonly _db: PoolClient;

  constructor(db: PoolClient) {
    this._db = db;
  }

  async saveRoomEvent(user_id: number, room_id: number, event: RoomEvent) {
    await this._db.query(
      `with new_message as (insert into ${tables.messages} (type, room_id, user_id) values ('room_event', $1, $2) returning id) ` +
      `insert into messages_room_event (event_type, message_id) ` +
      `values (\'${RoomEvent[event]}\', (select id from new_message));`,
      [room_id, user_id]
    )
  }

  async saveMessage({user_id, room_id, type, content}: SaveMessageProps) {
    return (await tryQuery('save text message', () => (
      this._db.query(
        `insert into ${tables.messages} (room_id, user_id, type, content) values($1, $2, $3, $4) returning extract(epoch from ${tables.messages.date})*1000 as date, id`,
        [room_id, user_id, type, content]
      )
    ))).rows[0]
  }

  async load(roomId: number, offset: number = 0) {
    const messageKeys = sqlResultKey<MessageProps>();
    return (await this._db.query<MessageProps>(
      `select ${tables.messages.id}, ${tables.messages.type}, ${tables.messages.content}, extract(epoch from ${tables.messages.date})*1000 as ${messageKeys.date}, ${tables.messages.user_id} as ${messageKeys.userId}, ` +
      `${tables.users.login} as ${messageKeys.userLogin}, `+
      `'${avatarPath}' || REGEXP_REPLACE(${tables.users.avatar}, '(\\.\\w+)$', '.min\\1') as ${messageKeys.userAvatarMin} from ${tables.messages} ` +
      `left join ${tables.users} on ${tables.users.id} = ${tables.messages.user_id} ` +
      `where ${tables.messages.room_id} = $1 ` +
      `order by messages.id DESC ` +
      `limit ${N} ` +
      `offset $2*${N};`,
      [roomId, offset]
    )).rows
    .reverse()
  }

  async delete(messagesIds: number[]) {
    return (
      await tryQuery('delete messages', () => (
        this._db.query(
          `delete from ${tables.messages} ` + 
          `where ${tables.messages.id} = ANY($1::int[])`,
          [messagesIds]
        )
      ))
    )
  }

  async loadMedia(roomId: number) {
    interface LoadMediaProps {
      content: string;
    }
    return (await this._db.query<LoadMediaProps>(
      `select content from ${tables.messages} ` +
      `where "type" IN('${MessageType.img}', '${MessageType.video}') and ${tables.messages.room_id} = $1`,
      [roomId]
    )).rows.map(v => v.content).reverse();
  }
}