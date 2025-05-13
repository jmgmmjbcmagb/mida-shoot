const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const sharp = require("sharp");
const app = express();
const PORT = 3000;
const MAX_PREVIEWS = 5; // Número máximo de fotos de vista previa a guardar
const watermarkPath = path.join(__dirname, "public/marca.png");

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

      procesarFoto(aliasPath,path.join(__dirname, "public/fotoImprimir.jpg"),watermarkPath).then(()=>
    console.log('imprime'))

      res.redirect("/");
    
  });
});


async function procesarFoto(inputPath, outputPath, watermarkPath) {
  try {
    // Tamaño original: 4272x2848 → queremos 3:2 → altura = 2848, ancho = 3/2 * 2848 = 4272 exacto (ya está bien)
    // Pero en general, calculemos de forma dinámica por si cambia la cámara

    const metadata = await sharp(inputPath).metadata();

    const height = metadata.height;
    const width = Math.floor((3 / 2) * height);

    const xOffset = Math.floor((metadata.width - width) / 2);

    const image = sharp(inputPath)
      .extract({ width, height, left: xOffset, top: 0 })
      .composite([
        {
          input: watermarkPath,
          gravity: "southwest", // esquina inferior izquierda
          blend: "over",
          top: undefined, // usamos gravity
          left: undefined,
        },
      ]);

    await image.toFile(outputPath);
    console.log("✅ Imagen procesada y guardada en:", outputPath);
  } catch (err) {
    console.error("❌ Error procesando imagen:", err);
  }
}

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
