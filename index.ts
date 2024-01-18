import express from 'express';
import { Request, Response } from 'express';
import path from 'path';
import expressSession from 'express-session';
import jsonfile from 'jsonfile';
import { memoRoutes } from './routes/memoRoute';
import { Client } from 'pg';
import dotenv from 'dotenv';
// import XLSX from 'xlsx';

dotenv.config();

export const client = new Client({
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
});

client.connect()
// async function register(user: User) {
// 	const workbook = await XLSX.readFile('./WSP009.xlsx',{})
// 	const usersWorkSheet = await workbook.Sheets["user"]
// 	const usersData:userData[] = await XLSX.utils.sheet_to_json(usersWorkSheet)

// 	console.log(usersData)
//   await client.connect()

// 	try {
// 		for (const userData of usersData) {
// 			await client.query(
// 				'INSERT INTO users (username,password) values ($1,$2)',
// 				[userData.username,userData.password]
// 			)
// 		}
// 		await client.query(
// 			'INSERT INTO users (username,password) values ($1,$2)',
// 			[user.username,user.password]
// 		)
// 		await client.end() // close connection with the database
// 	} catch (e) {
// 		console.log(e)
// 	}
// }
// register()
const app = express()

app.use(express.urlencoded({ extended: true }))

app.use(express.json())

const PORT = 8080

app.use(
	expressSession({
		secret: 'Tecky Academy teaches typescript',
		resave: true,
		saveUninitialized: true
	})
)

declare module 'express-session' {
	interface SessionData {
		counter?: number
		user?: string
	}
}

app.use((req, res, next) => {
	if (req.session.counter) {
		req.session.counter++
	} else {
		req.session.counter = 1
	}
	console.log(req.session)
	const date = new Date()
	console.log(`[${date.toDateString()}] Request ${req.path}`)
	next()
})

interface User {
	username: string
	password: string
}
// interface userData {
// 	username: string
// 	password: string
// }

// interface memoRecord {
// 	content: string | string[]
// 	image?: string
// }

// interface likeMemoRecord {
// 	userId: string
// 	postId: number[]|[]
// }

app.post('/login', async (req, res) => {
	let userFile: [] = await jsonfile.readFile('./user.json')
	userFile.map((user: User) => {
		if (
			user.username === req.body.username &&
			user.password === req.body.password
		) {
			console.log("success")
			req.session.user = req.body.username
		}
	})
	console.log(req.session.user)
	if (!req.session.user) {
		res.json('fail')
	} else {
		res.json('done')
	}
})

app.post('/register', async (req, res) => {
	let userNameValid:boolean = true
	// let userFile: User[] = await jsonfile.readFile('./user.json')
	let userList:any = []
	try {
		userList = await client.query(
			'select * from users'
		)
		console.log(userList.rows)
		console.log(userList.rows.length)
		console.log(userList.rows.length !== 0)

		if(userList.rows.length !== 0) {
			userList.rows.map((user: User) => {
				if (user.username === req.body.username) {
					userNameValid = false
					res.json("Name Has Been Used")
				}
			})
		}
		// userFile.map((user: User) => {
			// 	if (user.username === req.body.username) {
				// 		userNameValid = false
				// 		res.json("Name Has Been Used")
				// 	}
				// })
		if(req.body.username.length < 4) {
			userNameValid = false
			res.json("Name should not shorter than 4")
		}
		if(userNameValid) {
			const newUser: User = {
				username: req.body.username as string,
				password: req.body.password as string,
			}
			
			await client.query(
				'INSERT INTO users (username,password,created_at) values ($1,$2,$3)',
				[newUser.username,newUser.password, new Date()]
			)
		}
	} catch (e) {
		console.log(e)
	}
})

// async function test() {
// 	console.log('test')
// 	let result:any = []
// 	await client.connect()
// 	try {
// 		result = await client.query(
// 			'select * from users'
// 		)
// 		console.log(result.rows)
// 		await client.end() // close connection with the database
// 	} catch (e) {
// 		console.log(e)
// 	}
// }

// test()

app.use(express.static('public'))

app.use('/', memoRoutes)

app.get('/', function (req: Request, res: Response) {
	res.sendFile(path.resolve('index.html'))
})

app.post('/', (req, res) => {
	res.sendFile(path.resolve('public', 'index.html'))
})


const isLoggedIn = (
	req: express.Request,
	res: express.Response,
	next: express.NextFunction
	) => {
		if (req.session?.user) {
			next()
	} else {
		console.log("fail")
		res.redirect('./')
	}
}

app.use(isLoggedIn, express.static('protected'))

app.get('/admin', (req: Request, res: Response) => {
	res.sendFile(path.resolve('public/protected', 'admin.html'))
})

app.get('/user', async (req: Request, res: Response) => {
	const likeMemos = await jsonfile.readFile('./user.json')
	res.json(likeMemos);
})

app.get('/like_memos', async (req: Request, res: Response) => {
	res.sendFile(path.resolve('public/protected', 'like_memos.html'))
})

// app.get('/like_memo', async (req: Request, res: Response) => {
// 	const userId = req.session.userId;
// 	const users:User[] = await jsonfile.readFile('./user.json')
// 	const memos:memoRecord[] = await jsonfile.readFile('./memo.json')
// 	console.log(userId)
// 	let likeMemoList:memoRecord[] = []
// 	users.forEach(user => {
// 		if(user.id === userId) {
// 			user.likedPost.forEach( memoId => {
// 				memos.forEach( memo => {
// 					if (memo.id === memoId) {
// 						likeMemoList.push(memo)
// 					}
// 				})
// 		})}
// 	})
// 	res.json(likeMemoList);
// })

app.use((req, res) => {
	res.status(404)
	res.sendFile(path.resolve('public', '404.html'))
})

app.listen(PORT, () => {
	console.log(`Listening at http://localhost:${PORT}/`)
})