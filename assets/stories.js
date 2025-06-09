document.addEventListener("DOMContentLoaded", () => {
  const stories = Array.from(document.querySelectorAll(".story-item"));
  const wrapper = document.querySelector(".stories-wrapper");
  const modal = document.getElementById("story-modal");
  const modalMedia = document.getElementById("story-media");
  const modalTitle = document.getElementById("story-modal-title");
  const closeModalBtn = document.getElementById("close-modal");
  const progressFill = document.getElementById("progress-fill");
  const likeBtn = document.getElementById("like-btn");
  const likeCountSpan = document.getElementById("like-count");
  const viewCountSpan = document.getElementById("view-count");

  let currentIndex = 0;
  let timer = null;
  let progressInterval = null;
  const storyDuration = 15000; // 15 segundos

  if (!stories.length || !wrapper) return;

  // Função para obter curtidas do localStorage
  function getLikes(id) {
    return parseInt(localStorage.getItem(`story-like-${id}`)) || 0;
  }

  // Função para salvar curtidas no localStorage
  function saveLikes(id, count) {
    localStorage.setItem(`story-like-${id}`, count);
  }

  // Função para obter visualizações do localStorage
  function getViews(id) {
    return parseInt(localStorage.getItem(`story-view-${id}`)) || 0;
  }

  // Função para salvar visualizações no localStorage
  function saveViews(id, count) {
    localStorage.setItem(`story-view-${id}`, count);
  }

  // Atualiza o progresso da barra
  function startProgress() {
    let startTime = Date.now();

    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';

    // Forçar reflow para aplicar a mudança de largura 0 antes de animar
    void progressFill.offsetWidth;

    progressFill.style.transition = `width ${storyDuration}ms linear`;
    progressFill.style.width = '100%';
  }

  // Para o progresso
  function resetProgress() {
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
  }

  // Atualiza o contador de curtidas e estado do botão
  function updateLikeUI(id) {
    const likes = getLikes(id);
    likeCountSpan.textContent = likes;
    if (likes > 0) {
      likeBtn.classList.add("liked");
      likeBtn.textContent = `❤️ ${likes}`;
    } else {
      likeBtn.classList.remove("liked");
      likeBtn.textContent = `♡ ${likes}`;
    }
  }

  // Atualiza o contador de visualizações
  function updateViewUI(id) {
    const views = getViews(id);
    viewCountSpan.textContent = `👁️ ${views}`;
  }

  // Incrementa visualizações
  function incrementView(id) {
    let views = getViews(id);
    views++;
    saveViews(id, views);
    updateViewUI(id);
  }

  function showStory(index) {
    if (index < 0 || index >= stories.length) {
      closeModal();
      return;
    }

    currentIndex = index;

    const story = stories[index];
    const title = story.querySelector(".story-title").textContent;
    const imageUrl = story.getAttribute("data-image");
    const videoUrl = story.getAttribute("data-video");
    const storyId = story.getAttribute("data-index"); // usar índice como id

    modalTitle.textContent = title;
    modalMedia.innerHTML = "";

    // Incrementa views só na primeira abertura da story no modal
    incrementView(storyId);

    // Atualiza curtidas e visualizações
    updateLikeUI(storyId);
    updateViewUI(storyId);

    if (videoUrl) {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.controls = false;
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.style.maxWidth = "100%";
      video.style.maxHeight = "70vh";
      modalMedia.appendChild(video);

      // Controla o progresso pela duração do vídeo
      video.onloadedmetadata = () => {
        clearTimeout(timer);
        clearInterval(progressInterval);

        const duration = video.duration * 1000;

        // Reseta e inicia progresso animado proporcional ao vídeo
        resetProgress();
        // anima largura progressFill em duração do video
        progressFill.style.transition = `width ${duration}ms linear`;
        progressFill.style.width = '100%';

        timer = setTimeout(() => {
          showStory(currentIndex + 1);
        }, duration);
      };

      video.onended = () => {
        clearTimeout(timer);
        showStory(currentIndex + 1);
      };

    } else if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = title;
      img.style.maxWidth = "100%";
      img.style.maxHeight = "70vh";
      modalMedia.appendChild(img);

      clearTimeout(timer);
      clearInterval(progressInterval);
      resetProgress();
      startProgress();

      timer = setTimeout(() => {
        showStory(currentIndex + 1);
      }, storyDuration);
    }

    modal.style.display = "block";
  }

  function closeModal() {
    modal.style.display = "none";
    modalMedia.innerHTML = "";
    resetProgress();
    clearTimeout(timer);
    clearInterval(progressInterval);
  }

  // Evento clique em story na lista para abrir modal
  stories.forEach((story, i) => {
    story.addEventListener("click", (e) => {
      e.preventDefault();
      showStory(i);
    });
  });

  // Fechar modal
  closeModalBtn.addEventListener("click", closeModal);

  // Curtir a story
  likeBtn.addEventListener("click", () => {
    const storyId = currentIndex.toString();
    let likes = getLikes(storyId);

    if (likes === 0) {
      likes = 1;
    } else {
      likes = 0; // toggle like off
    }

    saveLikes(storyId, likes);
    updateLikeUI(storyId);
  });

  // Fechar modal ao clicar fora da área
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Tecla ESC fecha modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "block") {
      closeModal();
    }
  });
});
