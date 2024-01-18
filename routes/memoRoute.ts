import express from 'express'
import path from 'path'
import jsonfile from 'jsonfile'
import { parse } from '../utils'
import formidable from 'formidable'
import { client } from '../index';


const memoRoutes = express.Router()

interface memoRecord {
	id: string
	content: string | string[]
	image?: string
}

let counter = 0

const form = formidable({
	uploadDir: './public/uploads',
	keepExtensions: true,
	maxFiles: 1,
	maxFileSize: 200 * 1024, // the default limit is 200KB
	filter: (part) => part.mimetype?.startsWith('image/') || false,
	filename: (originalName, originalExt, part, form) => {
		let fieldName = part.name
		let timestamp = Date.now()
		let ext = part.mimetype?.split('/').pop()
		counter++
		return `${fieldName}-${timestamp}-${counter}.${ext}`
	}
})

const getMemos = async (req: express.Request, res: express.Response) => {
	try {
		let memoList:any = []
		memoList = await client.query(
			'select * from memos'
		)
		if (memoList.rows.length === 0) {
			res.json([])
		} else {
			res.json(memoList.rows)
		}
	} catch (err) {
		console.log(err)
		res.json([])
	}
	// let memoFile = await jsonfile.readFile('./memo.json')
}

const postMemos = async (req: express.Request, res: express.Response) => {
	const { fields, files } = await parse(form, req)
	fields
	// let memoFile: memoRecord[] = await jsonfile.readFile('./memo.json')
	try {
		let memoList:any = []
		memoList
		if (files.chooseFile === undefined) {
			memoList = await client.query(
				'INSERT INTO memos (content) values ($1)',
					[fields.memoEntry]
			)
		} else {
			memoList = await client.query(
				'INSERT INTO memos (content,image) values ($1,$2)',
					[fields.memoEntry,(files.chooseFile as formidable.File).newFilename]
			)
		}
	} catch (err) {
		console.log(err)
	}
	res.json({ fields, files })
}

const delMemos = async (req: express.Request, res: express.Response) => {
	const memoFile: memoRecord[] = await jsonfile.readFile('./memo.json')

	const newMemoFile: memoRecord[] = []

	memoFile.forEach((memo) => {
		if (memo.id !== req.params.id) {
			newMemoFile.push(memo)
		}
	})
	await jsonfile.writeFile(path.join(__dirname, '../memo.json'), newMemoFile, {
		spaces: 2
	})
	// res.redirect('/')
	res.json('Deleted')
}

const putMemos = async (req: express.Request, res: express.Response) => {
	const memoFile: memoRecord[] = await jsonfile.readFile('./memo.json')

	const newMemoFile: memoRecord[] = []

	let currentImage:string = ''
	
	memoFile.forEach(memo => {
		if(memo.id === req.body.id && memo.image) {
			currentImage = memo.image
		}
	})

	let newMemo: memoRecord

	if(currentImage) {
		newMemo = {
			id: req.body.id,
			content: req.body.content,
			image: currentImage
		} 
	} else {
		newMemo = {
			id: req.body.id,
			content: req.body.content
		}
	}

	memoFile.forEach((memo) => {
		if (memo.id !== req.params.id) {
			newMemoFile.push(memo)
		} else {
			newMemoFile.push(newMemo)
		}
	})
	await jsonfile.writeFile(path.join(__dirname, '../memo.json'), newMemoFile, {
		spaces: 2
	})
	// res.redirect('/')
	res.json('Edited')
}

memoRoutes.get('/memo', getMemos)
memoRoutes.post('/memo', postMemos)
memoRoutes.delete('/memo:id', delMemos)
memoRoutes.put('/memo:id', putMemos)
// memoRoutes.get('/like_memos',likeMemos);

export { memoRoutes, getMemos, postMemos, delMemos, putMemos }
