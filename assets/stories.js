document.addEventListener("DOMContentLoaded", () => {
  const stories = Array.from(document.querySelectorAll(".story-item"));
  const wrapper = document.querySelector(".stories-wrapper");
  const modal = document.getElementById("story-modal");
  const modalMedia = document.getElementById("story-media");
  const modalTitle = document.getElementById("story-modal-title");
  const closeModalBtn = document.getElementById("close-modal");

  let currentIndex = 0;
  let timer = null;

  if (!stories.length || !wrapper) return;

  function showStory(index) {
    if (index < 0 || index >= stories.length) {
      closeModal();
      return;
    }

    currentIndex = index;

    const story = stories[index];
    const title = story.querySelector(".story-title").textContent;

    const imgEl = story.querySelector("img");
    const videoEl = story.querySelector("video");

    modalTitle.textContent = title;
    modalMedia.innerHTML = "";

    if (videoEl && videoEl.src) {
      const video = document.createElement("video");
      video.src = videoEl.src;
      video.controls = false;
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "cover";

      modalMedia.appendChild(video);

      // Quando o vídeo termina, vai pro próximo
      video.onended = () => {
        nextStory();
      };

      // Se o vídeo tiver menos de 15s, avança mesmo assim
      clearTimeout(timer);
      timer = setTimeout(nextStory, 15000);
    } else if (imgEl && imgEl.src) {
      const img = document.createElement("img");
      img.src = imgEl.src;
      modalMedia.appendChild(img);

      clearTimeout(timer);
      timer = setTimeout(nextStory, 15000);
    }

    modal.style.display = "flex";
  }

  function nextStory() {
    showStory(currentIndex + 1);
  }

  function closeModal() {
    modal.style.display = "none";
    modalMedia.innerHTML = "";
    clearTimeout(timer);
  }

  stories.forEach((story, index) => {
    story.addEventListener("click", (e) => {
      e.preventDefault();
      showStory(index);
    });
  });

  closeModalBtn.addEventListener("click", closeModal);

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Scroll horizontal com a roda do mouse no desktop
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
