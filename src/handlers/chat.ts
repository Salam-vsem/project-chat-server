import { deleteFilesMessages } from '../helper/delete-files';
import { updateCacheLeave } from '../helper/leave-room';
import { avatarPath } from '../pathes';
import { MessageProps, RoomProps, SocketConnection, UserCache, MessageType, CreateRoomProps, RoomCache } from '../types';

export const chatNamespace = async ({socket, db, rooms, users}: SocketConnection) => {
  // ????
  socket.on('disconnect', async () => {
    const user = socket.client.session?.user;
    if (user && user.roomId) {
      await db.rooms.leave(user.roomId, user.id);
      updateCacheLeave(user, users, rooms, user.roomId, socket);
    }
  });

  // const switchMessageTypes = (userId: number, roomId: number, content: string, type: MessageType) => {
  //   switch(type) {
  //     case (MessageType.text): {
  //       return db.messages.saveMessage(userId, roomId, type, content)
  //     }
  //     case(MessageType.img): {
  //       return db.messages.saveMessage(userId, roomId,type, content)
  //     }
  //     case(MessageType.doc): {
  //       return NaN;
  //     }
  //     case(MessageType.video): {
  //       return NaN;
  //     }
  //   }
  // }

  // message type = gallery
  // content = ['name1', 'name2']
  // content: varchar | text
  // JSON.parse(content)

  socket.on('message', async (content: string, type: MessageType) => {
    const session = socket.client.session;
    if (session && session.user.roomId) {
      console.log(content)
      const message = await db.messages.saveMessage(
        {
          user_id: session.user.id,
          room_id: session.user.roomId,
          type,
          content
        }
      );
      socket.nsp.to(String(session.user.roomId)).emit(
          'message',
          {
            id: message.id,
            type,
            content,
            date: message.date,
            userId: session.user.id,
            userLogin: session.user.login,
            userAvatarMin: session.user.avatarMin
          }
        );
      // socket.emit('message', {text, user: session.user});

      // await db.messages.saveTextMessage(session.user.id, session.user.roomId, content);
      // io.of('/notifications').to(socket.id).emit('achievment', message);
      // socket.emit('message', );
    } else {
      throw new Error();
    }
  });

  socket.on('load-messages', async (roomId: number, offset: number, res: (messages: MessageProps[]) => void) => {
    const messages = await db.messages.load(roomId, offset);
    return res(messages);
  });

  socket.on('delete-messages', async (messages: MessageProps[], res: () => void) => {
    const session = socket.client.session;
    if(!session) {
      return
    }
    try {
      await deleteFilesMessages(messages)
      // console.log(messages.map(message => message.id))
      await db.messages.delete(messages.map(message => message.id))
    }catch(e) {
      return res()
    }
    socket.nsp.to(String(session.user.roomId)).emit('delete-messages', messages)
    return res();
  });

  socket.on('load-media', async (roomId: number, res: (media: string[]) => void) => {
    const media = await db.messages.loadMedia(roomId);
    res(media)
  })

  // socket.on('room-event', async () => {
    
  // })

  // socket.on('rooms', async ( res: (rooms: Rooms) => void) => {
  //   // const formedRooms = await formRoomsDescrArray(rooms, db);
  //   // console.log(formedRooms);
  //   return res(rooms);
  // });

  // socket.on('messages', async ( res: (rooms: RoomDescription[], users: ) => void) => {
  //   const user = socket.client.session?.user;
  //   if(user) {
  //     if(user.roomId) {
  //       const users = await db.users.findByRoomid(user.roomId);
  //     }
  //     const rooms = await db.rooms.selectAll();
  //   }
  //   // const formedRooms = await formRoomsDescrArray(rooms, db);
  //   // console.log(formedRooms);
  //   return res();
  // });

  // socket.on('restore-room', async (res: (room?: RoomProps) => void) => {
  //   // console.log('restoring room');
  //   const session = socket.client.session;
  //   // console.log(session?.user);
  //   if (!session) {
  //     return res();
  //   }

  //   const roomId = session.user.roomId;
  //   console.log(roomId);

  //   if (!roomId) {
  //     return res();
  //   }

  //   socket.join(String(session.user.roomId));
  //   // const room = await db.rooms.join(roomId, session.user.id); //!!! по прежнему два запроса
  //   // console.log(room.map(item => console.log(item.users)));
  //   // const users = await db.users.findByRoomid(roomId);
  //   return res(rooms[roomid]);
  // });

  socket.on('join', async (roomId: number, res: (room: RoomProps) => void) => {
    const session = socket.client.session;
    try {
      if (session) {
        const user = session.user;
        // console.log('joining room: ', user.login, ' ', roomId);
        user.roomId = roomId;
        socket.join(String(user.roomId));
        // const room = await db.rooms.join(roomId, user.id); //!!! по прежнему два запроса
        const messages = await db.messages.load(roomId);
        const userInRoom = users[roomId].find(v => v.id === user.id);
        // console.log('result: ', userInRoom)

        if(userInRoom) {
          userInRoom.connections++;
        }
        else {
          // add user to users cache
          const newUser: UserCache = {
            id: user.id,
            name: user.login,
            avatar: user.avatarMin,
            connections: 1,
          }
          users[roomId].push(newUser);
          // increase counter of users in room
          rooms[roomId].usersAmount++;
          socket.to(roomId.toString()).emit('join-room', newUser, roomId);
          socket.nsp.emit('menu-update-room', roomId, rooms[roomId].usersAmount);
          // socket.emit('')
        }
        // console.log(Object.values(rooms).map(room => room.name + ': ' + room.usersAmount))
        // setTimeout(() => res({...rooms[roomId], messages, users: users[roomId]}), 5000)
        return res({...rooms[roomId], messages, users: users[roomId]});
      } else {
        console.log('no session');
      }
    } catch(error) {
      console.log(error.message);
    }
  });

  socket.on('leave-room', async (res: (successful?: true) => void) => {
    const user = socket.client.session?.user;
    // console.log('leaving room: ', user?.login);
    const roomId = user?.roomId;
    if (user && roomId) {
      updateCacheLeave(user, users, rooms, roomId, socket);
      // socket.nsp.emit('menu-update-room', roomId, rooms[roomId].usersAmount);
      user.roomId = undefined;
      return res(true);
    }
    res();
  });

  // socket.on('/register', async(data: Login) => {
  //   const data: LoginProps = req.body;
  //   if(!isLoginProps(data)) {
  //     throw new Error();
  //   }
  //   const token = req.token;
  //   const user = User.create(data.login, data.password);

  //   await req.database.manager.save(User, user);
  //   await req.database.manager.delete(AuthSession, {token})
  //   await req.database.manager.save(AuthSession, AuthSession.create(user, token));
  // });
}