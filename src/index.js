import dotenv from "dotenv";
import connectDB from "./db/index.js"
import { app } from './app.js'

dotenv.config({
    path: './.env'
})

const PORT = process.env.PORT || 8000;

connectDB()
    .then(() => {
        app.on("error", (error) => {
            console.error(error)
            throw error
        })
    })
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running at PORT: ${PORT}`)
        })
    })
    .catch((error) => {
        console.error("DB Connection Failed: ", error)
    })
