const getData = async (title) => {
  try {
    let res
    res = await fetch(`./${title}`)
    // if(title === 'cal_period') {
    // } else if(title === ' equipment') {
    //   res = await fetch('./equipment_list')
    // }
    const result = await res.json()
    return result
  } catch (e) {
    console.log(e)
  }
}

export { 
  getData
 }