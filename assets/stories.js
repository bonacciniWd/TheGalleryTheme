document.addEventListener("DOMContentLoaded", () => {
  const stories = Array.from(document.querySelectorAll(".story-item"));
  const wrapper = document.querySelector(".stories-wrapper");
  const modal = document.getElementById("story-modal");
  const modalMedia = document.getElementById("story-media");
  const modalTitle = document.getElementById("story-modal-title");
  const closeModalBtn = document.getElementById("close-modal");
  const progressFill = modal.querySelector(".story-progress-fill");
  const likeButton = document.getElementById("like-button");
  const likeCountSpan = document.getElementById("like-count");
  const viewCountSpan = document.getElementById("view-count");

  let currentIndex = 0;
  let timer = null;
  let progressInterval = null;
  const storyDuration = 15000; // 15s

  if (!stories.length || !wrapper) return;

  // LocalStorage keys prefix
  const likeKeyPrefix = "story_like_";
  const viewKeyPrefix = "story_view_";

  function getLikes(storyId) {
    return Number(localStorage.getItem(likeKeyPrefix + storyId)) || 0;
  }

  function setLikes(storyId, value) {
    localStorage.setItem(likeKeyPrefix + storyId, value);
  }

  function getViews(storyId) {
    return Number(localStorage.getItem(viewKeyPrefix + storyId)) || 0;
  }

  function setViews(storyId, value) {
    localStorage.setItem(viewKeyPrefix + storyId, value);
  }

  function updateLikeButton(storyId) {
    const liked = getLikes(storyId) > 0;
    if (liked) {
      likeButton.classList.add("liked");
    } else {
      likeButton.classList.remove("liked");
    }
    likeCountSpan.textContent = getLikes(storyId);
  }

  function updateViewCount(storyId) {
    viewCountSpan.textContent = "👁️ " + getViews(storyId);
  }

  function animateProgress(duration) {
    progressFill.style.transition = "none";
    progressFill.style.width = "0%";

    // Force reflow to restart animation
    void progressFill.offsetWidth;

    progressFill.style.transition = `width ${duration}ms linear`;
    progressFill.style.width = "100%";
  }

  function showStory(index) {
    if (index < 0 || index >= stories.length) {
      closeModal();
      return;
    }

    currentIndex = index;

    const story = stories[index];
    const storyId = story.getAttribute("data-id");
    const title = story.querySelector(".story-title").textContent;
    const imageUrl = story.getAttribute("data-image");
    const videoUrl = story.getAttribute("data-video");

    modalTitle.textContent = title;
    modalMedia.innerHTML = "";

    // Increment view count only once per session per story
    if (!sessionStorage.getItem("viewed_" + storyId)) {
      setViews(storyId, getViews(storyId) + 1);
      sessionStorage.setItem("viewed_" + storyId, "true");
    }

    updateViewCount(storyId);
    updateLikeButton(storyId);

    if (videoUrl) {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.controls = false;
      video.autoplay = true;
      video.muted = true;
      video.playsInline = true;
      video.style.width = "100%";
      video.style.height = "100%";
      video.style.objectFit = "cover";

      modalMedia.appendChild(video);

      video.onended = () => {
        nextStory();
      };

      clearTimeout(timer);
      timer = setTimeout(nextStory, storyDuration);

      animateProgress(storyDuration);
    } else if (imageUrl) {
      const img = document.createElement("img");
      img.src = imageUrl;
      modalMedia.appendChild(img);

      clearTimeout(timer);
      timer = setTimeout(nextStory, storyDuration);

      animateProgress(storyDuration);
    } else {
      closeModal();
    }

    // Atualizar botão de curtida com o story atual
    likeButton.onclick = () => {
      let likes = getLikes(storyId);
      if (likes > 0) {
        // unlike
        setLikes(storyId, 0);
      } else {
        // like
        setLikes(storyId, 1);
      }
      updateLikeButton(storyId);
    };

    modal.style.display = "flex";
  }

  function nextStory() {
    showStory(currentIndex + 1);
  }

  function closeModal() {
    modal.style.display = "none";
    modalMedia.innerHTML = "";
    clearTimeout(timer);
    progressFill.style.transition = "none";
    progressFill.style.width = "0%";
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
