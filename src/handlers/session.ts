import { CreateRoomProps, LoginProps, MessageType, ResProps, RoomCache, SocketConnection } from '../types';
import * as cookie from 'cookie';
import { login } from "../helper/login";
import { register } from "../helper/register";
import { avatarPath } from "../pathes";
import { AuthData } from '../types';

export const sessionNamespace = async ({io, socket, db, rooms, users}: SocketConnection) => {
  const cookies = cookie.parse(socket.handshake.headers['cookie'] ?? '');
  const token = cookies['token']; // import key
  const user = await db.users.findByToken(token);

  if(user) {
    if(user.avatar) {
      user.avatar = avatarPath + user.avatar; //!!!
      user.avatarMin = user.avatar.replace(/(\.\w+)$/, '.min$1');
    }

    socket.client.session = {
      token,
      user,
    }
  }

  socket.on('auth', (res: (data: AuthData) => void) => {
    socket.emit('auth', user, rooms); // !!! так правильно?
    res({user, rooms})
  })

  socket.on('login', async (data: LoginProps, res: (data?: ResProps) => void) => {
    // console.log(data);
    login(socket, res, db, data);
  });

  socket.on('logout', async(res: () => void) => {
    const session = socket.client.session;
    if (session) {
      await db.auth_sessions.delete(session.token);
      // await db.users.updateRoom(session.user.id, null);
      delete socket.client.session;
    }
    res();
  });

  socket.on('reg', async (data: LoginProps, res: (data: ResProps | undefined) => void) => {
    register(socket, res, db, data);
  });

  socket.on('create-room', async (room: CreateRoomProps, res: (newRoom: RoomCache) => void) => {
    const id = await db.rooms.create(room);
    await db.messages.saveMessage({
      room_id: id,
      type: MessageType.room_created,
      content: '', // !!! fix
    });
    const avatarMin = room.avatar? avatarPath + room.avatar: undefined;
    const newRoom: RoomCache = {
      id,
      name: room.name,
      description: room.description,
      avatarMin,
      messagesCount: 0,
      usersAmount: 0,
    }
    rooms[id.toString()] = newRoom;
    users[id] = [];
    // setTimeout(() => res(newRoom), 10000)
    res(newRoom);
  })
}