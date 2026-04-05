const express = require("express")
const multer = require("multer")
const path = require("path")

const app = express()

const storage = multer.diskStorage({
    destination: "./uploads",
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
})

const upload = multer({ storage: storage })

app.use(express.static("public"))
app.use(express.json())

let orders = []

app.post("/upload", upload.single("file"), (req, res) => {

    let order = {
        file: req.file.filename,
        copies: req.body.copies,
        color: req.body.color,
        side: req.body.side
    }

    orders.push(order)

    res.json({
        message: "Order placed successfully"
    })
})

app.get("/orders", (req, res) => {
    res.json(orders)
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log("Server running on port", PORT)
})