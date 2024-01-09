import express from 'express'
import { Request, Response } from 'express'
import path from 'path';
import expressSession from 'express-session'
import jsonfile from 'jsonfile'
import { parse } from './utils'
import formidable from 'formidable';

const app = express();

let counter = 0

const form = formidable({
  uploadDir:'./public/uploads',
  keepExtensions: true,
  maxFiles: 1,
  maxFileSize: 200 * 1024, // the default limit is 200KB
  filter: part => part.mimetype?.startsWith('image/') || false,
  filename: (originalName, originalExt, part, form) => {
    let fieldName = part.name
    let timestamp = Date.now()
    let ext = part.mimetype?.split('/').pop()
    counter++
    return `${fieldName}-${timestamp}-${counter}.${ext}`
  },
})

app.use(express.urlencoded({ extended: true }))

app.use(express.json())

const PORT = 8080;

app.use(
  expressSession({
    secret: 'Tecky Academy teaches typescript',
    resave: true,
    saveUninitialized: true,
  }),
  )
  
declare module 'express-session' {
  interface SessionData {
    counter?: number,
    user?:string
  }
}

app.use((req, res, next) => {
  if(req.session.counter) {
    req.session.counter++
  } else {
    req.session.counter = 1
  }
  console.log(req.session)
  const date = new Date()
  console.log(`[${date.toDateString()}] Request ${req.path}`)
  next()
}) 

interface memoRecord {
  content:string|string[],
  image?:string
}

app.post('/memo', async (req, res) => {
  const { fields, files } = await parse(form, req)
  fields
  console.log(files.originalFilename)
  let memoFile:memoRecord[] = await jsonfile.readFile("./memo.json");
  memoFile.push({
    content: fields.memoEntry,
    image: (files.chooseFile as formidable.File).newFilename
  })
  await jsonfile.writeFile(path.join(__dirname,"memo.json"),memoFile,{spaces:2});
  res.redirect('/')
})

interface User {
  username:string,
  password:string
}

app.post('/login', async (req, res) => {
  let userFile:[] = await jsonfile.readFile("./user.json");
  // userFile.push({Username:req.body.userName,Password:req.body.passWord})
  userFile.map((user:User) =>{
    if(user.username === req.body.userName && user.password === req.body.passWord) {
      req.session.user = req.body.userName
    }
  })
  if(!req.session.user){
    res.redirect('/')
  } else {
    res.sendFile(path.resolve('public','admin.html'))
  }  
})

app.use(express.static('public'));

app.get('/', function (req: Request, res: Response) {
  res.sendFile(path.resolve('index.html'))
});

app.get('/memo', async (req, res) => {
  let memoFile = await jsonfile.readFile("./memo.json");
  res.json(memoFile)
})

app.post('/', (req,res) => {
  res.sendFile(path.resolve('public','index.html'))
})

const isLoggedIn = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => {
  if (req.session?.user) {
    next()
  } else {
    res.redirect('./')
  }
}

app.use(isLoggedIn, express.static('protected'))

app.use((req, res) => {
  res.status(404)
  res.sendFile(path.resolve('public','404.html'))
})

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}/`)
});