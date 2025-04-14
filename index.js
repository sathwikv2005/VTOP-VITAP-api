import dotenv from 'dotenv'
import express from 'express'
import apiRoute from './routes/api.js'

dotenv.config()

const port = process.env.PORT || 6700
const app = express()

app.use('/api', apiRoute)

app.listen(port, () => {
	console.log(`Server online at: http://127.0.0.1:${port}`)
})
