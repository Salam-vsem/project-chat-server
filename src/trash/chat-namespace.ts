import { Socket, Server } from "socket.io";
// import { MessageProps, LoginProps } from './types';
// import { Database } from "./Database";
import { login } from "../helper/login";

// export interface UserInfo {
//   nickname: string;
//   roomId: number,
// }

// export const chatNamespace = (db: Database, socket: Socket, io: Server) => {
//   socket.on('message', (message: MessageProps) => {
//     // console.log('message: ', info);
//     socket.nsp.to(socket.user.room.name).emit('message', message);
//     io.of('/notifications').to(socket.id).emit('achievment', message);
//     // chatNamespace.emit('message', info);
//   });

//   socket.on('login', async (data: LoginProps, res: (token?: string) => void) => {
//     login(socket, token, res, db, data);
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