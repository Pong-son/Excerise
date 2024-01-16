import express from 'express'
import path from 'path'
import jsonfile from 'jsonfile'
import { parse } from '../utils'
import formidable from 'formidable'

const memoRoutes = express.Router()

interface memoRecord {
	id: string
	content: string | string[]
	image?: string
	likeCount: number
	likePerson:string[]
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
	let memoFile = await jsonfile.readFile('./memo.json')
	res.json(memoFile)
}

const postMemos = async (req: express.Request, res: express.Response) => {
	const { fields, files } = await parse(form, req)
	fields
	let memoFile: memoRecord[] = await jsonfile.readFile('./memo.json')

	const memoId: number = memoFile.length === 0 ? 0 : Number(memoFile.slice(-1)[0].id)

	if (files.chooseFile === undefined) {
		memoFile.push({
			id: (memoId + 1).toString(),
			content: fields.memoEntry,
			likeCount: 0,
			likePerson:[]
		})
	} else {
		memoFile.push({
			id: (memoId + 1).toString(),
			content: fields.memoEntry,
			image: (files.chooseFile as formidable.File).newFilename,
			likeCount: 0,
			likePerson:[]
		})
	}

	await jsonfile.writeFile(path.join(__dirname, '../memo.json'), memoFile, {
		spaces: 2
	})
	// res.redirect('/')
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

	let currentLikeCount:number = 0
	let currentLikePerson:string[] = []
	let currentImage:string = ''
	
	memoFile.forEach(memo => {
		if(memo.id === req.body.id && memo.image) {
			currentLikeCount = memo.likeCount
			currentLikePerson = memo.likePerson
			currentImage = memo.image
		} else {
			if(memo.id === req.body.id && memo.image) {
				currentLikeCount = memo.likeCount
				currentLikePerson = memo.likePerson
			}
		}
	})

	let newMemo: memoRecord

	if(currentImage) {
		newMemo = {
			id: req.body.id,
			content: req.body.content,
			image: currentImage,
			likeCount: currentLikeCount,
			likePerson:currentLikePerson
		} 
	} else {
		newMemo = {
			id: req.body.id,
			content: req.body.content,
			likeCount: currentLikeCount,
			likePerson:currentLikePerson
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
