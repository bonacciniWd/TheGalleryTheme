document.addEventListener("DOMContentLoaded", () => {
  const storiesContainer = document.querySelector(".stories-wrapper");
  const modal = document.getElementById("story-modal");
  const modalMedia = document.getElementById("story-media");
  const modalTitle = document.getElementById("story-modal-title");
  const closeModalBtn = document.getElementById("close-modal");
  const progressFill = document.getElementById("progress-fill");
  const likeBtn = document.getElementById("like-btn");
  const likeCountSpan = document.getElementById("like-count");
  const viewCountSpan = document.getElementById("view-count");

  // Novos elementos para as setas de navegação
  const prevStoryBtn = document.getElementById("prev-story-btn");
  const nextStoryBtn = document.getElementById("next-story-btn");

  // Verificar se os elementos essenciais existem antes de continuar
  if (!storiesContainer || !modal) {
    console.warn("Shopify Stories: Elementos essenciais não encontrados. O script não será inicializado.");
    return;
  }

  const stories = Array.from(storiesContainer.querySelectorAll(".story-item"));
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
    void progressFill.offsetWidth; // Força o reflow para resetar a transição
    progressFill.style.transition = `width ${duration}ms linear`;
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
      likeBtn.innerHTML = `❤️ <span id="like-count">${likes}</span>`;
    } else {
      likeBtn.classList.remove("liked");
      likeBtn.innerHTML = `♡ <span id="like-count">${likes}</span>`;
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
    modalMedia.innerHTML = ""; // Limpa conteúdo anterior

    // Incrementa views só na primeira abertura da story no modal (ou cada vez que é mostrada)
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
      video.muted = false; // Mantenha false para ter som, se desejado
      video.playsInline = true;
      video.preload = "metadata";
      video.style.maxWidth = "100%";
      video.style.maxHeight = "70vh";
      video.setAttribute("aria-label", `Conteúdo do story: ${title}`);
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
      img.setAttribute("aria-label", `Conteúdo do story: ${title}`);
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

    // Abertura do modal - usando estilo inline para garantir a sobrescrita
    modal.style.display = "flex";
    modal.focus(); // Coloca o foco no modal para acessibilidade

    // **Lógica para mostrar/ocultar as setas de navegação - AGORA VAI APARECER EM MOBILE TAMBÉM**
    if (prevStoryBtn && nextStoryBtn) {
        // Esconder o botão "Anterior" se for a primeira história (currentIndex é 0)
        prevStoryBtn.style.display = (currentIndex > 0) ? 'flex' : 'none';
        // Esconder o botão "Próximo" se for a última história
        nextStoryBtn.style.display = (currentIndex < stories.length - 1) ? 'flex' : 'none';

        // Ocultar ambos os botões se houver apenas uma história
        if (stories.length <= 1) {
            prevStoryBtn.style.display = 'none';
            nextStoryBtn.style.display = 'none';
        }
    }
  }

  function closeModal() {
    modal.style.display = "none"; // Volta para display: none
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
    // Adiciona uma condição para não fechar ao clicar nos botões de navegação
    if (e.target === modal || e.target === closeModalBtn || e.target === prevStoryBtn || e.target === nextStoryBtn) {
        return;
    }
    // Se o clique foi no background do modal, fechar
    if (e.target === modal) {
        closeModal();
    }
  });

  // Tecla ESC fecha modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.style.display === "flex") { // Verifica style.display
      closeModal();
    }
  });

  // Navegação com setas do teclado
  document.addEventListener("keydown", (e) => {
    if (modal.style.display === "flex") { // Verifica style.display
      if (e.key === "ArrowRight") {
        e.preventDefault(); // Previne rolagem da página
        showStory(currentIndex + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault(); // Previne rolagem da página
        showStory(currentIndex - 1);
      }
    }
  });

  // Scroll horizontal com a roda do mouse no desktop
  if (storiesContainer) { // Adiciona verificação para evitar erro
    storiesContainer.addEventListener("wheel", (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        storiesContainer.scrollBy({
          left: e.deltaY,
          behavior: "smooth"
        });
      }
    }, { passive: false });
  }

  // Adicionar eventos para as setas de navegação no modal
  if (prevStoryBtn) {
    prevStoryBtn.addEventListener("click", () => showStory(currentIndex - 1));
  }
  if (nextStoryBtn) {
    nextStoryBtn.addEventListener("click", () => showStory(currentIndex + 1));
  }

  // --- Gesto de Handler (Mobile) ---
  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0; // Para verificar se é um scroll vertical
  let touchEndY = 0;
  const minSwipeDistance = 50; // Distância mínima horizontal para considerar um swipe
  const maxVerticalScroll = 30; // Distância vertical máxima para ainda considerar um swipe horizontal

  modalMedia.addEventListener('touchstart', (e) => {
    // Apenas permitir um dedo para evitar conflitos com zoom multi-touch
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      // Pausar timer para evitar auto-avanço durante o swipe
      clearTimeout(timer);
      resetProgress();
    }
  }, { passive: true });

  modalMedia.addEventListener('touchmove', (e) => {
    if (e.touches.length === 1) {
      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;
    }
  }, { passive: true });

  modalMedia.addEventListener('touchend', () => {
    const swipeDistanceX = touchEndX - touchStartX;
    const swipeDistanceY = Math.abs(touchEndY - touchStartY); // Usar valor absoluto para a distância vertical

    if (modal.style.display === "flex") { // Verifica style.display
      // Se a movimentação vertical for muito grande, não é um swipe horizontal de navegação de story
      if (swipeDistanceY > maxVerticalScroll) {
          // É mais um scroll vertical, pode reiniciar o timer se quiser
          startProgress(storyDuration); // ou retomar do ponto de pausa
          return;
      }

      if (swipeDistanceX > minSwipeDistance) {
        // Swipe para a direita (anterior)
        showStory(currentIndex - 1);
      } else if (swipeDistanceX < -minSwipeDistance) {
        // Swipe para a esquerda (próximo)
        showStory(currentIndex + 1);
      } else {
        // Se não for um swipe suficiente, e for um toque simples, pode retomar o timer
        startProgress(storyDuration); // ou retomar do ponto de pausa
      }
    }
  });
});