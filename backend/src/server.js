import express from 'express'

const app = express();

const PORT = 5001;
const server = app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})