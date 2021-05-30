import { randomBytes } from 'mz/crypto';
import * as multer from 'multer';
import { Router, ErrorRequestHandler } from 'express';
import { imagePath, imageFolder, documentsPath, documentsFolder } from '../../pathes';

export const documentsRouter = Router();

const storage = multer.diskStorage({
  destination: documentsFolder,
  filename: async (req, file, cb) => {
    const name = (await randomBytes(8)).toString('hex');
    const extension = file.originalname.match(/(?<extention>\.\w+)$/)?.groups?.extention ?? '';
    return cb(null, name + extension);
  }
});

const upload = multer({
  storage,
  // limits: {
  //   fileSize: 5242880
  // }
});

const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  res.sendStatus(500);
}

documentsRouter.use(errorHandler);

documentsRouter.post('/', upload.array('files[]'), async (req, res) => {
  const files = req.files as Express.Multer.File[]
  const documents = files.map(file => JSON.stringify(
    {
      path: documentsPath + file.filename,
      name: file.originalname,
      extension: file.originalname.match(/\.(?<extention>\w+)$/)?.groups?.extention ?? '',
      size: file.size,
    }
  ));
  console.log(req.files as Express.Multer.File[]);
  res.json(documents);
});