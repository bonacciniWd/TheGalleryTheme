document.addEventListener("DOMContentLoaded", () => {
  const stories = document.querySelectorAll(".story-item");
  const wrapper = document.querySelector(".stories-wrapper"); // 🔧 Adicionado
  const modal = document.getElementById("story-modal");
  const modalMedia = document.getElementById("story-media");
  const modalTitle = document.getElementById("story-modal-title");
  const closeModalBtn = document.getElementById("close-modal");

  if (!stories.length || !wrapper) return;

  stories.forEach(story => {
    story.addEventListener("click", (e) => {
      e.preventDefault();
      const title = story.querySelector(".story-title").textContent;

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
    if (e.deltaY !== 0) {
      e.preventDefault();
      wrapper.scrollBy({
        left: e.deltaY,
        behavior: "smooth"
      });
    }
  }, { passive: false });
});
