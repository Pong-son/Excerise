import express from 'express';
import http from 'http';
import { Request, Response } from 'express';
import path from 'path';
import expressSession from 'express-session';
import jsonfile from 'jsonfile';
import { memoRoutes } from './routes/memoRoute';
import { loginRoutes } from './routes/loginRoute';
import { logoutRoutes } from './routes/logoutRoute';
import { registerRoutes } from './routes/registerRoute';
import { equipmentRoutes } from './routes/equipmentRoute';
import { calPeriodRoutes } from './routes/calPeriodRoutes';
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

app.use(express.static('public'))

app.use('/', loginRoutes)

app.use('/', logoutRoutes)

app.use('/', registerRoutes)

app.use('/', equipmentRoutes)

app.use('/', calPeriodRoutes)

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

app.get('/equipment', (req: Request, res: Response) => {
	res.sendFile(path.resolve('public/protected', 'equipment.html'))
})

app.get('/cal_period', (req: Request, res: Response) => {
	res.sendFile(path.resolve('public/protected', 'cal_period.html'))
})

// app.get('/admin', (req: Request, res: Response) => {
// 	res.sendFile(path.resolve('public/protected', 'admin.html'))
// })

// app.get('/admin', (req: Request, res: Response) => {
// 	res.sendFile(path.resolve('public/protected', 'admin.html'))
// })

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