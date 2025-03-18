document.addEventListener('DOMContentLoaded', function() {
  const gallery = document.querySelector('.gallery');
  const items = document.querySelectorAll('.art-piece');
  const totalItems = items.length;
  let currentIndex = 0;

  function updateGallery() {
    const offset = -currentIndex * 50; // Cada item ocupa 50% da largura
    gallery.style.transform = `translateX(${offset}%)`;
  }

  function nextItems() {
    currentIndex = (currentIndex + 2) % totalItems; // Avança 2 itens
    updateGallery();
  }

  // Muda automaticamente a cada 3 segundos
  setInterval(nextItems, 3000);

  updateGallery(); // Inicializa a galeria
});