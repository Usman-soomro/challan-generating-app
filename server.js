const express = require("express");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

const app = express();
const upload = multer({ dest: "uploads/" });
app.use(cors());
const port = 5000;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.post(
  "/api/upload-challan",
  upload.fields([
    { name: "challan", maxCount: 1 },
    { name: "receipt", maxCount: 1 },
  ]),
  (req, res) => {
    res.send({
      message: "Challan and receipt uploaded successfully",
      files: req.files,
    });
  }
);

app.post("/api/upload-receipt", upload.single("receipt"), (req, res) => {
  console.log(req.file);
  res
    .status(200)
    .json({ message: "Receipt uploaded successfully", file: req.file });
});

app.post("/generate-challan", (req, res) => {
  const {
    name,
    fathername,
    batchdepartmentrollno,
    cnic,
    optiontype,
    mobileno,
  } = req.body;

  const doc = new PDFDocument();
  const fileName = `challan-${Date.now()}.pdf`;
  const filePath = path.join(__dirname, "public", fileName);

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(12).text("BANK CHALLAN", 20, 20);
  doc.text(`Name: ${name}`, 20, 40);
  doc.text(`Father\'s Name: ${fathername}`, 20, 60);
  doc.text(`Batch/Department/Roll No: ${batchdepartmentrollno}`, 20, 80);
  doc.text(`CNIC: ${cnic}`, 20, 100);
  doc.text(`Option Type: ${optiontype}`, 20, 120);
  doc.text(`Mobile No: ${mobileno}`, 20, 140);

  doc.end();

  res.download(filePath, fileName, (err) => {
    if (err) {
      console.error("Error downloading file:", err);
      res.status(500).send("Error generating challan");
    }

    fs.unlink(filePath, (err) => {
      if (err) console.error("Error deleting file:", err);
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
