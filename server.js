const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse");

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

// Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage: storage });

// Order storage
let orders = [];
let orderCounter = 1;

// Function to get PDF page count
async function getPdfPages(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdfParse(dataBuffer);
        return data.numpages;
    } catch (error) {
        return 1;
    }
}

// 📥 Student place order
app.post("/upload", upload.single("file"), async (req, res) => {
    try {
        const file = req.file;
        const copies = parseInt(req.body.copies);
        const color = req.body.color;
        const sides = req.body.sides;

        let pages = 1;

        if (file.mimetype === "application/pdf") {
            pages = await getPdfPages(file.path);
        }

        const order = {
            id: orderCounter++,
            fileName: file.originalname,
            filePath: file.path,
            copies: copies,
            pages: pages,
            color: color,
            sides: sides,
            status: "Pending"
        };

        orders.push(order);

        res.json({
            message: "Order placed successfully",
            order: order
        });

    } catch (error) {
        res.status(500).json({ error: "Upload failed" });
    }
});

// 📋 Admin view orders
app.get("/orders", (req, res) => {
    res.json(orders);
});

// 🖨️ Mark ready to collect
app.post("/complete/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const order = orders.find(o => o.id === id);

    if (order) {
        order.status = "Ready to Collect";
        res.json({ message: "Order completed" });
    } else {
        res.status(404).json({ message: "Order not found" });
    }
});

// 🗑️ Delete order
app.delete("/delete/:id", (req, res) => {
    const id = parseInt(req.params.id);
    orders = orders.filter(o => o.id !== id);
    res.json({ message: "Order deleted" });
});

// 🌍 Run server (important for ngrok)
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});