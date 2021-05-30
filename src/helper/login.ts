import {isObject, isString } from 'util';
import { HandlersProps, LoginProps, UserInfo, MessageProps, ResProps } from '../types';
import { Database } from '../db/Database';
import { createHash } from 'crypto';
import * as moment from 'moment';
import { Socket } from 'socket.io';
import { randomBytes } from 'crypto';
import { avatarPath } from '../pathes';

export const isLoginProps = (data: LoginProps): data is LoginProps => (
  isObject(data) &&
  isString(data.login) &&
  isString(data.password)
);

// !!! refactoring
export const login = async (
  socket: Socket, 
  res: (data?: ResProps) => void,
  db: Database,
  data: LoginProps
) => {
  const session = socket.client.session;
  
  if(!isLoginProps(data)) {
    console.log('is login props error');
    return res();
    // throw new Error();
  }
  const user = await db.users.find(
    {
      login: data.login,
      password: createHash('md5',).update(data.password + 'qwerty').digest('hex'),
    }
  );
  if(!user) {
    console.log('could not find user');
    return res();
  }
  // create new session
  randomBytes(64, async (error, buffer) => {
    if (error) {
      throw error;
    }
    const token = buffer.toString('base64');
    const date = moment();
    date.add(6, 'month');
    await db.auth_sessions.create({token, userId: user.id , expires: date.toDate()});

    if(session) {
      socket.leave(String(session.user.roomId));
    }

    if(user.avatar) {
      user.avatar = avatarPath + user.avatar; //!!!
      user.avatarMin = user.avatar.replace(/(\.\w+)$/, '.min$1');
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
  // return res.json(userInfo);
}