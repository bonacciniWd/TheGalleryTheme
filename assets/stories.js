document.addEventListener("DOMContentLoaded", () => {
  const storiesContainer = document.querySelector(".stories-wrapper"); // Novo elemento para delegação
  const modal = document.getElementById("story-modal");
  const modalMedia = document.getElementById("story-media");
  const modalTitle = document.getElementById("story-modal-title");
  const closeModalBtn = document.getElementById("close-modal");
  const progressFill = document.getElementById("progress-fill");
  const likeBtn = document.getElementById("like-btn");
  const likeCountSpan = document.getElementById("like-count");
  const viewCountSpan = document.getElementById("view-count");

  // Verificar se os elementos essenciais existem antes de continuar
  if (!storiesContainer || !modal) {
    console.warn("Shopify Stories: Elementos essenciais não encontrados. O script não será inicializado.");
    return;
  }

  const stories = Array.from(storiesContainer.querySelectorAll(".story-item")); // Pega os itens dentro do container
  let currentIndex = 0;
  let timer = null;
  const storyDuration = 15000; // 15 segundos para imagens

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
  function startProgress(duration) {
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    void progressFill.offsetWidth; // Força o reflow
    progressFill.style.transition = `width ${duration}ms linear`;
    progressFill.style.width = '100%';
  }

  // Para o progresso
  function resetProgress() {
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    // Não precisa de reflow aqui, pois não estamos iniciando uma nova transição
  }

  // Atualiza o contador de curtidas e estado do botão
  function updateLikeUI(id) {
    const likes = getLikes(id);
    likeCountSpan.textContent = likes;
    if (likes > 0) {
      likeBtn.classList.add("liked");
      likeBtn.innerHTML = `❤️ <span id="like-count">${likes}</span>`; // Atualiza o HTML para acessibilidade
    } else {
      likeBtn.classList.remove("liked");
      likeBtn.innerHTML = `♡ <span id="like-count">${likes}</span>`; // Atualiza o HTML para acessibilidade
    }
  }

  // Atualiza o contador de visualizações
  function updateViewUI(id) {
    const views = getViews(id);
    viewCountSpan.textContent = `👁️ ${views}`;
    // Pode-se adicionar aria-live="polite" ao viewCountSpan no HTML
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
    modalMedia.innerHTML = ""; // Limpa conteúdo anterior

    // Incrementa views só na primeira abertura da story no modal (ou cada vez que é mostrada, dependendo da sua regra)
    incrementView(storyId);

    // Atualiza curtidas e visualizações
    updateLikeUI(storyId);
    updateViewUI(storyId);

    clearTimeout(timer); // Limpa o timer anterior antes de iniciar um novo

    if (videoUrl) {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.controls = false;
      video.autoplay = true;
      video.muted = false; // Vídeos de story geralmente não são mudos por padrão, mas pode ser uma escolha de UX
      video.playsInline = true;
      video.preload = "metadata";
      video.style.maxWidth = "100%";
      video.style.maxHeight = "70vh";
      video.setAttribute("aria-label", `Conteúdo do story: ${title}`); // Acessibilidade para o vídeo
      modalMedia.appendChild(video);

      video.onloadedmetadata = () => {
        const duration = video.duration * 1000;
        startProgress(duration); // Inicia progresso com duração do vídeo
        timer = setTimeout(() => {
          showStory(currentIndex + 1);
        }, duration);
      };

      video.onended = () => {
        clearTimeout(timer); // Garante que o timer seja limpo se o vídeo terminar antes
        showStory(currentIndex + 1);
      };

      video.onerror = () => {
        console.error(`Erro ao carregar vídeo: ${videoUrl}`);
        showStory(currentIndex + 1); // Tenta ir para a próxima story em caso de erro
      };

    } else if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = title;
      img.style.maxWidth = "100%";
      img.style.maxHeight = "70vh";
      img.setAttribute("aria-label", `Conteúdo do story: ${title}`); // Acessibilidade para a imagem
      modalMedia.appendChild(img);

      startProgress(storyDuration); // Inicia progresso com duração padrão para imagens
      timer = setTimeout(() => {
        showStory(currentIndex + 1);
      }, storyDuration);

      img.onerror = () => {
        console.error(`Erro ao carregar imagem: ${imageUrl}`);
        showStory(currentIndex + 1); // Tenta ir para a próxima story em caso de erro
      };
    }

    modal.style.display = "block";
    modal.focus(); // Coloca o foco no modal para acessibilidade
  }

  function closeModal() {
    modal.style.display = "none";
    modalMedia.innerHTML = "";
    resetProgress();
    clearTimeout(timer);
    // Remove o foco do modal para o elemento anterior que abriu, ou um elemento padrão
    document.querySelector(`.story-item[data-index="${currentIndex}"]`)?.focus();
  }

  // Delegação de eventos para cliques nas stories
  storiesContainer.addEventListener("click", (e) => {
    const storyItem = e.target.closest(".story-item");
    if (storyItem) {
      e.preventDefault();
      const index = parseInt(storyItem.getAttribute("data-index"));
      showStory(index);
    }
  });

  // Fechar modal
  closeModalBtn.addEventListener("click", closeModal);

  // Curtir a story
  likeBtn.addEventListener("click", () => {
    const storyId = currentIndex.toString(); // Usar o índice como ID da story
    let likes = getLikes(storyId);

    if (likeBtn.classList.contains("liked")) {
      likes = 0; // Se já está curtido, descurtir
    } else {
      likes = 1; // Se não está curtido, curtir
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

  // Navegação com setas do teclado (Opcional)
  document.addEventListener("keydown", (e) => {
    if (modal.style.display === "block") {
      if (e.key === "ArrowRight") {
        e.preventDefault(); // Previne rolagem da página
        showStory(currentIndex + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault(); // Previne rolagem da página
        showStory(currentIndex - 1);
      }
    }
  });
});