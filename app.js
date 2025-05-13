const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

// Ruta para tomar una foto
app.get("/take-photo", (req, res) => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/T/, '-').replace(/:/g, '').replace(/\..+/, '');
  const filename = `foto-${timestamp}.jpg`;
  const fullPath = path.join(__dirname, "public", filename);

  const disableFlash = `gphoto2 --set-config /main/actions/popupflash=1`;
  const takePhoto = `gphoto2 --capture-image-and-download --filename ${fullPath}`;

  exec(disableFlash, (err) => {
    if (err) {
      console.error("Error al desactivar flash:", err);
      return res.status(500).send("Error al configurar la cámara.");
    }

    exec(takePhoto, (err) => {
      if (err) {
        console.error("Error al tomar foto:", err);
        return res.status(500).send("Error al tomar foto.");
      }

      const aliasPath = path.join(__dirname, "public/foto.jpg");
      fs.copyFileSync(fullPath, aliasPath);

      console.log("Foto tomada sin flash:", filename);
      res.redirect("/");
    });
  });
});

// Ruta para vista previa en vivo
app.get("/live-preview", (req, res) => {
  const previewPath = path.join(__dirname, "public", "preview.jpg");

  const disableFlash = `gphoto2 --set-config flashmode=Off`;
  const previewCmd = `gphoto2 --capture-preview --filename ${previewPath}`;

  exec(disableFlash, (err) => {
    if (err) {
      console.error("Error al desactivar flash (preview):", err);
      return res.status(500).send("Error al configurar la cámara.");
    }

    exec(previewCmd, (err) => {
      if (err) {
        console.error("Error al capturar preview:", err);
        return res.status(500).send("Error al capturar preview.");
      }

      res.send("ok");
    });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
