let currentRotation = 0;

function rotateFilter(degrees) {
  let filters = document.getElementsByClassName("filter");
  for (let i = 0; i < filters.length; i++) {
    filters[i].style.transition = "transform 1s ease-in-out";
    filters[i].style.transform = `rotate(${degrees}deg)`;
  }
}

function toggleRotation() {
  currentRotation = currentRotation === 0 ? 180 : 0;
  rotateFilter(currentRotation);
}
