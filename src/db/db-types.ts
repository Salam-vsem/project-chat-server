// const sqlName = <T extends Object>(): T => new Proxy({} as T, {
//   get({ }, tableName: string) {
//     return new Proxy({}, {
//       get({ }, colName: any) {
//         if (colName === Symbol.toPrimitive) {
//           return () => `"${tableName}"`;
//         }
//         return `"${tableName}"."${colName}"`;
//       }
//     });
//   }
// });

import { RoomEvent, MessageType, Theme } from "../types";

// !!!
export const sqlTables = <T extends Object>(noTable?: true): T => (
  new Proxy({} as any, {
    get({ }, tableName: string) {
      return new Proxy({}, {
        get({ }, colName: any) {
          if (colName === Symbol.toPrimitive) {
            return () => `"${tableName}"`;
          }
          if (noTable) {
            return `"${colName}"`;
          }
          return `"${tableName}"."${colName}"`;
        }
      });
    },
  })
);

export const sqlResultKey = <T extends Object>(): Record<keyof T, string> => (
  new Proxy({} as any, {
    get({ }, colName: string) {
      return `"${colName}"`;
    }
  })
);

export const tryQuery = async <T>(title: string, action: () => Promise<T>): Promise<T> => {
  try {
    return await action();
  } catch (e) {
    throw new Error(title + '\n' + e);
  }
}

export type Keys<T> = Record<keyof T, string>;

// 2

interface Tables {
  auth_sessions: Keys<AuthSession>;
  users: Keys<User>;
  rooms: Keys<Room>
  messages: Keys<Message>;
  // messages_room_event: Keys<MessagesRoomEvent>;
  // messages_text: Keys<MessagesText>;
  users_rooms: Keys<UsersRooms>;
}

export interface AuthSession {
  expires: Date;
  token: string;
  user_id: number;
}

export interface Room {
  id: number;
  name: string;
  description: string;
  avatar: string;
}

export interface User {
  id: number;
  is_admin: boolean;
  login: string;
  password: string;
  avatar: string;
  theme: Theme;
}

export interface Message {
  id: number;
  type: MessageType;
  date: Date;
  content: string;
  room_id: number;
  user_id: number;
}

export interface SaveMessageProps {
  user_id?: number;
  room_id: number;
  type: MessageType;
  content: string;
}

// export interface MessagesRoomEvent {
//   id: number;
//   event_type: RoomEventType;
//   message_id: number;
// }

// export interface MessagesText {
//   id: number;
//   text: string;
//   message_id: number;
// }

export interface UsersRooms {
  id: number;
  user_id: number;
  room_id: number;
}

export const tables = sqlTables<Tables>();