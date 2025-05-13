const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const app = express();
const PORT = 3000;
const watermarkPath = path.join(__dirname, "public/watermark.png");

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
      watermarkPath
    );

    res.redirect("/");
  });
});

function añadirMarcaAgua(inputPath, outputPath, watermarkPath) {
  const command = `composite -gravity SouthWest -geometry +10+10 ${watermarkPath} ${inputPath} ${outputPath}`;

  exec(command, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Error al añadir marca de agua:", stderr);
    } else {
      console.log("✅ Marca de agua añadida:", outputPath);
    }
  });
}

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
