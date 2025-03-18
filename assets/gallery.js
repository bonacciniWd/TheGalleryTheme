document.addEventListener('DOMContentLoaded', function() {
  const artPieces = [
    { title: 'Beautiful Beast', imgPath: '/beauty_and_beast.jpeg' },
    { title: 'Stillness', imgPath: '/crane.jpeg' },
    { title: 'Foxy', imgPath: '/foxy.jpeg' },
    { title: 'Gentle Giant', imgPath: '/horse_sketch.jpeg' },
    { title: 'Purity', imgPath: '/kindness.jpeg' },
    { title: 'Lonely Together', imgPath: '/lonely_together.jpeg' },
    { title: 'Owl', imgPath: '/owl.jpeg' },
    { title: 'Menace', imgPath: '/panther.jpeg' },
    { title: 'Paradise', imgPath: '/paradise.jpeg' },
    { title: 'Friendship', imgPath: '/sprited_away.jpeg' },
    { title: 'Wanderlust', imgPath: '/wonder.jpeg' },
    { title: 'Serenity', imgPath: '/forest.jpeg' },
  ];

  const galleryContainer = document.querySelector('.gallery');

  artPieces.forEach(art => {
    const artPiece = document.createElement('div');
    artPiece.classList.add('art-piece');
    artPiece.innerHTML = `
      <img src="${art.imgPath}" alt="${art.title}" />
      <h3>${art.title}</h3>
    `;
    galleryContainer.appendChild(artPiece);
  });
});