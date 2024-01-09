import express from 'express'
import { Request, Response } from 'express'
import path from 'path';
import expressSession from 'express-session'
import jsonfile from 'jsonfile'
import { parseForm } from './utils'

const app = express();

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
    counter?: number
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


app.post('/memo', async (req, res) => {
  console.log(req.body)
  let memoFile = await jsonfile.readFile("./memo.json");
  try {
    const { fields, files } = await parseForm(req)
    res.json({
      fields, // Your textual fields
      files, // Your file fields
    })
  } catch (err) {
    res.status(500)
    res.json({
      error: String(err),
    })
  }

  memoFile.push({Content:req.body.memoEntry})
  await jsonfile.writeFile(path.join(__dirname,"memo.json"),memoFile,{spaces:2});

  res.redirect('/')
})
app.post('/login', async (req, res) => {
  let userFile = await jsonfile.readFile("./user.json");
  console.log(req.body.userName+","+req.body.passWord)
  userFile.push({Username:req.body.userName,Password:req.body.passWord})
  await jsonfile.writeFile(path.join(__dirname,"user.json"),userFile,{spaces:2});
  
  res.redirect('/')
})

app.use(express.static('public'));

app.get('/', function (req: Request, res: Response) {
  res.sendFile(path.resolve('index.html'))
});

app.use((req, res) => {
  res.status(404)
  res.sendFile(path.resolve('public','404.html'))
})

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}/`)
});