document.addEventListener("DOMContentLoaded", () => {
  const stories = document.querySelectorAll(".story-item");
  if (!stories.length) return;

  let current = 0;
  let timer;

  function activateStory(index) {
    stories.forEach((el, i) => {
      el.classList.toggle("active", i === index);
    });
    const duration = parseInt(stories[index].dataset.duration || "5000", 10);
    clearTimeout(timer);
    timer = setTimeout(() => {
      nextStory();
    }, duration);
  }

  function nextStory() {
    current = (current + 1) % stories.length;
    activateStory(current);
    stories[current].scrollIntoView({ behavior: "smooth", inline: "center" });
  }

  activateStory(current);

  stories.forEach((story, index) => {
    story.addEventListener("click", (e) => {
      e.preventDefault();
      current = index;
      activateStory(index);
    });
  });
});
