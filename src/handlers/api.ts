import * as express from 'express';
import { Router } from 'express';
import * as cookieParser from 'cookie-parser';

export const apiRouter = Router();
export const tokenCookieKey = 'token';

apiRouter.use(cookieParser());
apiRouter.use(express.json());
apiRouter.use(express.urlencoded({ extended: true }));

apiRouter.post('/token', (req, res) => {
  console.log('post /token');
  const token = req.body.token;
  if(token) {
    console.log('set token to: ', token)
    res.cookie(tokenCookieKey, token, {
      maxAge: 365 * 24 * 60 * 60 * 1000,
      httpOnly: true,
    });
    res.end();
  } else {
    res.clearCookie(tokenCookieKey);
    res.end();
  }
});
