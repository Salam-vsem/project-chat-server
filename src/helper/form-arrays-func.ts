import { MessageProps, RoomDescription } from "../types"
import { MessagesQuery } from "../db/Messages-db";
import { Room } from "../db/db-types";
import { Database } from "../db/Database";

// export const formMessagesArray = (arr: MessagesQuery[], roomId: number) => {
//   const messages: MessageProps[] = [];
//   arr.forEach(item => {
//     messages.push(
//       {
//         text: item.text,
//         user: {
//           id: item.user_id,
//           isAdmin: item.is_admin,
//           login: item.login,
//           roomId
//         }
//       }
//     )
//   });
//   return messages;
// }

// export const formRoomsDescrArray = async (arr: Room[], db: Database) => {
//   const rooms: RoomDescription[] = [];
//   for(let i = 0; i < arr.length; i++) {
//     const room = arr[i];
//     const users = (await db.users.findByRoomid(room.id)).length;
//     rooms.push(
//       {
//         id: room.id,
//         name: room.name,
//         usersAmount: users,
//       }
//     )
//   }
//   return rooms;
// }