import { Socket, Server as ServerIo } from "socket.io";
import { Database } from "../db/Database";
import * as fs from 'mz/fs';
import { SocketConnection, Theme } from "../types";
import { avatarFolder, avatarPath, publicFolder } from "../pathes";

interface UpdateAvatarData {
  avatar: string;
  avatarMin: string;
}
// const imagesPath = `${process.cwd()}/public${avatarPath}`;

export const settingsNamespace = async ({io, socket, db, rooms}: SocketConnection) => {
  socket.on('update-avatar', async (avatar: string, avatarMin: string, res: (data: UpdateAvatarData) => void) => {
    if(socket.client.session && socket.client.session.user) {
      const user = socket.client.session.user;
      if(user.avatar) {
        try {
          await fs.unlink(publicFolder + user.avatar);
          await fs.unlink(publicFolder + user.avatar.replace(/(\.\w+)$/, '.min$1'));
          console.log('delete previous avatars');
        }catch(e) {
          console.log('failed deleting previous avatars');
          console.log(e.message);
        }
      }
      await db.users.updateAvatar(user.id, avatar);
      socket.client.session.user.avatar = avatarPath + avatar;
      socket.client.session.user.avatarMin = avatarPath + avatar;
      res({
        avatar: avatarPath + avatar, 
        avatarMin: avatarPath + avatarMin
      });
      // user.roomId && socket.nsp.to(String(user.roomId)).emit('update-avatar', avatarPath + avatar); !!!  сделать
    }
  });

  socket.on('update-theme', async (theme: Theme) => {
    // console.log('theme: ', theme);
    const user = socket.client.session?.user;
    if(user) {
      try {
        await db.users.updateTheme(user.id, theme)
      }catch(e) {
        console.log('failed update theme');
        console.log(e.message);
      }
    }
  })

  socket.on('update-login', async (newLogin: string) => {
    const user = socket.client.session?.user;
    if(user) {
      try {
        await db.users.updateLogin(user.id, newLogin);
      }catch(e) {
        console.log('failed update login');
        console.log(e.message);
      }
    }
  })
}
// console.log(join(process.cwd(),'avatar.jpg'))