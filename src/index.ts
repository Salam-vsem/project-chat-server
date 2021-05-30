// import { Pool } from 'pg';
import * as express from 'express';
import { createServer } from 'http';
// import { setToken } from './helper/set-token';
import * as Socket from 'socket.io';
import { Database } from './db/Database';
// import { chatNamespace } from './chat-namespace';
import { SocketSession, Users } from './types';
import { apiRouter } from './handlers/api';
import { chatNamespace } from './handlers/chat';
import { sessionNamespace } from './handlers/session';
import { settingsNamespace } from './handlers/settings';
import { avatarRouter } from './handlers/upload/avatar-upload';
import { imagesRouter } from './handlers/upload/images-upload';
import { videoRouter } from './handlers/upload/video-upload';
import { documentsRouter } from './handlers/upload/document-upload';
import { audioRouter } from './handlers/upload/audio-upload';

// declare global {
//   export namespace Express {
//     export interface Request {
//       token: string;
//     }
//   }
// }

declare global {
  namespace SocketIO {
    interface Client {
      session?: SocketSession;
    }
  }
}

// const pool = new Pool({
//   user: 'postgres',
//   password: 'postgres',
//   database: 'superchat',
//   // host: 'localhost',
// });

// const start = async () => {
//   const client = await pool.connect();
//   // const user = await client.query(`insert into users (name) values ('Minato') returning *`);
//   const result = await client.query('select * from users');
//   console.log(result.rows);
//   // console.log(user.rows);
//   pool.end();
// }

// const connectDB = (db: Database) => (socket: Socket.Socket, next: () => void) => {
//   socket.db = db;
//   next();
// }
// .use(connectDB(db))

// start();
// !!! union db io socket rooms in one interface
const start = async () => {
  const app = express();
  const http = createServer(app);
  const io = Socket(http);
  const db = await Database.connect();
  const rooms = await db.rooms.selectAll();
  const users = Object.keys(rooms).reduce((map, roomId) => {
    map[roomId] = [];
    return map;
  }, {} as Users);

  app.use('/api', apiRouter);

  app.use('/upload/avatar', avatarRouter);
  app.use('/upload/images', imagesRouter);
  app.use('/upload/video', videoRouter);
  app.use('/upload/documents', documentsRouter);
  app.use('/upload/audio', audioRouter);

  app.use(express.static('public'));
  
  app.get('/*', (req, res) => {
    res.sendFile('index.html', { root: 'public'});
  });

  // app.post('/token', async (req, res) => {
  //   console.log('post /token')
  //   const tokenKey = 'token'; // !!! export
  //   try {
  //     const token = JSON.stringify(req.body.token);
  //     if(token) {
  //       console.log('set token to: ', token);
  //       res.cookie(tokenKey, token, {
  //         maxAge: 365 * 24 * 60 * 60 * 1000,
  //         httpOnly: true
  //       });
  //       res.end();
  //     }
  //   } catch(e) {
  //     console.log('new error');
  //     // res.clearCookie(tokenKey);
  //   }
  // });
  
  // app.use((req, res, next)=> {
  //   setToken({req, res, next});
  // });
  
  // io.use((socket, next) => {
  //   setToken(socket, next);
  // })

  io.of('/chat').on('connection', (socket) => {
    chatNamespace({db, socket, io, rooms, users});
  });

  io.of('/session').on('connection', (socket) => {
    sessionNamespace({db, socket, io, rooms, users});
  });

  io.of('/settings').on('connection', (socket) => {
    settingsNamespace({db, socket, io, rooms, users});
  });
  
  http.listen(4000, () => {
    console.log('listening on http://localhost:4000');
  });
}
start();