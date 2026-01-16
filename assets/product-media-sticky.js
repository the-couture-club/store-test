class ProductMediaSticky extends HTMLElement {
  #ticking;
  #topGap;
  #maxDisplacement;
  #scrollPosition;
  #intersectionObserver;

  constructor() {
    super();

    this.#topGap = 12;
    this.#intersectionObserver = null;
  }

  connectedCallback() {
    const scrollListener = () => {
      if (!this.#ticking) {
        window.requestAnimationFrame(() => {
          this.#setStickyDisplacement();
          this.#ticking = false;
        });

        this.#ticking = true;
      }
    }

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          window.addEventListener('scroll', scrollListener);
        } else {
          window.removeEventListener('scroll', scrollListener);
        }
      });
    }

    const debounce = (f, delay) => {
      let timer = 0;
      return (...args) => {
          clearTimeout(timer);
          timer = setTimeout(() => f.apply(this, args), delay);
      };
    }

    const updateMaxDisplacement = () => {
      this.#maxDisplacement = window.innerHeight - this.offsetHeight;
    }

    const updateObserver = () => {
      this.#setTopGap();

      updateMaxDisplacement();
      this.#scrollPosition = window.scrollY;

      this.#setStyles();

      if (window.innerHeight < this.offsetHeight) {
        if (!this.#intersectionObserver) {
          this.#intersectionObserver = new IntersectionObserver(
            handleIntersection.bind(this),
            {rootMargin: '0px'}
          );
        }
        this.#intersectionObserver.observe(this);
      } else if (window.innerHeight > this.offsetHeight && this.#intersectionObserver) {
        this.#intersectionObserver.disconnect();
        window.removeEventListener('scroll', scrollListener);
      }
    }

    updateObserver();
    window.addEventListener('resize', debounce(updateObserver, 100));

    const resizeObserver = new ResizeObserver(debounce(updateObserver, 100));

    resizeObserver.observe(this);
  }

  #setTopGap() {
    const header = document.querySelector('header');
    this.#topGap =
      header.getAttribute('data-sticky-header') === 'true' ?
        header.offsetHeight :
        12;
  }

  #setStyles() {
    this.style.display = 'block';
    this.style.position = 'sticky';
    this.style.top = `${this.#topGap}px`;
  }

  #setStickyDisplacement() {
    const stickyElementTop = Number(this.style.top.replace('px', ''));

    if (window.scrollY < this.#scrollPosition) {
      //Scroll up
      if (stickyElementTop < this.#topGap) {
        const topMath = stickyElementTop + this.#scrollPosition - window.scrollY;
        this.style.top = `${topMath}px`;

        if (topMath >= this.#topGap) {
          this.style.top = `${this.#topGap}px`;
        }

      } else if (stickyElementTop >= this.#topGap) {
        this.style.top = `${this.#topGap}px`;
      }
    } else {
      //Scroll down
      if (stickyElementTop > this.#maxDisplacement) {
        const topMath = stickyElementTop + this.#scrollPosition - window.scrollY;
        this.style.top = `${topMath}px`;
        
        if (topMath <= this.#maxDisplacement) {
          this.style.top = `${this.#maxDisplacement}px`;
        }
        
      } else if (stickyElementTop <= this.#maxDisplacement) {
        this.style.top = `${this.#maxDisplacement}px`;
      }
    }
    this.#scrollPosition = window.scrollY;
  }
}

customElements.define('product-media-sticky', ProductMediaSticky);
