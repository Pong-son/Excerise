import { getData } from './get_data.js'
import { pagination } from './pagination.js'

let cal_period_table = document.querySelector('#cal_period_table')
let each_page_show = Number(document.querySelector('#each_page_show')?.value);
let current_page = 1;
let order_by = 'id';
let order_by_ascending = true;
let sort_by_item = '';
let sort_by = '';
let data = {};
let data_in_table = [];

// add new data
document
	.querySelector('#calPeriodForm')
	?.addEventListener('submit', async (event) => {
		event.preventDefault() // To prevent the form from submitting synchronously
		const form = event.target
		let parameter = form.parameter.value
		let calPeriod = form.calPeriod.value

		const res = await fetch('/cal_period_list', {
      method: 'POST',
			headers: {
        'Content-Type': 'application/json'
			},
			body: JSON.stringify({
        parameter: parameter,
				cal_period: calPeriod
			})
		})
		const result = await res.json()

		document.querySelector('#parameter').value = ''
		document.querySelector('#calPeriod').value = ''

  loadCalTable()
	});

const loadCalTable = async () => {
  try {
    data = await getData(`cal_period_list?page=${current_page}&limit=${each_page_show}&order_by=${order_by}&order_by_ascending=${order_by_ascending}&sort_by_item=${sort_by_item}&sort_by=${sort_by}`)
    console.log(data)
    let start = (current_page - 1) * each_page_show
    let end = start + each_page_show
    
    data_in_table = data.data?.slice(start, end)

    pagination(data.no_of_page)
    check_page_status(data)
    
    document.querySelector('[data-pre]')?.addEventListener('click',() => {
      current_page = current_page - 1
      loadCalTable()
    })
    document.querySelector('[aria-label="Next"]')?.addEventListener('click',() => {
      current_page = current_page + 1
      loadCalTable()
    })
    // generate table
    if(data.length === 0) {
      cal_period_table.innerHTML = ''
      cal_period_table.innerHTML = '<tr><th>No DATA</th></tr>'
    } else {
      cal_period_table.innerHTML = ''
      data_in_table.forEach( item => {
        cal_period_table.innerHTML += `<tr id=${item.id}><th scope="row">${item.id}</th>
        <td><input disabled type='text' data-param="${item.id}" value=${item.parameter}></td>
        <td><input disabled type='text' data-cal-period="${item.id}" value=${item.cal_period}></td>
        <td>
        <button data-edit="${item.id}">Edit</button>
        <button data-done="${item.id}" class="hide">Done</button>
        <button data-cancel="${item.id}" class="hide">Cancel</button>
        </td>
        <td>
        <button data-delete=${item.id}>Delete</button>
        </td>
        </tr>`
      })
    }
    // controller for the and delete btn
    document.querySelectorAll('[data-edit]')?.forEach(edit => {
      edit.addEventListener('click', (e) => {
        const target = e.target.getAttribute('data-edit')
        document.querySelector(`[data-param="${target}"]`).removeAttribute("disabled")
        document.querySelector(`[data-cal-period="${target}"]`).removeAttribute("disabled")
        document.querySelector(`[data-done="${target}"]`).classList.remove('hide')
        document.querySelector(`[data-cancel="${target}"]`).classList.remove('hide')
        document.querySelector(`[data-edit="${target}"]`).classList.add('hide')
      })
    })
    document.querySelectorAll('[data-delete]')?.forEach(del => {
      del.addEventListener('click', (e) => {
        delFtn(e)
      })
    })
    document.querySelectorAll('[data-done]')?.forEach(done => {
      done.addEventListener('click', (e) => {
        editFtn(e)
        const target = e.target.getAttribute('data-done')
        document.querySelector(`[data-param="${target}"]`).setAttribute("disabled","")
        document.querySelector(`[data-cal-period="${target}"]`).setAttribute("disabled","")
        document.querySelector(`[data-done="${target}"]`).classList.add('hide')
        document.querySelector(`[data-cancel="${target}"]`).classList.add('hide')
        document.querySelector(`[data-edit="${target}"]`).classList.remove('hide')
      })
    })
    document.querySelectorAll('[data-cancel]')?.forEach(cancel => {
      cancel.addEventListener('click', (e) => {
        const target = e.target.getAttribute('data-cancel')
        document.querySelector(`[data-param="${target}"]`).setAttribute("disabled","")
        document.querySelector(`[data-cal-period="${target}"]`).setAttribute("disabled","")
        document.querySelector(`[data-done="${target}"]`).classList.add('hide')
        document.querySelector(`[data-cancel="${target}"]`).classList.add('hide')
        document.querySelector(`[data-edit="${target}"]`).classList.remove('hide')
      })
    })
    document.querySelectorAll('[data-page]')?.forEach(page => {
      page.addEventListener('click',async e => {
        const page = e.target.getAttribute('data-page')
        current_page = page
        loadCalTable()
      })
    })

    // generate select content to search
    if(data.length !== 0) {
      let search_select = document.querySelector('#search_select')
      search_select.innerHTML = '<option selected>- Search By -</option>'
      let item = Object.keys(data.data[0])
      for(let i = 0; i < item.length -2; i++) {
        search_select.innerHTML += `<option value='${item[i]}'>${item[i]}</option>`
      }
    }
  } catch (e) {
    console.log(e)
  }
}

const delFtn = async (e) => {
  await fetch(`/cal_period_list:${e.target.getAttribute('data-delete')}`, {
    method: 'DELETE'
  })
  loadCalTable()
}

const editFtn = async (e) => {
  const currentTarget = e.target.getAttribute('data-done')
  
  const parameter = document.querySelector(`[data-param="${currentTarget}"]`).value
  const cal_period = document.querySelector(`[data-cal-period="${currentTarget}"]`).value
  await fetch(`/cal_period_list:${e.target.getAttribute('data-done')}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      id:currentTarget,
      parameter: parameter,
      cal_period: cal_period
    })
  })
}

document.querySelector('#each_page_show')?.addEventListener('input', () => {
  each_page_show = Number(document.querySelector('#each_page_show').value)
  document.querySelector('#each_page_show').blur()
  console.log(each_page_show)
  loadCalTable()
})

const check_page_status = (data) => {
  let pre_btn = document.querySelector('[aria-label="Previous"]')
  let next_btn = document.querySelector('[aria-label="Next"]')
  document.querySelector(`[data-page="${current_page}"]`)?.classList.add('disabled')
  data.current_page === 1?pre_btn.classList.add('disabled'):pre_btn.classList.remove('disabled')
  data.current_page === data.no_of_page?next_btn.classList.add('disabled'):next_btn.classList.remove('disabled')
}

document.querySelector('#search_select')?.addEventListener('change', () => {
  if(document.querySelector('#search_select').value === '- Search By -') {
    document.querySelector('#search_item').setAttribute('disabled','')
  } else {
    document.querySelector('#search_item').removeAttribute('disabled')
  }
})

document.querySelector('#search_item')?.addEventListener('input', () => {
  if(document.querySelector('#search_item').value !== '') {
    document.querySelector('#search_btn').removeAttribute('disabled')
  } else {
    document.querySelector('#search_btn').setAttribute('disabled','')
    sort_by = ''
    loadCalTable()
  }
})


document.querySelector('#search_btn')?.addEventListener('click', () => {
  let search_select = document.querySelector('#search_select').value
  let search_item = document.querySelector('#search_item').value
  sort_by_item = search_select
  sort_by = search_item
  
  loadCalTable()
})

document.querySelectorAll('[data-th]').forEach(title => {
  title.addEventListener('click',(e) => {
    if(order_by !== e.target.textContent) {
      order_by_ascending = true
    } else {
      order_by_ascending = !order_by_ascending
    }
    if(e.target.textContent === 'Calibration Period (in Month)') {
      order_by = 'cal_period'
    } else {
      order_by = e.target.textContent
    }
    console.log(order_by,order_by_ascending)
    loadCalTable()
  })
})
export { loadCalTable }
