const express = require("express");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const Jimp = require("jimp");
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

    procesarFoto(
      aliasPath,
      path.join(__dirname, "public/fotoImprimir.jpg"),
      watermarkPath
    ).then(() => console.log("imprime"));

    res.redirect("/");
  });
});

async function procesarFoto(inputPath, outputPath, watermarkPath) {
  try {
    const image = await Jimp.read(inputPath);
    const watermark = await Jimp.read(watermarkPath);

    const height = image.bitmap.height;
    const targetWidth = Math.floor((3 / 2) * height);
    const xOffset = Math.floor((image.bitmap.width - targetWidth) / 2);

    // Recortar
    image.crop(xOffset, 0, targetWidth/10, height/10);

    // Redimensionar watermark si es muy grande (opcional)
    watermark.resize(Jimp.AUTO, 500); // altura de 100px

    // Pegar marca en esquina inferior izquierda
    const x = 10;
    const y = image.bitmap.height - watermark.bitmap.height - 10;

    image.composite(watermark, x, y, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
    });

    await image.writeAsync(outputPath);
    console.log("✅ Imagen procesada con Jimp:", outputPath);
  } catch (err) {
    console.error("❌ Error con Jimp:", err);
  }
}

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
