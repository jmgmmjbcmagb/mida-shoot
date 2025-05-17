const webcam = document.getElementById("webcam");
const photoElement = document.getElementById("photo");
const image = document.getElementById("image");
const loading = document.getElementById("loading");
let countRun = false;
let showPhoto = false;

navigator.mediaDevices
  .getUserMedia({ video: true, audio: false })
  .then((stream) => {
    webcam.srcObject = stream;
  })
  .catch((err) => {
    console.error("Error al acceder a la webcam:", err);
  });

function takePhoto() {
  if (countRun === true) {
    return;
  }
  countRun = true;
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
      loading.style.display = "flex";
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
    loading.style.display = "none";
    photoElement.style.display = "flex";
    countRun = false;
    showPhoto = true;
  }, 2000);
}

document.addEventListener("keydown", (event) => {
  if (event.key === "2" && countRun === false && showPhoto === false) {
    takePhoto();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "1" && countRun === false) {
    showPhoto = false;
    photoElement.style.display = "none";
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "3" && countRun === false && showPhoto === true) {
    fetch("/take-photo")
        .then(() => {
              showPhoto = false;
    photoElement.style.display = "none";
        })
        .catch((err) => console.error("Error al imprimir foto:", err));
  }
});
