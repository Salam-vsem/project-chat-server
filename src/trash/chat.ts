// import { Socket, Server } from "socket.io";
// import { MessageProps, LoginProps, UserInfo, ResProps, RoomDescription } from '../types';
// import { Database } from "../db/Database";
// import * as cookie from 'cookie';
// import { login } from "../helper/login";
// import { register } from "../helper/register";
// import { QueryResult } from "pg";
// // import { formMessagesArray, formRoomsDescrArray } from "./helper/form-arrays-func";
// import { isUndefined } from 'util';
// import { Room } from "../db/db-types";

// export const sessionNamespace = async (db: Database, socket: Socket, io: Server) => {
//   const cookies = cookie.parse(socket.handshake.headers['cookie']);
//   const token = cookies['token']; // import key
//   const user = await db.users.findByToken(token);
  
//   if(
//     user
//   ) {
//     socket.client.session = {
//       token,
//       user
//     }
//   }

//   socket.on('message', (text: string) => {
//     const session = socket.client.session;
//     if (session) {
//       console.log('message: ', text);
//       // console.log(socket.user.room.id);
//       socket.nsp.to(String(session.user.roomId)).emit('message', {text, user: session.user});
//       // socket.emit('message', {text, user: session.user});
//       db.messages.save(text, session.user.id, session.user.roomId);
//       // io.of('/notifications').to(socket.id).emit('achievment', message);
//       // socket.emit('message', )
//     } else {
//       throw new Error();
//     }
//   });

//   socket.on('auth', async (res: (user?: UserInfo) => void) => {
//     const session = socket.client.session;
//     if (session) {
//       console.log('token: ' + session.token);
//       return res(session.user);
//     } else {
//       return res();
//     }
//   });

//   socket.on('login', async (data: LoginProps, res: (data?: ResProps) => void) => {
//     console.log(data);
//     login(socket, res, db, data);
//   });

//   socket.on('logout', async(res: () => void) => {
//     const session = socket.client.session;
//     if (session) {
//       await db.auth_sessions.delete(session.token);
//       await db.users.updateRoom(session.user.id, null);
//       delete socket.client.session;
//     }
//     res();
//   });

//   socket.on('reg', async (data: LoginProps, res: (data: ResProps | undefined) => void) => {
//     register(socket, res, db, data);
//   });

//   socket.on('rooms', async ( res: (rooms: RoomDescription[]) => void) => {
//     const rooms = await db.rooms.selectAll();
//     // const formedRooms = await formRoomsDescrArray(rooms, db);
//     console.log(rooms);
//     return res(rooms);
//   });

//   socket.on('join', async (roomId: number, res: (messages: MessageProps[]) => void) => {
//     const session = socket.client.session;
//     try {
//       if (session) {
//         console.log (session.user.login, ' are joining room ', roomId);
//         await db.users.updateRoom(session.user.id, roomId);
//         session.user.roomId = roomId;
//         const messages = await db.messages.load(roomId); //!!! left join 
//         console.log(messages);
//         // const users = await db.users.findByRoomid(roomId);
//         // messages.map(message => console.log(message.text));
//         // users.map(user => console.log(user.login));
//         res(messages);
//       }
//     }catch(error) {
//       console.log(error.message);
//       res([]);
//     }
//   });

//   // socket.on('/register', async(data: Login) => {
//   //   const data: LoginProps = req.body;
//   //   if(!isLoginProps(data)) {
//   //     throw new Error();
//   //   }
//   //   const token = req.token;
//   //   const user = User.create(data.login, data.password);

//   //   await req.database.manager.save(User, user);
//   //   await req.database.manager.delete(AuthSession, {token})
//   //   await req.database.manager.save(AuthSession, AuthSession.create(user, token));
//   // });
// }