import { Request, Response, NextFunction } from "express";
import { randomBytes } from 'crypto';
import {isString} from 'util';

export interface setTokenProps {
  req: Request;
  res: Response;
  next: NextFunction;
}

// export const setToken = (handlers: setTokenProps) => {
//   const {req, res, next} = handlers;
//   const token = req.cookies['token'];
//   console.log('get token: ', token);
//   if (isString(token)) {
//     req.token = token;
//     return next();
//   }
//   randomBytes(64, (error, buffer) => {
//     if (error) {
//       throw error;
//     }
//     const token = buffer.toString('base64');
//     console.log('set token: ', token);
//     res.cookie('token', token, {
//       // expires: 
//       maxAge: 5 * 365 * 24 * 60 * 60 * 1000,
//       httpOnly: true,
//       // secure: true,
//     });
//     req.token = token;
//     return next();
//   });
// }