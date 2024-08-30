// Selecting necessary elements
const prev = document.querySelector(".prev");
const next = document.querySelector(".next");
const slider = document.querySelector(".slider");
const slides = document.querySelectorAll(".slide");
const sliderController = document.querySelector(".slider-controller");

// Initial settings
let width = slides[0].getBoundingClientRect().width;
let index = 0;

// Clone first and last slides for the infinite loop effect
slider.insertAdjacentHTML("afterbegin", slides[slides.length - 1].outerHTML);
slider.insertAdjacentHTML("beforeend", slides[0].outerHTML);

const allSlides = document.querySelectorAll(".slider .slide");

slider.style.transform = `translateX(-${width}px)`;

// Create Navigation dots
for (let i = 0; i < slides.length; i++) {
  const dot = document.createElement("li");
  dot.classList.add("dot");
  if (i === 0) dot.classList.add("active");
  sliderController.appendChild(dot);
}

const dots = document.querySelectorAll(".dot");

// update the width on window resize
window.addEventListener("resize", () => {
  width = slides[0].getBoundingClientRect().width;
  setSliderPosition();
});

// Function to update the active dot based on the current index
function updateDots() {
  let actualIndex = index;
  if (index === slides.length) {
    actualIndex = 0;
  } else if (index === -1) {
    actualIndex = slides.length - 1;
  }

  dots.forEach((dot, i) => {
    if (i === actualIndex) {
      dot.classList.add("active");
    } else {
      dot.classList.remove("active");
    }
  });
}

// Function to set the slider's position without transition
function setSliderPosition() {
  slider.style.transition = "none";
  slider.style.transform = `translateX(-${(index + 1) * width}px)`;
}

// Consolidated function to move to a specific slide

function moveToSlide(i) {
  updateDots();

  slider.style.transition = "transform 0.5s ease-in-out";
  slider.style.transform = `translateX(-${(i + 1) * width}px)`;

  // After the transition ends, handle the infinte loop
  slider.addEventListener("transitionend", handleTransitionEnd);

  function handleTransitionEnd() {
    slider.removeEventListener("transitionend", handleTransitionEnd);
    if (i === slides.length) {
      index = 0;
      slider.style.transition = "none";
      slider.style.transform = `translateX(-${width}px)`;
    } else if (i === -1) {
      index = slides.length - 1;
      slider.style.transition = "none";
      slider.style.transform = `translateX(-${slides.length * width}px)`;
    }
  }
}

// Navigation arrows
next.addEventListener("click", () => {
  index++;
  moveToSlide(index);
});
prev.addEventListener("click", () => {
  index--;
  moveToSlide(index);
});

// Navigation dot
dots.forEach((dot, i) => {
  dot.addEventListener("click", () => {
    index = i;
    moveToSlide(index);
  });
});

// Dragging Functionality Variables
let isDragging = false;
let startPos = 0;
let currentTranslate = 0;
let prevTranslatePos = 0;
let animationId = 0;

//Event listeners for dragging
slider.addEventListener("mousedown", dragStart);
slider.addEventListener("touchstart", dragStart);
slider.addEventListener("mouseup", dragEnd);
slider.addEventListener("touchend", dragEnd);
slider.addEventListener("mouseleave", dragEnd);
slider.addEventListener("mousemove", drag);
slider.addEventListener("touchmove", drag);

function getPositionX(event) {
  return event.type.includes("mouse") ? event.pageX : event.touches[0].clientX;
}

// Function to start dragging
function dragStart(event) {
  isDragging = true;
  startPos = getPositionX(event);
  slider.classList.add("dragging");
  slider.style.transition = "none";

  const matrix = window.getComputedStyle(slider).transform;

  if (matrix !== "none") {
    const Values = matrix.split("(")[1].split(")")[0].split(",");
    currentTranslate = parseFloat(Values[4]);
  } else {
    currentTranslate = 0;
  }

  prevTranslatePos = currentTranslate;
  animationId = requestAnimationFrame(animation);
}

// Function to handle dragging
function drag(event) {
  if (isDragging) {
    const currentPosition = getPositionX(event);
    const delta = currentPosition - startPos;
    currentTranslate = prevTranslatePos + delta;
    setSliderPositionWhileDragging();
  }
}

// Function to end dragging
function dragEnd() {
  if (isDragging) {
    isDragging = false;
    cancelAnimationFrame(animationId);
    slider.classList.remove("dragging");

    const movedBy = currentTranslate - prevTranslatePos;

    if (movedBy < -100 && index < slides.length) {
      index++;
    } else if (movedBy > 100 && index > -1) {
      index--;
    }
    moveToSlide(index);
  }
}

// Function to set slider's position during dragging
function setSliderPositionWhileDragging() {
  slider.style.transform = `translateX(${currentTranslate}px)`;
  //   slider.style.transition = "transform 0.5s ease-in-out";
}

function animation() {
  if (isDragging) {
    requestAnimationFrame(animation);
  }
}

updateDots();
