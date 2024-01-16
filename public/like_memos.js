async function loadMemo() {
	const res = await fetch('/like_memo')

	const liked_memos = await res.json()
	console.log(liked_memos)

	const likedMemoContainer = document.querySelector('#likedMemos')
	for (let likeMemo of liked_memos) {
    likedMemoContainer.innerHTML += `<div class="memo" id=${likeMemo.id}>
        <input type="text" id=data${likeMemo.id} data-id=${likeMemo.id} value=${likeMemo.content}>
        <span class="material-symbols-outlined" id="del" onclick="delFtn(event)">
          delete
        </span>
        <span class="material-symbols-outlined" id="favorite" onclick="favFtn(event)">
          favorite
        </span>
        <span class="material-symbols-outlined bi-pencil-square" id="edit" onclick="editFtn(event)">
          edit_square
        </span>
      </div>
    `
	}
}
window.onload = () => {
	loadMemo()
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
	console.log('fav' + e.target.parentElement.id)
}

const editFtn = async (e) => {
	const newMemoValue = document.querySelector(
		`#data${e.target.parentElement.id}`
	)
	const id = e.target.parentElement.id
	const content = newMemoValue.value

	await fetch(`/memo${e.target.parentElement.id}`, {
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