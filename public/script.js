const webcam = document.getElementById("webcam");
const photoElement = document.getElementById("photo");
const image = document.getElementById("image");

navigator.mediaDevices
  .getUserMedia({ video: true, audio: false })
  .then((stream) => {
    webcam.srcObject = stream;
  })
  .catch((err) => {
    console.error("Error al acceder a la webcam:", err);
  });

function takePhoto() {
  const countdown = document.getElementById("countdown");
  let count = 5;

  countdown.style.display = "block";
  countdown.textContent = count;

  const countdownInterval = setInterval(() => {
    count--;
    if (count > 0) {
      countdown.textContent = count;
    } else {
      clearInterval(countdownInterval);
      countdown.style.display = "none";
      fetch("/take-photo")
        .then(() => updatePhoto("/fotoImprimir.jpg"))
        .catch((err) => console.error("Error al tomar foto:", err));
    }
  }, 1500);
}

function updatePhoto(src) {
  const timestamp = new Date().getTime();
  setTimeout(() => {
    image.src = `${src}?v=${timestamp}`;
    photoElement.style.display = "flex";
  }, 1000);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "2") {
    takePhoto();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "1") {
      photoElement.style.display = "none";
  }
});
