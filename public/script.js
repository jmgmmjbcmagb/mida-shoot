const webcam = document.getElementById("webcam");
const photoElement = document.getElementById("photo");

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
        .then(() => updatePhoto("/foto.jpg"))
        .catch((err) => console.error("Error al tomar foto:", err));
    }
  }, 1500);
}

function updatePhoto(src) {
  const timestamp = new Date().getTime();
  photoElement.src = `${src}?${timestamp}`;
  photoElement.style.display = "block";
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
