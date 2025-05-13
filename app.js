const express = require("express");
const { exec } = require("child_process");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views/index.html"));
});

app.get("/take-photo", (req, res) => {
  const filename = path.join(__dirname, "public/foto.jpg");
  const cmd = `gphoto2 --capture-image-and-download --filename ${filename}`;

  exec(cmd, (err, stdout, stderr) => {
    if (err) {
      console.error("Error al tomar foto:", stderr);
      return res.status(500).send("Error al tomar foto.");
    }
    console.log("Foto tomada:", stdout);
    res.redirect("/");
  });
});

app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});