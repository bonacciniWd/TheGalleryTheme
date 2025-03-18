document.addEventListener("DOMContentLoaded", () => {
  const gridItems = document.querySelectorAll(".parent > div");

  gridItems.forEach((item, index) => {
    item.style.gridArea = getGridArea(index + 1);
  });
});

function getGridArea(index) {
  const areas = {
    1: "1 / 1 / 4 / 3",
    2: "1 / 5 / 3 / 7",
    3: "3 / 5 / 5 / 7",
    4: "5 / 5 / 7 / 7",
    5: "1 / 3 / 4 / 5",
    6: "4 / 1 / 7 / 5"
  };
  return areas[index] || "auto";
}
