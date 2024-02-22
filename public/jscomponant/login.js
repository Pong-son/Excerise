let login;
let loginName = window.sessionStorage.getItem('username');
loginName?login = true: login = false;

// let getLoginName = () => {
// 	return
// }

document.querySelector('#loginBtn').addEventListener('click', async () => {
	if(login) {
		const res = await fetch('/logout')
		login = false
		window.sessionStorage.clear()
		checkLogin()
	}
})

// move to admin page
// document
// 	.querySelector('#regisForm')
// 	.addEventListener('submit', async (event) => {
// 		event.preventDefault() // To prevent the form from submitting synchronously
// 		const form = event.target
// 		console.log(form)
// 		let rUserName = form.rUserName.value
// 		let rPassWord = form.rPassWord.value
// 		let cfmRPassWord = form.cfmRPassWord.value

// 		if(rPassWord !== cfmRPassWord) {
// 			document.querySelector('#regWarn').innerHTML = "Two password are not match!"
// 			return
// 		}
// 		const res = await fetch('/register', {
// 			method: 'POST',
// 			headers: {
// 				'Content-Type': 'application/json'
// 			},
// 			body: JSON.stringify({
// 				username: rUserName,
// 				password: rPassWord
// 			})
// 		})
// 		const result = await res.json()
// 		console.log(result)

// 		document.querySelector('#rUserName').value = ''
// 		document.querySelector('#rPassWord').value = ''
// 		document.querySelector('#cfmRPassWord').value = ''

// 		// window.location = '/admin.html'
// 	})

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
		const result = await res.json()
		if (result === 'done') {
			window.sessionStorage.setItem('username',userName)
			login = true
		}
		document.querySelector('#userName').value = ''
		document.querySelector('#passWord').value = ''
		checkLogin()
	})

const checkLogin = () => {
  if(login){
		document.querySelector('#loginBtn').textContent = "Logout"
		document.querySelector('#loginBtn').removeAttribute('data-bs-toggle')
		// document.querySelector('#loginForm').classList.add('hide')
	} else {
		document.querySelector('#loginBtn').textContent = "Login"
		document.querySelector('#loginBtn').setAttribute('data-bs-toggle',"modal")
		// document.querySelector('#loginForm').classList.remove('hide')
	}
}

export { checkLogin, loginName }