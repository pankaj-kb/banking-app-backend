import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "20kb" }))
app.use(express.urlencoded({ extended: true, limit: "20kb" }))
app.use(express.static("public"))
app.use(cookieParser())

app.get("/", (req, res) => {
    res.send("<h1>Server Running/Live</h1>")
})

import customerRouter from "./routes/customer.routes.js"
import BankerRouter from "./routes/banker.routes.js"
import TransactionRouter from "./routes/transaction.routes.js"

app.use('/api/v1/customer', customerRouter)
app.use('/api/v1/banker', BankerRouter)
app.use("/api/v1/transaction", TransactionRouter)

export { app }