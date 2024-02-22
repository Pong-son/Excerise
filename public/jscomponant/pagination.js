const pagination = async (no_of_page) => {
  // for pagination
  let paginationController = document.querySelector('.pagination')
  let page_no = ''
  for(let i = 1;i <= no_of_page ;i++){
    page_no += `<li class="page-item"><a class="page-link" data-page=${i}>${i}</a></li>`
  }
  paginationController.innerHTML = `
  <li class="page-item">
  <a class="page-link" aria-label="Previous" data-pre>
      <span aria-hidden="true">&laquo;</span>
    </a>
  </li>
  ${page_no}
  <li class="page-item">
    <a class="page-link" aria-label="Next">
      <span aria-hidden="true">&raquo;</span>
    </a>
    </li>
  `
  
  // Add disabled code for the null value
  }

  export { pagination }