import { randomBytes } from 'mz/crypto';
import * as multer from 'multer';
import { Router, ErrorRequestHandler } from 'express';
import { videoFolder, videoPath } from '../../pathes';

export const videoRouter = Router();

const storage = multer.diskStorage({
  destination: videoFolder,
  filename: async (req, file, cb) => {
    const name = (await randomBytes(8)).toString('hex');
    const extension = file.originalname.match(/(?<extention>\.\w+)$/)?.groups?.extention ?? '';
    return cb(null, name + extension);
  }
});

const upload = multer({
  storage,
  // limits: {
  //   // fileSize: 5242880
  // }
});

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  res.sendStatus(500);
}

videoRouter.use(errorHandler);

videoRouter.post('/', upload.array('files[]'), async (req, res) => {
  const files = req.files as Express.Multer.File[]
  console.log(files[0])
  res.json([videoPath + files[0].filename]);
});