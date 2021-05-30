// import { Pool } from "pg";
// import { Database } from '../db/Database';
// import { createSession } from "./auth";
// import * as moment from 'moment';
// import { User } from "../db/Database";

import { Database } from "../db/Database";

// const s1 = Symbol()
// const test = {}
// test[s1] = '123'
// console.log('test 1', String(test))
// test[Symbol.toPrimitive] = () => 'hi!';
// console.log('test 2', String(test))
// console.log('test', test)
// console.log('test s1', test[s1])

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

// type Keys<T> = Record<keyof T, string>;

// interface Tables {
//   users: Keys<User>;
// }

// const tables = sqlName<Tables>()

// console.log(`select ${tables.users.room_id} from ${tables.users}`)

const test = async () => {
  const db = await Database.connect();
  // console.log(await db.messages.test());
  // const id = await db.createUser({login: 'Kushina', password: '12345678', isAdmin: true});
  // console.log('user id: ', id);
  // const date = moment();
  // date.add(6, 'month');
  // db.createSession({token: 'We64LDt3xCfClQXXRtEUzEMlh8+Wa1EsUSQXhKhu6j+P/Z2XTm3kYBQxy3fUTMCFZ10PFbaNXQDrlliHYaGG8g==', userId: 6, expires: date.toDate()});
  // const roomId = await db.createRoom('room1');
  // db.saveMessage(
  //   {
  //     text: 'Hello, world',
  //     owner: {
  //       id: 7,
  //       isAdmin: true,
  //       login: 'Minato',
  //       room: {
  //         id: 1,
  //         name: 'room1',
  //       }
  //     }
  //   }
  // )
  db.disconnect();
}

// test();

// asadf dfaas