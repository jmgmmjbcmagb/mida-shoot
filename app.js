const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;
const MAX_PREVIEWS = 5; // Número máximo de fotos de vista previa a guardar

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

// Ruta para tomar una foto
app.get("/take-photo", (req, res) => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/T/, '-').replace(/:/g, '').replace(/\..+/, '');
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
    res.redirect("/");
  });
});

// Ruta para vista previa en vivo
app.get("/live-preview", (req, res) => {
  const previewPath = path.join(__dirname, "public/preview", "preview.jpg");
  const previewCmd = `gphoto2 --capture-image-and-download --filename ${previewPath}`;

  exec(previewCmd, (err) => {
    if (err) {
      console.error("Error al capturar preview:", err);
      return res.status(500).send("Error al capturar preview.");
    }

    console.log("Preview actualizado");
    res.send("ok");
  });
});


app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
