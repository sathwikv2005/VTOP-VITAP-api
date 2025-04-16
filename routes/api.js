import express from 'express'
import { getCaptcha, vtopLogin } from '../requestHandlers/login.js'
import { getSemIds } from '../requestHandlers/getSemIds.js'

const router = express.Router()

router.get('/getcaptcha', getCaptcha)

router.get('/login', vtopLogin)

router.get('/semids', getSemIds)
//TODO: Timetable

//TODO: Attendance

export default router
