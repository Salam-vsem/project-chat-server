import { randomBytes } from 'mz/crypto';
import * as multer from 'multer';
import { Router, ErrorRequestHandler } from 'express';
import { imagePath, imageFolder } from '../../pathes';

export const imagesRouter = Router();

const storage = multer.diskStorage({
  destination: imageFolder,
  filename: async (req, file, cb) => {
    const name = (await randomBytes(8)).toString('hex');
    const extension = file.originalname.match(/(?<extention>\.\w+)$/)?.groups?.extention ?? '';
    return cb(null, name + extension);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5242880
  }
});

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  res.sendStatus(500);
}

imagesRouter.use(errorHandler);

imagesRouter.post('/', upload.array('files[]'), async (req, res) => {
  const files = req.files as Express.Multer.File[]
  const fileNames = files.map(file => imagePath + file.filename);
  console.log(req.files as Express.Multer.File[]);
  res.json(fileNames);
});