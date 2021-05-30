import { randomBytes } from 'mz/crypto';
import * as multer from 'multer';
import { Router, ErrorRequestHandler } from 'express';
import * as Jimp from 'jimp';
import { avatarFolder, avatarPath } from '../../pathes';

export const avatarRouter = Router();

const storage = multer.diskStorage({
  destination: avatarFolder,
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

avatarRouter.use(errorHandler);

avatarRouter.post('/', upload.single('avatar'), async (req, res) => {
  console.log(req.file);
  const x = Number(req.body.x);
  const y = Number(req.body.y);
  const width = Number(req.body.width);

  console.log(x + ' ' + y + ' ' + width)

  const name = req.file.filename;
  const avatar = req.file.path;
  const avatarMin = req.file.path.replace(/(\.\w+)$/, '.min$1');

  const file = await Jimp.read(avatar);
  file
      .crop(x, y, width, width)
      .resize(140, 140) // resize
      // .quality(80) // set JPEG quality
      .write(avatarMin, () => {
        res.json({avatar: name, avatarMin: name.replace(/(\.\w+)$/, '.min$1')}); //!!! fix
      }); // save
});