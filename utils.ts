import IncomingForm from 'formidable/Formidable';
import { Request } from 'express';
import {Fields, Files} from 'formidable';


export function parse(form: IncomingForm, req: Request) {
  return new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
    form.parse(req, async (err, fields, files) => {
      if (err) {
        reject(err)
      } else {
        resolve({ fields, files })
      }
    })
  })
}