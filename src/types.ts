import { NextFunction, Request, Response } from "express";
import * as Socket from 'socket.io';
import { Database } from "./db/Database";

export interface Theme {
  color: string;
  fontScale: number;
  borderRadius: number;
  blockMessages: boolean;
}

export interface UserInfo {
  id: number;
  isAdmin: boolean;
  login: string;
  roomId?: number;
  avatar?: string;
  avatarMin?: string;
  connections: number;
  theme: Theme;
}

export interface AuthData {
  user: UserInfo;
  rooms: Rooms;
}

export interface MessageProps {
  type: MessageType;
  id: number;
  userId: number;
  userLogin: string;
  date: number;
  content: string;
  userAvatarMin?: string;
  // eventType?: RoomEvent;
}

export interface HandlersProps {
  req: Request;
  res: Response;
}

export interface LoginProps {
  login: string;
  password: string;
}

export interface ResProps {
  user: UserInfo;
  token: string;
}

// export interface RoomDescription {
//   id: number;
//   name: string;
//   usersAmount: number;
// }

export interface SocketSession {
  user: UserInfo;
  token: string;
}

export interface RoomProps extends RoomCache {
  // id: number;
  users: UserCache[];
  messages: MessageProps[];
}

export interface CreateRoomProps {
  name: string;
  description?: string;
  avatar?: string;
}

export enum MessageType {
  text = 'text',
  img = 'img',
  video = 'video',
  doc = 'doc',
  audio = 'audio',
  room_created = 'room_created',
  // roomEvent,
}

export enum RoomEvent {
  join = 'join',
  leave = 'leave',
}

// const rooms = {
//   ['room1']: {
//     // LEFT MENU
//     messagesCount: 10, // all messages in room // new message -> ++
//     usersCount: 2, // join new user -> ++, leave user completely -> --

//     // ROOM
//     users: {
//       ['user1']: {connections: 1, avatar: ''}, // ++ -- not new user
//       ['user2']: {connections: 3, avatar: ''},
//     },
//   },
// }

export type Rooms = Record<string, RoomCache>;
export type Users = Record<string, UserCache[]>

export interface RoomCache {
  id: number;
  name: string;
  description?: string;
  avatarMin?: string;
  usersAmount: number;
  messagesCount: number;
}

export interface UserCache {
  id: number;
  name: string;
  avatar?: string;
  connections: number;
}

export interface SocketConnection {
  db: Database;
  io: Socket.Server;
  socket: Socket.Socket;
  rooms: Rooms;
  users: Users;
}