import * as fs from 'mz/fs';
import { publicFolder } from "../pathes";
import { MessageProps, MessageType } from "../types";

export const deleteFilesMessages = async (messages: MessageProps[]) => {
  messages.forEach(async message => {
    if(message.type === MessageType.text) {
      return;
    }
    let path = '';
    if(message.type === MessageType.doc) {
      path = publicFolder + JSON.parse(message.content).path
    }
    else {
      path = publicFolder + message.content
    }
    try {
      await fs.unlink(path);
    }catch(e) {
      return console.log('delete file error:\n', e.message)
    }
  })
}