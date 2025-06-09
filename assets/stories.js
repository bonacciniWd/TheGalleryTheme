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
      video
