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
    // Força reflow para aplicar a transição 'none' imediatamente
    void progressFill.offsetWidth;
    progressFill.style.transition = `width ${duration}ms linear`;
    progressFill.style.width = '100%';
    console.log(`[PROGRESS] Barra de progresso iniciada para ${duration}ms.`);
  }

  function resetProgress() {
    progressFill.style.transition = 'none';
    progressFill.style.width = '0%';
    console.log("[PROGRESS] Barra de progresso resetada.");
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
    // Interrompe qualquer mídia em reprodução antes de mostrar o próximo story
    const currentMedia = modalMedia.querySelector('video, img');
    if (currentMedia) {
        if (currentMedia.tagName === 'VIDEO') {
            currentMedia.pause();
            currentMedia.currentTime = 0; // Reseta o tempo do vídeo anterior
        }
        modalMedia.innerHTML = ''; // Limpa o conteúdo da mídia
    }
    clearTimeout(timer); // Limpa qualquer timer pendente

    if (index < 0 || index >= stories.length) {
      console.log(`[STORY NAV] Fim ou início dos stories. Fechando modal.`);
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
    console.log("DEBUG: Valor de data-external-link lido pelo JS:", currentShareExternalUrl);

    modalTitle.textContent = title;
    resetProgress(); // Reseta a barra de progresso para a nova história

    incrementView(storyId);
    updateLikeUI(storyId);
    updateViewUI(storyId);

    if (videoUrl) {
      console.log(`[STORY TYPE] Conteúdo é vídeo: ${videoUrl}`);
      const video = document.createElement("video");
      video.src = videoUrl;
      video.controls = false;
      video.autoplay = true; // Mantemos, mas confiamos no play() da Promise
      video.muted = true; // CRUCIAL: Mantenha MUTED para autoplay em iOS SEMPRE.
      video.playsInline = true; // CRUCIAL: Toca no próprio layout em iOS
      video.preload = "auto"; // Tenta carregar mais dados do vídeo
      video.style.maxWidth = "100%";
      video.style.maxHeight = "70vh";
      video.setAttribute("aria-label", `Conteúdo do story: ${title}`);
      modalMedia.appendChild(video);

      // --- NOVO: Overlay de Play para iOS ---
      const playOverlay = document.createElement('div');
      playOverlay.classList.add('video-play-overlay');
      playOverlay.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'; // Ícone de Play
      modalMedia.appendChild(playOverlay);
      playOverlay.style.display = 'none'; // Inicialmente oculto

      playOverlay.addEventListener('click', () => {
          console.log("[VIDEO PLAY OVERLAY] Clique no overlay de play.");
          playOverlay.style.display = 'none'; // Esconde o overlay
          video.play().then(() => {
              console.log("[VIDEO EVENT] Vídeo começou a reproduzir via overlay.");
              // Inicia o timer APENAS AGORA
              startProgress(video.duration * 1000);
              timer = setTimeout(() => {
                  showStory(currentIndex + 1);
              }, video.duration * 1000);
          }).catch(error => {
              console.error("[VIDEO ERROR] Erro ao tentar reproduzir vídeo via overlay:", error);
              // Se falhar mesmo com o clique no overlay, algo mais grave está errado.
              showStory(currentIndex + 1);
          });
      });
      // --- FIM NOVO: Overlay de Play ---

      // Listener para quando o vídeo estiver pronto para reproduzir (metadados carregados)
      video.onloadedmetadata = () => {
        console.log("[VIDEO EVENT] loadedmetadata: Metadados do vídeo carregados. Duração:", video.duration);
        video.play().then(() => {
          console.log("[VIDEO EVENT] Vídeo começou a reproduzir com sucesso (autoplay).");
          playOverlay.style.display = 'none'; // Esconde o overlay se autoplay funcionou
          startProgress(video.duration * 1000);
          timer = setTimeout(() => {
            showStory(currentIndex + 1);
          }, video.duration * 1000);
        }).catch(error => {
          // Se o autoplay falhar, mostre o overlay e não inicie o timer automático.
          console.error("[VIDEO ERROR] Erro ao tentar reproduzir o vídeo após loadedmetadata:", error);
          if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
              console.warn("[VIDEO WARN] Autoplay bloqueado pelo navegador. Mostrando botão de play.");
              playOverlay.style.display = 'flex'; // Mostra o overlay para o usuário clicar
              // NÃO INICIE O TIMER AQUI, pois o vídeo não está tocando.
              // O timer só começará quando o usuário clicar no playOverlay.
          } else {
              // Outros erros de play que não são NotAllowedError (ex: codec, corrupção de arquivo)
              console.error("[VIDEO ERROR] Outro erro de reprodução, pulando story.");
              showStory(currentIndex + 1);
          }
        });
      };

      // Listener para quando o vídeo terminar (normalmente)
      video.onended = () => {
        console.log("[VIDEO EVENT] Vídeo terminou a reprodução.");
        clearTimeout(timer);
        showStory(currentIndex + 1);
      };

      // Listener para erros de carregamento do arquivo de vídeo
      video.onerror = (e) => {
        console.error(`[VIDEO ERROR] Erro fatal ao carregar vídeo: ${videoUrl}`);
        console.error("[VIDEO ERROR] Detalhes do erro de vídeo:", e);
        // Se um erro fatal ocorrer (não apenas autoplay bloqueado), pule o story.
        showStory(currentIndex + 1);
      };

    } else if (imageUrl) {
      console.log(`[STORY TYPE] Conteúdo é imagem: ${imageUrl}`);
      const img = document.createElement("img");
      img.src = imageUrl;
      img.alt = title;
      img.style.maxWidth = "100%";
      img.style.maxHeight = "70vh";
      img.setAttribute("aria-label", `Conteúdo do story: ${title}`);
      modalMedia.appendChild(img);

      // Inicia o progresso da imagem imediatamente
      startProgress(storyDuration);
      timer = setTimeout(() => {
        showStory(currentIndex + 1);
      }, storyDuration);

      img.onerror = () => {
        console.error(`[IMAGE ERROR] Erro ao carregar imagem: ${imageUrl}`);
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
    console.log("[MODAL] Fechando modal.");
    const currentMedia = modalMedia.querySelector('video, img');
    if (currentMedia) {
        if (currentMedia.tagName === 'VIDEO') {
            currentMedia.pause();
            currentMedia.currentTime = 0; // Reseta o tempo do vídeo
        }
    }
    modal.style.display = "none";
    modalMedia.innerHTML = "";
    resetProgress();
    clearTimeout(timer);

    // Remove a âncora da URL ao fechar o modal
    history.replaceState(null, null, window.location.origin + window.location.pathname);

    // Tenta focar no elemento da história que foi fechado
    document.querySelector(`.story-item[data-index="${currentIndex}"]`)?.focus();
  }

  function openShareModal() {
    console.log("[SHARE] Abrindo modal de compartilhamento. URL:", currentShareExternalUrl);
    shareModal.style.display = "flex";
    shareModal.focus();
    // AQUI USAMOS currentShareExternalUrl (O LINK DO METACAMPO)
    whatsappShareBtn.href = `https://api.whatsapp.com/send?text=Confira este conteúdo: ${encodeURIComponent(currentShareExternalUrl)}`;
    // Instagram não permite compartilhamento direto para o feed via URL. Apenas link na bio ou copiar link.
    // Você pode direcionar para uma mensagem direta, mas geralmente é copiar link.
    instagramShareBtn.href = "#"; // Não muda a URL do Instagram link, apenas copiar link funciona.
  }

  function closeShareModal() {
    console.log("[SHARE] Fechando modal de compartilhamento.");
    shareModal.style.display = "none";
    shareBtn.focus();
  }

  storiesContainer.addEventListener("click", (e) => {
    const storyItem = e.target.closest(".story-item");
    if (storyItem) {
      e.preventDefault();
      const index = parseInt(storyItem.getAttribute("data-index"));
      console.log(`[CLICK] Clicado na história com índice: ${index}`);
      showStory(index);
    }
  });

  closeModalBtn.addEventListener("click", closeModal);
  shareBtn.addEventListener("click", openShareModal);
  closeShareModalBtn.addEventListener("click", closeShareModal);

  copyLinkShareBtn.addEventListener("click", () => {
    // AQUI USAMOS currentShareExternalUrl (O LINK DO METACAMPO)
    console.log("[SHARE] Copiando link:", currentShareExternalUrl);
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
      likes = 0; // Descurtir
    } else {
      likes = 1; // Curtir (ou pode ser likes++ para múltiplos likes)
    }

    saveLikes(storyId, likes);
    updateLikeUI(storyId);
    console.log(`[LIKE] História ${storyId} - Likes: ${likes}`);
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
      // Pause o timer e o vídeo ao iniciar o toque, para não avançar durante o swipe
      clearTimeout(timer);
      resetProgress();
      const currentVideo = modalMedia.querySelector('video');
      if (currentVideo) {
          currentVideo.pause();
          console.log("[TOUCH] Vídeo pausado durante touchstart.");
      }
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
        // Se for um scroll vertical, reinicia o progresso e o vídeo (se houver)
        console.log("[TOUCH] Detectado rolagem vertical. Reiniciando progresso.");
        const currentVideo = modalMedia.querySelector('video');
        if (currentVideo) {
            currentVideo.play().catch(e => console.error("Erro ao tentar reproduzir vídeo após rolagem:", e));
        }
        startProgress(currentVideo ? currentVideo.duration * 1000 : storyDuration);
        return; // É um scroll, não um swipe de story
      }

      // Se for um swipe horizontal
      if (swipeDistanceX > minSwipeDistance) { // Swipe para a direita (voltar)
        console.log("[TOUCH] Detectado swipe para a direita. História anterior.");
        showStory(currentIndex - 1);
      } else if (swipeDistanceX < -minSwipeDistance) { // Swipe para a esquerda (próximo)
        console.log("[TOUCH] Detectado swipe para a esquerda. Próxima história.");
        showStory(currentIndex + 1);
      } else {
        // Se não for um swipe significativo, reinicia o progresso e o vídeo
        console.log("[TOUCH] Nenhum swipe detectado. Reiniciando progresso.");
        const currentVideo = modalMedia.querySelector('video');
        if (currentVideo) {
            currentVideo.play().catch(e => console.error("Erro ao tentar reproduzir vídeo após tap/sem swipe:", e));
        }
        startProgress(currentVideo ? currentVideo.duration * 1000 : storyDuration);
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
        console.log(`[HASH] Abrindo história por handle/ID da URL: ${storyIdentifier}`);
        showStory(foundIndex);
      } else {
        // Se não encontrar por handle, tenta por índice (fallback)
        const indexAsNumber = parseInt(storyIdentifier);
        if (!isNaN(indexAsNumber) && indexAsNumber >= 0 && indexAsNumber < stories.length) {
            foundIndex = indexAsNumber;
            console.log(`[HASH] Abrindo história por índice da URL: ${indexAsNumber}`);
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
        console.log("[HASHCHANGE] Hash com story detectada, modal fechado. Abrindo story.");
        openStoryFromHash();
    } else if (!window.location.hash && modal.style.display === "flex") {
        // Se a hash foi removida e o modal está aberto, feche-o
        console.log("[HASHCHANGE] Hash removida, modal aberto. Fechando modal.");
        closeModal();
    }
  });

});