import express from 'express';
import http from 'http';
import { Request, Response } from 'express';
import path from 'path';
import expressSession from 'express-session';
import jsonfile from 'jsonfile';
import { memoRoutes } from './routes/memoRoute';
import { Client } from 'pg';
import dotenv from 'dotenv';
import {Server as SocketIO} from 'socket.io';
// import XLSX from 'xlsx';

dotenv.config();

export const client = new Client({
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD
});

client.connect()

const app = express()
const server = new http.Server(app);
export const io = new SocketIO(server);

io.on('connection', function (socket) {
	socket;
});

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

const PORT = 8080;

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
		userId?:number
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
	id?:number
	username: string
	password: string
}

// interface memoRecord {
// 	content: string | string[]
// 	image?: string
// }

app.post('/login', async (req, res) => {
	let userList:any = []
	try {
		userList = await client.query(
			'select * from users'
		)

		if(userList.rows.length !== 0) {
			userList.rows.map((user: User) => {
				if (
					user.username === req.body.username &&
					user.password === req.body.password
				) {
					console.log("success")
					req.session.user = user.username
					user.id?req.session.userId = user.id: req.session.user
				}
			})
		}
		console.log(req.session.user)
		if (!req.session.user) {
			res.json('fail')
		} else {
			res.json('done')
		}
	} catch (e) {
		console.log(e)
	}
})

app.post('/register', async (req, res) => {
	let userNameValid:boolean = true
	let userList:any = []
	try {
		userList = await client.query(
			'select * from users'
		)

		if(userList.rows.length !== 0) {
			userList.rows.map((user: User) => {
				if (user.username === req.body.username) {
					userNameValid = false
					res.json("Name Has Been Used")
				}
			})
		}
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

app.put('/like_memo', async (req: express.Request, res: express.Response) => {
	console.log(req.session.userId)
	let userId = req.session.userId
	let memoId = req.body.id
	console.log(userId,memoId)
	try {
		await client.query(
			`INSERT INTO likes (user_id,memo_id) VALUES (${userId}, ${memoId});`
		)
		console.log("like")
	} catch (err) {
		err
	}
	res.json('Liked')
})

app.use((req, res) => {
	res.status(404)
	res.sendFile(path.resolve('public', '404.html'))
})

server.listen(PORT, () => {
	console.log(`Listening at http://localhost:${PORT}/`)
})