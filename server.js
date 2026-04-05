const express = require("express")
const multer = require("multer")
const cors = require("cors")
const fs = require("fs")

const app = express()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))
app.use("/uploads", express.static("uploads"))

const PORT = process.env.PORT || 3000

// create uploads folder if not exists
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads")
}

// create orders.json if not exists
if (!fs.existsSync("orders.json")) {
    fs.writeFileSync("orders.json", "[]")
}

// multer setup
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname)
    }
})

const upload = multer({ storage: storage })

// upload order
app.post("/upload", upload.single("file"), (req, res) => {

    const { copies, color, side } = req.body

    let orders = JSON.parse(fs.readFileSync("orders.json"))

    // serial order id
    const newOrder = {
        id: orders.length + 1,
        file: req.file.filename,
        copies,
        color,
        side,
        status: "Pending"
    }

    orders.push(newOrder)

    fs.writeFileSync("orders.json", JSON.stringify(orders, null, 2))

    res.json(newOrder)
})

// get all orders
app.get("/orders", (req, res) => {

    const orders = JSON.parse(fs.readFileSync("orders.json"))
    res.json(orders)

})

// update status
app.post("/update-status", (req, res) => {

    const { id, status } = req.body

    let orders = JSON.parse(fs.readFileSync("orders.json"))

    orders = orders.map(order => {

        if (order.id == id) {
            order.status = status
        }

        return order
    })

    fs.writeFileSync("orders.json", JSON.stringify(orders, null, 2))

    res.json({ success: true })
})

// start server
app.listen(PORT, () => {
    console.log("Server running on port " + PORT)
})