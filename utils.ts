import IncomingForm from 'formidable/Formidable'
import express from 'express'
import { Fields, Files } from 'formidable'

export function parse(form: IncomingForm, req: express.Request) {
	return new Promise<{ fields: Fields; files: Files }>((resolve, reject) => {
		form.parse(req, (err, fields, files) => {
			if (err) {
				reject(err)
			} else {
				resolve({ fields, files })
			}
		})
	})
}
