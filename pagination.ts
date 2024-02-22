type dataType = {
  no_of_page:number;
  limit:number;
  current_page:number;
  previous?:number|null;
  next?:number|null;
  data:any[]
};

let datas:dataType = {
  no_of_page:1,
  limit:5,
  current_page:1,
  data:[]
}

const pagination =  (data:any[],page:number,limit:number):dataType => {
  datas.no_of_page = (data.length === 0?1:Math.ceil(data.length/limit))
  datas.limit = limit,
  datas.current_page = page,
  datas.previous = (datas.current_page > 1? page -1:null),
  datas.next = (datas.current_page < datas.no_of_page? page +1:null),
  datas.data = data

  return datas
}

export { pagination }