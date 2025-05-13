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
  const fullPath = path.join(__dirname, "public", filename);

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
  const previewPath = path.join(__dirname, "public", "preview.jpg");
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


// Función para limpiar las fotos de vista previa antiguas
function cleanOldPreviews() {
  const previewDir = path.join(__dirname, "public");
  fs.readdir(previewDir, (err, files) => {
    if (err) {
      console.error("Error al leer directorio de fotos:", err);
      return;
    }

    // Filtrar solo las fotos de vista previa (que empiezan con "preview-")
    const previewFiles = files.filter(file => file.startsWith("preview-"));

    if (previewFiles.length > MAX_PREVIEWS) {
      // Ordenar archivos por fecha (antiguos primero)
      previewFiles.sort((a, b) => {
        return fs.statSync(path.join(previewDir, a)).mtime.getTime() - fs.statSync(path.join(previewDir, b)).mtime.getTime();
      });

      // Borrar las fotos más antiguas si superan el límite
      const filesToDelete = previewFiles.slice(0, previewFiles.length - MAX_PREVIEWS);
      filesToDelete.forEach(file => {
        const filePath = path.join(previewDir, file);
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error(`Error al borrar archivo ${file}:`, err);
          } else {
            console.log(`Archivo ${file} eliminado.`);
          }
        });
      });
    }
  });
}

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
