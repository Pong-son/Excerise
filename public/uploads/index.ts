import express from 'express'
import { Request, Response } from 'express'
import path from 'path'
import expressSession from 'express-session'
import jsonfile from 'jsonfile'
import { memoRoutes } from './routes/memoRoute'

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
		userId?:string
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
	id: string
	username: string
	password: string
	likedPost: string[]
}

interface memoRecord {
	id: string
	content: string | string[]
	image?: string
	likeCount: number
	likePerson:string[]
}

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
			req.session.userId = user.id
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

	let userFile: User[] = await jsonfile.readFile('./user.json')
	// userFile.push({Username:req.body.userName,Password:req.body.passWord})
	const userId: number =
		userFile.length === 0 ? 1 : Number(userFile.slice(-1)[0].id)+1
	userFile.map((user: User) => {
		if (user.username === req.body.username) {
			userNameValid = false
			res.json("Name Has Been Used")
		}
	})
	if(req.body.username.length < 4) {
		userNameValid = false
		res.json("Name should not shorter than 4")
	}
	if(userNameValid) {
		const newUser: User = {
			id: userId.toString(),
			username: req.body.username as string,
			password: req.body.password as string,
			likedPost: []
		}
		userFile.push(newUser)
		await jsonfile.writeFile(path.join(__dirname, './user.json'), userFile, {
			spaces: 2
		})
	}
	// if (!req.session.user) {
	// 	res.redirect('/')
	// } else {
	// 	res.json('Success')
	// }
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

app.get('/like_memo', async (req: Request, res: Response) => {
	const userId = req.query.user_id;
	const users:User[] = await jsonfile.readFile('./user.json')
	const memos:memoRecord[] = await jsonfile.readFile('./memo.json')
	console.log(userId)
	let likeMemoList:memoRecord[] = []
	users.forEach(user => {
		if(user.id === userId) {
			user.likedPost.forEach( memoId => {
				memos.forEach( memo => {
					if (memo.id === memoId) {
						likeMemoList.push(memo)
					}
				})
		})}
	})
	res.json(likeMemoList);
})

app.use((req, res) => {
	res.status(404)
	res.sendFile(path.resolve('public', '404.html'))
})

app.listen(PORT, () => {
	console.log(`Listening at http://localhost:${PORT}/`)
})
