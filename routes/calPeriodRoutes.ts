import express from 'express';
// import { parse } from '../utils';
// import formidable from 'formidable';
import { client } from '../index';
import { pagination } from '../pagination'


const calPeriodRoutes = express.Router()

// let counter = 0

// const form = formidable({
// 	uploadDir: './public/uploads',
// 	keepExtensions: true,
// 	maxFiles: 1,
// 	maxFileSize: 200 * 1024, // the default limit is 200KB
// 	filter: (part) => part.mimetype?.startsWith('image/') || false,
// 	filename: (originalName, originalExt, part, form) => {
// 		let fieldName = part.name
// 		let timestamp = Date.now()
// 		let ext = part.mimetype?.split('/').pop()
// 		counter++
// 		return `${fieldName}-${timestamp}-${counter}.${ext}`
// 	}
// })

const getCalPeriod = async (req: express.Request, res: express.Response) => {
	try {
		let data: any[]
		let page: number = req.query.page?Number(req.query.page):1
		let limit: number = req.query.limit?Number(req.query.limit):10
		let order_by:string = req.query.order_by?req.query.order_by.toString():'id'
		let order_by_ascending:string = req.query.order_by_ascending === 'true'?'':'DESC'
		let sort_by_item = req.query.sort_by_item?req.query.sort_by_item:''
		let sort_by = req.query.sort_by?req.query.sort_by:''

		let calPeriodList:any = []
		if (sort_by) {
			calPeriodList = await client.query(
				`select * from cal_period WHERE ${sort_by_item} like '%${sort_by}%' ORDER BY ${order_by} ${order_by_ascending}`
			)
		} else {
			calPeriodList = await client.query(
				`select * from cal_period ORDER BY ${order_by} ${order_by_ascending}`
			)
		}
		if (calPeriodList.rows.length === 0) {
			data = []
		} else {
			data = calPeriodList.rows
		}
		res.json(pagination(data,page,limit))
	} catch (err) {
		console.log(err)
		res.json([])
	}
}

const postCalPeriod = async (req: express.Request, res: express.Response) => {
	try {
    console.log(req.body, new Date)

		let calPeriodList:any = []
    calPeriodList
    calPeriodList = await client.query(
      'INSERT INTO cal_period (parameter,cal_period,created_at) values ($1,$2,$3)',
        [req.body.parameter,req.body.cal_period,new Date]
    )
	} catch (err) {
		console.log(err)
	}
	res.json({updated:1})
}

const delCalPeriod = async (req: express.Request, res: express.Response) => {
	try {
		await client.query(
			`delete from cal_period where id = ${req.params.id}`
		)
	} catch (err) {
		console.log(err)
	}
	res.json('Deleted')
}

const putCalPeriod = async (req: express.Request, res: express.Response) => {
	try {
		await client.query(
			'update cal_period set parameter = $1, cal_period = $2, updated_at = $3 where id = $4',
			[req.body.parameter,req.body.cal_period,new Date, req.body.id]
		)
	} catch (err) {
		console.log(err)
	}
	res.json('Edited')
}



calPeriodRoutes.get('/cal_period_list', getCalPeriod)
calPeriodRoutes.post('/cal_period_list', postCalPeriod)
calPeriodRoutes.delete('/cal_period_list:id', delCalPeriod)
calPeriodRoutes.put('/cal_period_list:id', putCalPeriod)

export { calPeriodRoutes, getCalPeriod, postCalPeriod, delCalPeriod, putCalPeriod }