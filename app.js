const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 3000;
const watermarkPath = path.join(__dirname, "public/watermark.png");
const printPath = path.join(__dirname, "public", "fotoImprimir.jpg");

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

// TAKE PHOTO
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

    addWatermark(
      aliasPath,
      path.join(__dirname, "public/fotoImprimir.jpg"),
      watermarkPath,
      res,
      filename
    );
  });
});

// PRINT PHOTO
app.get("/print-photo", (req, res) => {
  const printerName = "HP_Envy_6100e_series_EA4513";
  const cmd = `lp -o media=10x15cm -o fit-to-page -d ${printerName} "${printPath}"`;

  exec(cmd, (error, stdout, stderr) => {
    if (error) {
      console.error(`Error al imprimir: ${error.message}`);
      return res.status(500).send("Error al imprimir");
    }
    if (stderr) {
      console.error(`Stderr: ${stderr}`);
    }
    console.log(`Stdout: ${stdout}`);
    res.send("Foto enviada a la impresora");
  });
});

function addWatermark(inputPath, outputPath, watermarkPath, res, filename) {
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
