document.addEventListener("DOMContentLoaded", () => {
  const stories = document.querySelectorAll(".story-item");
  const viewer = document.querySelector(".story-viewer-overlay");
  const viewerContent = document.querySelector(".story-media-container");
  const viewerTitle = document.querySelector(".story-title-overlay");
  const closeBtn = document.querySelector(".close-viewer");

  if (!stories.length) return;

  stories.forEach(story => {
    story.addEventListener("click", (e) => {
      e.preventDefault();
      const img = story.querySelector("img");
      const video = story.querySelector("video");
      const title = story.querySelector(".story-title")?.textContent || "";

      viewerContent.innerHTML = "";

      if (img) {
        const cloneImg = img.cloneNode();
        viewerContent.appendChild(cloneImg);
      } else if (video) {
        const cloneVideo = video.cloneNode();
        cloneVideo.controls = true;
        cloneVideo.autoplay = true;
        viewerContent.appendChild(cloneVideo);
      }

      viewerTitle.textContent = title;
      viewer.style.display = "flex";
    });
  });

  closeBtn.addEventListener("click", () => {
    viewer.style.display = "none";
    viewerContent.innerHTML = "";
  });

  viewer.addEventListener("click", (e) => {
    if (e.target === viewer) {
      viewer.style.display = "none";
      viewerContent.innerHTML = "";
    }
  });
});
