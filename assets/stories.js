document.addEventListener("DOMContentLoaded", () => {
  const stories = document.querySelectorAll(".story-item");
  const modal = document.getElementById("story-modal");
  const modalMedia = document.getElementById("story-media");
  const modalTitle = document.getElementById("story-modal-title");
  const closeModalBtn = document.getElementById("close-modal");

  if (!stories.length) return;

  stories.forEach(story => {
    story.addEventListener("click", (e) => {
      e.preventDefault();
      const title = story.querySelector(".story-title").textContent;

      // Tenta pegar imagem ou vídeo dentro do item
      const imgEl = story.querySelector("img");
      const videoEl = story.querySelector("video");

      modalTitle.textContent = title;
      modalMedia.innerHTML = "";

      if (videoEl && videoEl.src) {
        const video = document.createElement("video");
        video.src = videoEl.src;
        video.controls = true;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        modalMedia.appendChild(video);
      } else if (imgEl && imgEl.src) {
        const img = document.createElement("img");
        img.src = imgEl.src;
        modalMedia.appendChild(img);
      }

      modal.style.display = "flex";
    });
  });

  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
    modalMedia.innerHTML = "";
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      modalMedia.innerHTML = "";
    }
  });
    // ⚠️ Scroll horizontal com a roda do mouse no desktop
  wrapper.addEventListener("wheel", (e) => {
    // Só funciona se tiver deltaY (ou seja, roda do mouse)
    if (e.deltaY !== 0) {
      e.preventDefault();
      wrapper.scrollBy({
        left: e.deltaY,
        behavior: "smooth"
      });
    }
  }, { passive: false });
});
