import express from 'express'
import { getCaptcha, vtopLogin } from '../requestHandlers/login.js'
import { getSemIds } from '../requestHandlers/getSemIds.js'
import { timeTable } from '../requestHandlers/timeTable.js'
import { getAttendance, getAttendanceByID } from '../requestHandlers/getAttendance.js'

const router = express.Router()

router.get('/getcaptcha', getCaptcha)
router.get('/login', vtopLogin)
router.get('/semids', getSemIds)
router.get('/timetable', timeTable)
router.get('/attendance', getAttendance)
router.get('/attendance/:courseID', getAttendanceByID)

export default router
