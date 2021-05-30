import { LoginProps, ResProps, UserInfo } from "../types";
import { Socket } from "socket.io";
import { Database } from "../db/Database";
import { isLoginProps } from './login';
import { createHash } from 'crypto';
import * as moment from 'moment';
import { UsersDb } from "../db/Users-db";
import { AuthSessionsDb } from "../db/AuthSessions-db";
import { randomBytes } from 'crypto';

export const register = async (
  socket: Socket, 
  res: (data?: ResProps) => void,
  db: Database,
  data: LoginProps
) => {
  const session = socket.client.session;
  
  if(!isLoginProps(data)) {
    return res();
  }
  // create user 
  try {
    const user = await db.users.create(
      {
        login: data.login,
        password:  createHash('md5',).update(data.password + 'qwerty').digest('hex'),
      }
    );
    // create session
    randomBytes(64, async (error, buffer) => {
      if (error) {
        console.error(error);
        return res();
      }
      const token = buffer.toString('base64');
      const date = moment();
      date.add(6, 'month');
      await db.auth_sessions.create({token, userId: user.id , expires: date.toDate()});

      if(session) {
        socket.leave(String(session.user.roomId));
      }

      socket.join(String(user.roomId));
      socket.client.session = {
        token,
        user,
      };

      return res({
        user,
        token,
      });
    });
  } catch(e) {
    console.log('ошибка');
    return res(undefined);
  }
}