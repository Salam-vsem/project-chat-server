import { PoolClient } from "pg";
import { tables, Room, sqlResultKey, UsersRooms, tryQuery } from "./db-types";
import { ResultId } from "./Database";
import { RoomProps, UserInfo, MessageProps, Rooms, RoomCache, UserCache, CreateRoomProps } from "../types";
import { MessagesDb } from "./Messages-db";
import { avatarPath } from "../pathes";

export class RoomsDb {
  private readonly _db: PoolClient;

  constructor(db: PoolClient) {
    this._db = db;
  }

  async create({name, description, avatar}: CreateRoomProps) {
    const result = await this._db.query<ResultId>(
      `insert into ${tables.rooms} (name, description, avatar) values ($1, $2, $3) returning id;`,
      [name, description, avatar]
    );
    return result.rows[0].id;
  }

  // async findById(id: number) {
  //   const result = await this._db.query<Room>(
  //     'select ${tables.users.}, name, count() from rooms where id = $1',
  //     [id]
  //   );
  //   return result.rows[0];
  // }

  // async selectOne(id: number) {
  //   try {
  //     const result = await this._db.query<RoomDescription>(
  //       `select rooms.id, name from "rooms" ` +
  //       `left join "users_rooms" on users_rooms.room_id = rooms.id ` +
  //       `where ${tables.rooms.id} = $1 ` +
  //       `group by rooms.id;`,
  //       [id]
  //     );
  //     return result.rows[0];
  //   } catch (e) {
  //     throw new Error('RoomsDb.selectAll' + '\n' + e);
  //   }
  // }

  // count(distinct users_rooms.user_id)

  // async selectAll(): Promise<Rooms> {
  //   try {
  //     const result = await this._db.query<RoomCache>(
  //       `select * from "rooms_list" `
  //     );
  //     return result.rows.reduce((map, room) => {
  //       map[room.id.toString()] = room;
  //       return map;
  //     }, {} as Rooms)
  //   } catch (e) {
  //     throw new Error('RoomsDb.selectAll' + '\n' + e);
  //   }
  // }

  async selectAll(): Promise<Rooms> {
    try {
      const result = await this._db.query<RoomCache>(
        `select "rooms".id, name, description, ` +
        `'${avatarPath}' || REGEXP_REPLACE(${tables.rooms.avatar}, '(\\.\\w+)$', '.min\\1') as "avatarMin", ` +
        `count("messages".id) as "messagesCount", 0 AS "usersAmount" from "rooms" ` +
        `left join "messages" on messages.room_id = rooms.id  ` +
        `group by rooms.id`
      );
      return result.rows.reduce((map, room) => {
        map[room.id.toString()] = room;
        return map;
      }, {} as Rooms)
    } catch (e) {
      throw new Error('RoomsDb.selectAll' + '\n' + e);
    }
  }

  // async join(roomId: number, userId: number): Promise<RoomProps> {
  //   const userKeys = sqlResultKey<UserInfo>();
  //   const messageKey = sqlResultKey<MessageProps>();

  //   // !!! пример отладки
  //   const qJoinRoom = `insert into ${tables.users_rooms} (room_id, user_id) values ($1, $2)`;
  //   await tryQuery(`RoomsDb.join (load rooms)\n${qJoinRoom}`, () => (
  //     this._db.query(qJoinRoom, [roomId, userId])
  //   ));
    
  //   const messagesDb = new MessagesDb(this._db);
  //   const messages = await messagesDb.load(roomId, 0);
  //   // const messages = await tryQuery('RoomsDb.join (load messages)', async () => {
  //     // const messageKeys = sqlResultKey<MessageProps>();
  //   //   return (await this._db.query<MessageProps>(
  //   //     `select ${tables.messages.id}, ${tables.messages.type}, ${tables.messages.content}, extract(epoch from ${tables.messages.date})*1000 as ${messageKey.date}, ${tables.messages.user_id} as ${messageKeys.userId}, ` +
  //   //     `${tables.users.login} as ${messageKey.userLogin}, ${tables.users.avatar} as ${messageKey.userAvatarMin} from ${tables.messages} ` +
  //   //     `left join ${tables.users} on ${tables.users.id} = ${tables.messages.user_id} ` +
  //   //     `where ${tables.messages.room_id} = $1 ` +
  //   //     `order by messages.id desc ` + 
  //   //     `limit 20 ` +
  //   //     `offset 20*0;`,
  //   //     [roomId]
  //   //   )).rows.reverse();
  //   // });

  //   // user_id room_id readed_messages_count

    
    
  //   const users = await tryQuery('RoomsDb.join (load users)', async () => (
  //     (await this._db.query<UserCache>( //!!!
  //       `select ${tables.users.id}, ${tables.users.login}, count(${tables.users_rooms.id}) as ${userKeys.connections}, ` +
  //       `${tables.users.is_admin} as ${userKeys.isAdmin}, concat('/images/', ${tables.users.avatar}) as ${userKeys.avatar}, ` +
  //       `concat('/images/', replace(${tables.users.avatar}, '.', '.min.')) as ${userKeys.avatarMin} from ${tables.users} ` +
  //       `right join ${tables.users_rooms} on ${tables.users.id} = ${tables.users_rooms.user_id} ` +
  //       `where ${tables.users_rooms.room_id} = $1 ` + 
  //       `group by ${tables.users.id};`,
  //       [roomId]
  //     )).rows
  //   ));

  //   // const room = await tryQuery('RoomsDb.join (load room)', async () => (
  //   //   // (await this._db.query<UserInfo>( //!!!
  //   //   //   `select ${tables.rooms.name}, ${tables}`
  //   //   // )).rows
  //   // ));

  //   return {messages, users};
  // }

  async leave(roomId: number, userId: number): Promise<void> {
    const query =  `delete from ${tables.users_rooms} where ctid IN (select ctid from ${tables.users_rooms} where ${tables.users_rooms.room_id} = $1 and ${tables.users_rooms.user_id} = $2 limit 1);`
    // console.log(query);
    await this._db.query<UsersRooms>(query, [roomId, userId]);
    /// !!! скорее всего это костыль
  }
}