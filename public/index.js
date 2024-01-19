const socket = io.connect();

socket.on("new-memo",(data)=>{
	// data has the content {msg:"Hello Client"}
	console.log(data)
	loadMemos()
})

document
	.querySelector('#memoForm')
	.addEventListener('submit', async (event) => {
		event.preventDefault() // To prevent the form from submitting synchronously
		const form = event.target
		const formData = new FormData(form)
		formData.append('memoEntry', form.memoEntry.value)
		if (form.chooseFile.files[0] !== undefined) {
			formData.append('image', form.chooseFile.files[0])
		}

		const res = await fetch('/memo', {
			method: 'POST',
			body: formData
		})

		const result = await res.json()
		console.log(result)

		document.querySelector('#memoEntry').value = 'Enter Text'
		document.querySelector('#chooseFile').value = ''

		const memosContainer = document.querySelector('#mainWall')
		memosContainer.innerHTML = ''

		loadMemos()
	})

document
	.querySelector('#regisForm')
	.addEventListener('submit', async (event) => {
		event.preventDefault() // To prevent the form from submitting synchronously
		const form = event.target
		console.log(form)
		let rUserName = form.rUserName.value
		let rPassWord = form.rPassWord.value
		let cfmRPassWord = form.cfmRPassWord.value

		console.log(rUserName,rPassWord,cfmRPassWord)

		if(rPassWord !== cfmRPassWord) {
			document.querySelector('#regWarn').innerHTML = "Two password are not match!"
			return
		}
		const res = await fetch('/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: rUserName,
				password: rPassWord
			})
		})

		const result = await res.json()
		console.log(result)

		document.querySelector('#rUserName').value = ''
		document.querySelector('#rPassWord').value = ''
		document.querySelector('#cfmRPassWord').value = ''

		// window.location = '/admin.html'
	})

document
	.querySelector('#loginForm')
	.addEventListener('submit', async (event) => {
		event.preventDefault() // To prevent the form from submitting synchronously
		const form = event.target
		let userName = form.userName.value
		let passWord = form.passWord.value

		const res = await fetch('/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				username: userName,
				password: passWord
			})
		})
		console.log("test")
		const result = await res.json()
		console.log(result)

		document.querySelector('#userName').value = ''
		document.querySelector('#passWord').value = ''

		window.location = '/admin'
	})

async function loadMemos() {
	const res = await fetch('/memo') // Fetch from the correct url
	const memos = await res.json()
	const memosContainer = document.querySelector('#mainWall')
	if (memos.length !== 0){
		try {
			for (let memo of memos) {
				memosContainer.innerHTML += `<div class="memo" id=${memo.id}>
						<input type="text" id=data${memo.id} data-id=${memo.id} value=${memo.content}>
						<span class="material-symbols-outlined" id="del">
							delete
						</span>
						<span class="material-symbols-outlined" id="favorite">
							favorite
						</span>
						<span class="material-symbols-outlined bi-pencil-square" id="edit">
							edit_square
						</span>
					</div>
				`
			}
			document.querySelectorAll('#del').forEach(item => item.onclick = delFtn)
			document.querySelectorAll('#favorite').forEach(item => item.onclick = favFtn)
			document.querySelectorAll('#edit').forEach(item => item.onclick = editFtn)
		} catch (e) {
			console.log(e)
		}
	}
}

const delFtn = async (e) => {
	await fetch(`/memo${e.target.parentElement.id}`, {
		method: 'DELETE'
	})

	const memosContainer = document.querySelector('#mainWall')
	memosContainer.innerHTML = ''

	loadMemos()
}
const favFtn = async (e) => {
	await fetch('/like_memo', {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			id: e.target.parentElement.id,
		})
	})


}
const editFtn = async (e) => {
	const newMemoValue = document.querySelector(
		`#data${e.target.parentElement.id}`
	)
	const id = e.target.parentElement.id
	const content = newMemoValue.value

	console.log(id, content)
	await fetch(`/memo:${id}`, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			id: id,
			content: content
		})
	})
	const memosContainer = document.querySelector('#mainWall')
	memosContainer.innerHTML = ''
	loadMemos()
}

window.onload = () => {
	loadMemos()
}

const toRegForm = () => {
	document.querySelector('#loginForm').classList.add('hide')
	document.querySelector('#regisForm').classList.remove('hide')
}

const toLoginForm = () => {
	document.querySelector('#loginForm').classList.remove('hide')
	document.querySelector('#regisForm').classList.add('hide')
}

document.querySelector('#test').addEventListener('click',()=>{
	document.querySelector('#testArea').innerHTML += '<div id="test" onclick=test()>test</div>'
})

const test = () => {
	console.log("test")
}