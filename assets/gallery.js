document.addEventListener('DOMContentLoaded', function() {
  const items = document.querySelectorAll('.art-piece');
  const totalItems = items.length;
  let currentIndex = 0;

  // Inicializa os primeiros 3 itens
  function initializeGallery() {
    for (let i = 0; i < 3; i++) {
      if (i < totalItems) {
        items[i].classList.add('active');
      }
    }
  }

  function updateGallery() {
    // Remove a classe 'active' do item atual
    items[currentIndex].classList.remove('active');

    // Avança para o próximo índice
    currentIndex = (currentIndex + 1) % totalItems;

    // Adiciona a classe 'active' ao novo item
    items[currentIndex].classList.add('active');

    // Se o próximo item também estiver dentro do limite, adicione-o
    if (currentIndex + 1 < totalItems) {
      items[(currentIndex + 1) % totalItems].classList.add('active');
    }
  }

  // Inicializa a galeria
  initializeGallery();

  // Muda automaticamente a cada 1.5 segundos
  setInterval(updateGallery, 1500);
});