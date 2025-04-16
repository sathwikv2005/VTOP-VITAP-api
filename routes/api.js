import express from 'express'
import { getCaptcha, vtopLogin } from '../requestHandlers/login.js'

const router = express.Router()

router.get('/getcaptcha', getCaptcha)

router.get('/login', vtopLogin)

//TODO: Attendance

//TODO: Timetable

export default router
