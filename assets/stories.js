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

  const prevStoryBtn = document.getElementById("prev-story-btn");
  const nextStoryBtn = document.getElementById("next-story-btn");

  const shareBtn = document.getElementById("share-btn");
  const shareModal = document.getElementById("share-modal");
  const closeShareModalBtn = document.getElementById("close-share-modal");
  const whatsappShareBtn = document.getElementById("whatsapp-share");
  const instagramShareBtn = document.getElementById("instagram-share");
  const copyLinkShareBtn = document.getElementById("copy-link-share");
  const copyFeedback = document.getElementById("copy-feedback");

  if (!storiesContainer || !modal) {
    console.warn("Shopify Stories: Elementos essenciais não encontrados. O script não será inicializado.");
    return;
  }

  const stories = Array.from(storiesContainer.querySelectorAll(".story-item"));
  let currentIndex = 0;
  let timer = null;
  let currentShareExternalUrl = ''; // VAI ARMAZENAR O LINK EXTERNO DO SEU METACAMPO
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

  function startProgress(duration) {
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    void progressFill.offsetWidth;
    progressFill.style.transition = `width ${duration}ms linear`;
    progressFill.style.width = '100%';
  }

  function resetProgress() {
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
  }

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

  function updateViewUI(id) {
    const views = getViews(id);
    viewCountSpan.textContent = `👁️ ${views}`;
  }

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
    const storyId = story.getAttribute("data-index"); // usar índice como id para likes/views
    const storyIdForUrl = story.getAttribute("data-story-id-url"); // O handle ou índice para a URL interna
    
    // PEGUE O LINK EXTERNO CONFIGURADO NO METACAMPO AQUI
    currentShareExternalUrl = story.getAttribute("data-external-link");
    


    modalTitle.textContent = title;
    modalMedia.innerHTML = "";

    incrementView(storyId);
    updateLikeUI(storyId);
    updateViewUI(storyId);

    clearTimeout(timer);

    if (videoUrl) {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.controls = false;
      video.autoplay = true;
      video.muted = false;
      video.playsInline = true;
      video.preload = "metadata";
      video.style.maxWidth = "100%";
      video.style.maxHeight = "70vh";
      video.setAttribute("aria-label", `Conteúdo do story: ${title}`);
      modalMedia.appendChild(video);

      video.onloadedmetadata = () => {
        const duration = video.duration * 1000;
        startProgress(duration);
        timer = setTimeout(() => {
          showStory(currentIndex + 1);
        }, duration);
      };

      video.onended = () => {
        clearTimeout(timer);
        showStory(currentIndex + 1);
      };

      video.onerror = () => {
        console.error(`Erro ao carregar vídeo: ${videoUrl}`);
        showStory(currentIndex + 1);
      };

    } else if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = title;
      img.style.maxWidth = "100%";
      img.style.maxHeight = "70vh";
      img.setAttribute("aria-label", `Conteúdo do story: ${title}`);
      modalMedia.appendChild(img);

      startProgress(storyDuration);
      timer = setTimeout(() => {
        showStory(currentIndex + 1);
      }, storyDuration);

      img.onerror = () => {
        console.error(`Erro ao carregar imagem: ${imageUrl}`);
        showStory(currentIndex + 1);
      };
    }

    modal.style.display = "flex";
    modal.focus();

    // Atualiza a URL na barra de endereços APENAS PARA O CONTROLE INTERNO DO MODAL
    history.replaceState(null, null, `${window.location.origin}${window.location.pathname}#story-${storyIdForUrl}`);

    if (prevStoryBtn && nextStoryBtn) {
      prevStoryBtn.style.display = (currentIndex > 0) ? 'flex' : 'none';
      nextStoryBtn.style.display = (currentIndex < stories.length - 1) ? 'flex' : 'none';

      if (stories.length <= 1) {
        prevStoryBtn.style.display = 'none';
        nextStoryBtn.style.display = 'none';
      }
    }
  }

  function closeModal() {
    modal.style.display = "none";
    modalMedia.innerHTML = "";
    resetProgress();
    clearTimeout(timer);

    // Remove a âncora da URL ao fechar o modal
    history.replaceState(null, null, window.location.origin + window.location.pathname);

    document.querySelector(`.story-item[data-index="${currentIndex}"]`)?.focus();
  }

  function openShareModal() {
    shareModal.style.display = "flex";
    shareModal.focus();
    // AQUI USAMOS currentShareExternalUrl (O LINK DO METACAMPO)
    whatsappShareBtn.href = `https://api.whatsapp.com/send?text=Confira este conteúdo: ${encodeURIComponent(currentShareExternalUrl)}`;
  }

  function closeShareModal() {
    shareModal.style.display = "none";
    shareBtn.focus();
  }

  storiesContainer.addEventListener("click", (e) => {
    const storyItem = e.target.closest(".story-item");
    if (storyItem) {
      e.preventDefault();
      const index = parseInt(storyItem.getAttribute("data-index"));
      showStory(index);
    }
  });

  closeModalBtn.addEventListener("click", closeModal);
  shareBtn.addEventListener("click", openShareModal);
  closeShareModalBtn.addEventListener("click", closeShareModal);

  copyLinkShareBtn.addEventListener("click", () => {
    // AQUI USAMOS currentShareExternalUrl (O LINK DO METACAMPO)
    navigator.clipboard.writeText(currentShareExternalUrl)
      .then(() => {
        copyFeedback.textContent = 'Link copiado!';
        copyFeedback.classList.add('show');
        setTimeout(() => {
          copyFeedback.classList.remove('show');
        }, 2000);
      })
      .catch(err => {
        console.error('Erro ao copiar link: ', err);
        copyFeedback.textContent = 'Erro ao copiar!';
        copyFeedback.classList.add('show');
        setTimeout(() => {
          copyFeedback.classList.remove('show');
        }, 2000);
      });
  });

  likeBtn.addEventListener("click", () => {
    const storyId = currentIndex.toString();
    let likes = getLikes(storyId);

    if (likeBtn.classList.contains("liked")) {
      likes = 0;
    } else {
      likes = 1;
    }

    saveLikes(storyId, likes);
    updateLikeUI(storyId);
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  shareModal.addEventListener("click", (e) => {
    if (e.target === shareModal) {
      closeShareModal();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (shareModal.style.display === "flex") {
        closeShareModal();
      } else if (modal.style.display === "flex") {
        closeModal();
      }
    }
  });

  document.addEventListener("keydown", (e) => {
    if (modal.style.display === "flex" && shareModal.style.display !== "flex") {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        showStory(currentIndex + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        showStory(currentIndex - 1);
      }
    }
  });

  if (storiesContainer) {
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

  if (prevStoryBtn) {
    prevStoryBtn.addEventListener("click", () => showStory(currentIndex - 1));
  }
  if (nextStoryBtn) {
    nextStoryBtn.addEventListener("click", () => showStory(currentIndex + 1));
  }

  let touchStartX = 0;
  let touchEndX = 0;
  let touchStartY = 0;
  let touchEndY = 0;
  const minSwipeDistance = 50;
  const maxVerticalScroll = 30;

  modalMedia.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
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
    const swipeDistanceY = Math.abs(touchEndY - touchStartY);

    if (modal.style.display === "flex" && shareModal.style.display !== "flex") {
      if (swipeDistanceY > maxVerticalScroll) {
        startProgress(storyDuration);
        return;
      }

      if (swipeDistanceX > minSwipeDistance) {
        showStory(currentIndex - 1);
      } else if (swipeDistanceX < -minSwipeDistance) {
        showStory(currentIndex + 1);
      } else {
        startProgress(storyDuration);
      }
    }
  });

  // --- Lógica para Abrir história via URL com âncora (controle interno) ---
  function openStoryFromHash() {
    const hash = window.location.hash;
    if (hash.startsWith("#story-")) {
      const storyIdentifier = hash.substring(7); // Remove "#story-"
      let foundIndex = -1;

      // Tenta encontrar a história pelo handle (se existir)
      foundIndex = stories.findIndex(story => story.getAttribute("data-story-id-url") === storyIdentifier);

      if (foundIndex !== -1) {
        showStory(foundIndex);
      } else {
        // Se não encontrar por handle, tenta por índice (fallback)
        const indexAsNumber = parseInt(storyIdentifier);
        if (!isNaN(indexAsNumber) && indexAsNumber >= 0 && indexAsNumber < stories.length) {
            foundIndex = indexAsNumber;
            showStory(foundIndex);
        } else {
            console.warn(`Shopify Stories: Não foi possível encontrar a história para o identificador "${storyIdentifier}" na URL.`);
        }
      }
    }
  }

  // Chama a função ao carregar a página
  openStoryFromHash();

  // Opcional: Adicionar listener para mudanças na hash (ex: usuário muda a hash manualmente ou navega no histórico)
  window.addEventListener('hashchange', () => {
    if (window.location.hash.startsWith("#story-") && modal.style.display !== "flex") {
        openStoryFromHash();
    } else if (!window.location.hash && modal.style.display === "flex") {
        // Se a hash foi removida e o modal está aberto, feche-o
        closeModal();
    }
  });

});