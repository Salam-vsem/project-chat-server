import { Socket } from "socket.io";
import { Rooms, UserInfo, Users } from "../types";

export const updateCacheLeave = (user: UserInfo, users: Users, rooms: Rooms, roomId: number, socket: Socket) => {
  const userInRoom = users[roomId].find(v => v.id === user.id);

  if(userInRoom) {
    if(userInRoom.connections > 1) {
      userInRoom.connections--;
    }
    else {
      const index = users[roomId].indexOf(userInRoom);
      users[roomId].splice(index, 1);
      rooms[roomId].usersAmount--;
      socket.nsp.emit('menu-update-room', roomId, rooms[roomId].usersAmount);
      socket.to(roomId.toString()).emit('leave-room', roomId, user.id);
    }
  }
}