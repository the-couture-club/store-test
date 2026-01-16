

const contents = document.querySelectorAll('.content');
const scrollContainer = document.querySelector('.anniversary-coming_soon section');
const scrollHeader = document.querySelector('header');
let tallest = null;
let maxHeight = 0;

contents.forEach(content => {
  const h = content.offsetHeight;
  if (h > maxHeight) {
    maxHeight = h;
    tallest = content;
  }
});

gsap.registerPlugin(ScrollTrigger);

contents.forEach(content => {
  const h = content.offsetHeight;
  gsap.to(content, {
    y: (scrollContainer.offsetHeight - h),
    ease: "none",
    scrollTrigger: {
      trigger: "section",
      start: "top " + scrollHeader.offsetHeight,
      end: "bottom bottom",
      scrub: true
    }
  });
});
