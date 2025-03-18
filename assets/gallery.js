document.addEventListener('DOMContentLoaded', function() {
  const gallery = document.querySelector('.gallery');
  const items = document.querySelectorAll('.art-piece');
  const totalItems = items.length;
  let currentIndex = 0;

  function updateGallery() {
    const offset = -currentIndex * 50; // Cada item ocupa 50% da largura
    gallery.style.transform = `translateX(${offset}%)`;
  }

  document.querySelector('.next').addEventListener('click', function() {
    currentIndex = (currentIndex + 2) % totalItems; // Avança 2 itens
    updateGallery();
  });

  document.querySelector('.prev').addEventListener('click', function() {
    currentIndex = (currentIndex - 2 + totalItems) % totalItems; // Retrocede 2 itens
    updateGallery();
  });

  updateGallery(); // Inicializa a galeria
});