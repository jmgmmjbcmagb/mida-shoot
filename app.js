const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 3000;
const watermarkPath = path.join(__dirname, "public/watermark.png");
const printer = require('printer');
const printPath = path.join(__dirname, 'public', 'test.jpg');

const printers = printer.getPrinters();
console.log("Impresoras disponibles:", printers.map(p => p.name));

// Si conoces el nombre exacto de la impresora, puedes usarlo aquí
const myPrinter = printers[0].getDefaultPrinterName(); // o reemplaza con el nombre exacto

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

// Ruta para tomar una foto
app.get("/take-photo", (req, res) => {
  const now = new Date();
  const timestamp = now
    .toISOString()
    .replace(/T/, "-")
    .replace(/:/g, "")
    .replace(/\..+/, "");
  const filename = `foto-${timestamp}.jpg`;
  const fullPath = path.join(__dirname, "public/photos", filename);

  const takePhoto = `gphoto2 --capture-image-and-download --filename ${fullPath}`;

  exec(takePhoto, (err) => {
    if (err) {
      console.error("Error al tomar foto:", err);
      return res.status(500).send("Error al tomar foto.");
    }

    const aliasPath = path.join(__dirname, "public/foto.jpg");
    fs.copyFileSync(fullPath, aliasPath);

    console.log("Foto tomada:", filename);

    añadirMarcaAgua(
      aliasPath,
      path.join(__dirname, "public/fotoImprimir.jpg"),
      watermarkPath,
      res,
      filename
    );
  });
});

function añadirMarcaAgua(inputPath, outputPath, watermarkPath, res, filename) {
  const command = `composite -gravity SouthWest -geometry +10+10 ${watermarkPath} ${inputPath} ${outputPath}`;

  return exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Error al añadir marca de agua:", stderr);
    } else {
      console.log("✅ Marca de agua añadida:", outputPath);
    }
    res.send(filename);
  });
}

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});

app.get("/print-photo", (req, res) => {
 const datos = fs.readFileSync(printPath);
printer.printDirect({
  data: datos,
  printer: myPrinter,
  type: 'JPEG', // o 'RAW' si da error
  success: function (jobID) {
    console.log("Imagen enviada a imprimir. ID del trabajo:", jobID);
  },
  error: function (err) {
    console.error("Error al imprimir:", err);
  }
});
});