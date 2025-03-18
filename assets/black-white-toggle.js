document.addEventListener('DOMContentLoaded', function() {
  let currentRotation = 0;
  const toggle = document.getElementById('toggle');
  const filter = document.querySelector('.filter');

  function rotateFilter(degrees) {
    if (filter) {
      filter.style.transition = "transform 1s ease-in-out";
      filter.style.transform = `rotate(${degrees}deg)`;
    }
  }

  if (toggle) {
    toggle.addEventListener('click', function() {
      currentRotation = currentRotation === 0 ? 180 : 0;
      rotateFilter(currentRotation);
    });
  }
});
