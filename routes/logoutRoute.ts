import express from 'express';

const logoutRoutes = express.Router()

const getLogout =  async (req: express.Request, res: express.Response) => {
	try {
    if(req.session) {
      req.session.user = undefined
      req.session.userId = undefined
    }
		res.redirect('./')
	} catch (e) {
		console.log(e)
	}
}


logoutRoutes.get('/logout', getLogout)

export { logoutRoutes, getLogout }