class ItemsScroll extends HTMLElement {
  items;
  scrollBar;
  scrollBarTrack;
  navigationContainer;
  navigationPrevButton;
  navigationNextButton;

  #ticking;
  #isScrollBarDragged;
  #lastKnownDragPosition;
  #lastKnownItemsPosition;
  #boundItemsScroll;
  #boundScrollTrackClick;
  #boundScrollBarDrag;
  #controlsListenersEnabled;
  #boundPrevNavigationAction;
  #boundNextNavigationAction;
  #isNavigating;
  #scrollBarTrackToViewportRatio;

  constructor() {
    super();

    this.items = this.querySelector('[data-items]');
    this.scrollBar = null;
    this.minimumScrollBarWidth = Number(this.dataset.minimumScrollBarWidth || '24');
    this.breakpoints = {
      mob: 480,
      phab: 560,
      tab: 768,
      desk: 980
    };
    this.breakpointMin = Object.keys(this.breakpoints).includes(this.getAttribute('breakpoint-min')) ?
      this.breakpoints[this.getAttribute('breakpoint-min')] :
      Number(this.getAttribute('breakpoint-min') || '0');
    this.breakpointMax = Object.keys(this.breakpoints).includes(this.getAttribute('breakpoint-max')) ?
      this.breakpoints[this.getAttribute('breakpoint-max')] :
      Number(this.getAttribute('breakpoint-max') || 'Infinity');
    this.scrollBarTrack = null;
    this.navigationContainer = null;
    this.navigationPrevButton = null;
    this.navigationNextButton = null;

    this.#ticking = false;
    this.#isScrollBarDragged = false;
    this.#lastKnownDragPosition = 0;
    this.#lastKnownItemsPosition = 0;
    this.#scrollBarTrackToViewportRatio = 1;

    this.#boundItemsScroll = null;
    this.#boundScrollTrackClick = null;
    this.#boundScrollBarDrag = null;
    this.#boundPrevNavigationAction = null;
    this.#boundNextNavigationAction = null;

    this.#isNavigating = false;

    this.#controlsListenersEnabled = false;
  }

  connectedCallback() {
    if (!this.items) throw Error('Items container missing');

    const debounce = (f, delay) => {
      let timer = 0;
      return (...args) => {
          clearTimeout(timer);
          timer = setTimeout(() => f.apply(this, args), delay);
      };
    }

    const resizeObserver = new ResizeObserver(debounce(() => {
      this.#updateControls();
    }), 50);

    resizeObserver.observe(this.items);

    const options = {
      root: this.items,
      rootMargin: '0px',
      threshold: 1
    };

    const intersectionObserver = new IntersectionObserver((entries) => {
      if (this.navigationContainer) {
        entries.forEach(({ target, isIntersecting}) => {
          if (!target.previousElementSibling) this.navigationPrevButton.disabled = isIntersecting;
          if (!target.nextElementSibling) this.navigationNextButton.disabled = isIntersecting;
        });
      }
    }, options);

    intersectionObserver.observe(this.items.firstElementChild);
    intersectionObserver.observe(this.items.lastElementChild);
  }

  #getItemAtScroll() {
    // Get item at scroll, only works when all items have equal width
    const itemsComputedStyle = window.getComputedStyle(this.items);
    const itemsGap = Number(itemsComputedStyle.getPropertyValue('column-gap').replace('px', ''));

    const itemComputedStyle = window.getComputedStyle(this.items.firstElementChild);
    const itemMarginLeft = Number(itemComputedStyle.getPropertyValue('margin-left').replace('px', ''));
    const itemMarginRight = Number(itemComputedStyle.getPropertyValue('margin-right').replace('px', ''));

    // Intersection Observer might be better, test
    const itemAtScroll =
      Array.from(this.items.children)[
        Math.round(this.items.scrollLeft /
        (
          itemMarginLeft +
          this.items.firstElementChild.getBoundingClientRect().width +
          itemMarginRight +
          itemsGap
        ))
      ];

    return itemAtScroll;
  }

  #handleItemsScroll({ target }) {
    const position = target.scrollLeft / target.scrollWidth * this.scrollBarTrack.offsetWidth / this.#scrollBarTrackToViewportRatio;

    if (!this.#ticking) {
      window.requestAnimationFrame(() => {
        this.#moveScrollBar(position);
        this.#ticking = false;
      });

      this.#ticking = true;
    }
  }

  #createScrollBar() {
    const scrollBarTrack = document.createElement('div');
    const scrollBar = document.createElement('div');

    scrollBarTrack.classList.add('scroll-track');
    scrollBar.classList.add('scroll-bar');

    scrollBarTrack.appendChild(scrollBar);

    this.appendChild(scrollBarTrack);

    this.scrollBar = scrollBar;
    this.scrollBarTrack = scrollBarTrack;
  }

  #handleScrollTrackClick(e) {
    const {target, offsetX} = e;
    if (target.classList.contains('scroll-bar') || this.#isScrollBarDragged) return;

    let itemsScrollX =
      offsetX / this.scrollBarTrack.offsetWidth * this.items.scrollWidth -
      this.scrollBarTrack.offsetWidth;

    this.#moveItems(itemsScrollX, 'smooth');
  }

  #handleScrollBarDrag(e) {
    if (!e.target.classList.contains('scroll-bar')) return;

    e.preventDefault();

    const { offsetX } = e;
    const initialMousePositionOnScrollBar = offsetX - this.scrollBar.scrollLeft;

    const mouseMoveHandler = (e) => {
      e.preventDefault();

      const { x } = e;

      if (x < this.scrollBarTrack.getBoundingClientRect().left + initialMousePositionOnScrollBar ||
          x > this.scrollBarTrack.getBoundingClientRect().right - (this.scrollBar.offsetWidth - initialMousePositionOnScrollBar)) return;

      this.#lastKnownDragPosition = x - this.scrollBarTrack.getBoundingClientRect().left - initialMousePositionOnScrollBar;
      this.#lastKnownItemsPosition = this.items.scrollWidth * (x - this.scrollBarTrack.getBoundingClientRect().left - initialMousePositionOnScrollBar) / this.scrollBarTrack.offsetWidth;

      if (!this.#ticking) {
        window.requestAnimationFrame(() => {
          this.#moveScrollBar(this.#lastKnownDragPosition);
          this.#moveItems(this.#lastKnownItemsPosition * this.#scrollBarTrackToViewportRatio);
          this.#ticking = false;
        });

        this.#ticking = true;
      }
    }

    this.#isScrollBarDragged = true;
    this.classList.add('is-dragged');

    document.addEventListener('pointermove', mouseMoveHandler, {passive: false});

    document.addEventListener('pointerup', (e) => {
      e.preventDefault();

      this.#isScrollBarDragged = false;

      // Intersection Observer might be better, test
      const itemAtScroll = this.#getItemAtScroll();

      this.smoothScrollItems(itemAtScroll.offsetLeft).then(
          () => {
            this.classList.remove('is-dragged');
          },
          (position) => {
            this.items.scrollTo({
              left: position,
              behavior: 'instant'
            });
          }
        ).catch((error) => {
          console.log(error);
        });

      document.removeEventListener('pointermove', mouseMoveHandler);
    }, {once: true});
  }

  #createNavigation() {
    const navigationContainer = document.createElement('div');

    navigationContainer.classList.add('navigation');

    navigationContainer.innerHTML = `
      <button type="button" class="navigation__button navigation__button--prev" data-navigation-prev><i class="icon icon--left-l" aria-hidden="true"></i></button>
      <button type="button" class="navigation__button navigation__button--next" data-navigation-next><i class="icon icon--right-l" aria-hidden="true"></i></button>
    `;

    this.appendChild(navigationContainer);

    this.navigationContainer = navigationContainer;
    this.navigationPrevButton = navigationContainer.querySelector('[data-navigation-prev]');
    this.navigationNextButton = navigationContainer.querySelector('[data-navigation-next]');
  }

  #handlePrevNavigationAction(e) {
    e.preventDefault();

    if (this.#isNavigating) return;

    const itemAtScroll = this.#getItemAtScroll();
    const previousItem = itemAtScroll.previousElementSibling;

    if (previousItem) {
      this.#isNavigating = true;
      this.classList.add('is-scrolling');

      this.smoothScrollItems(previousItem.offsetLeft)
        .finally(() => {
          this.#isNavigating = false;
          this.classList.remove('is-scrolling');
        });
    }
  }

  #handleNextNavigationAction(e) {
    e.preventDefault();

    if (this.#isNavigating) return;

    const itemAtScroll = this.#getItemAtScroll();
    const nextItem = itemAtScroll.nextElementSibling;

    if (nextItem) {
      this.#isNavigating = true;
      this.classList.add('is-scrolling');

      this.smoothScrollItems(nextItem.offsetLeft)
        .finally(() => {
          this.#isNavigating = false;
          this.classList.remove('is-scrolling');
        });
    }
  }

  #enableControlsListeners() {
    if (this.#controlsListenersEnabled) return;

    this.#boundItemsScroll = this.#handleItemsScroll.bind(this);
    this.#boundScrollTrackClick = this.#handleScrollTrackClick.bind(this);
    this.#boundScrollBarDrag = this.#handleScrollBarDrag.bind(this);
    this.#boundPrevNavigationAction = this.#handlePrevNavigationAction.bind(this);
    this.#boundNextNavigationAction = this.#handleNextNavigationAction.bind(this);

    this.items.addEventListener('scroll', this.#boundItemsScroll);
    this.scrollBarTrack.addEventListener('click', this.#boundScrollTrackClick);
    this.scrollBar.addEventListener('pointerdown', this.#boundScrollBarDrag);
    this.navigationPrevButton.addEventListener('click', this.#boundPrevNavigationAction);
    this.navigationNextButton.addEventListener('click', this.#boundNextNavigationAction);

    this.#controlsListenersEnabled = true;
  }

  #disableControlsListeners() {
    if (!this.#controlsListenersEnabled) return;

    this.items.removeEventListener('scroll', this.#boundItemsScroll);
    this.scrollBarTrack.removeEventListener('click', this.#boundScrollTrackClick);
    this.scrollBar.removeEventListener('pointerdown', this.#boundScrollBarDrag);
    this.navigationPrevButton.removeEventListener('click', this.#boundPrevNavigationAction);
    this.navigationNextButton.removeEventListener('click', this.#boundNextNavigationAction);

    this.#controlsListenersEnabled = false;
  }

  #updateControls() {
    if (document.body.offsetWidth > this.breakpointMin &&
        document.body.offsetWidth <= this.breakpointMax) {
      this.setAttribute('scroll-enabled', '');
    } else {
      this.removeAttribute('scroll-enabled');
    }

    if (this.hasAttribute('scroll-enabled') && this.items.scrollWidth > this.items.offsetWidth) {
      this.setAttribute('scrollable', '');

      if (!this.navigationContainer) this.#createNavigation();
      if (!this.scrollBarTrack) this.#createScrollBar();

      this.#setScrollBarWidth();

      const position = this.items.scrollLeft / this.items.scrollWidth * this.scrollBarTrack.offsetWidth / this.#scrollBarTrackToViewportRatio;
      this.#moveScrollBar(position);

      if (this.items.children[0].offsetWidth > this.items.offsetWidth / 2) {
        this.setAttribute('snap', 'center');
      } else {
        this.setAttribute('snap', 'start');
      }

      this.#enableControlsListeners();
    } else {
      if (this.navigationContainer && this.scrollBarTrack) {
        this.#disableControlsListeners();
      }

      this.removeAttribute('scrollable', '');
    }
  }

  #setScrollBarWidth() {
    const itemsScrollWidth = this.items.scrollWidth;
    const itemsWidth = this.items.offsetWidth;
    const actualScrollBarWidth = itemsWidth / itemsScrollWidth * this.scrollBarTrack.offsetWidth;

    if (actualScrollBarWidth >= this.minimumScrollBarWidth) {
      this.scrollBar.style.width = `${actualScrollBarWidth}px`;
      this.#scrollBarTrackToViewportRatio = 1;
    } else {
      this.scrollBar.style.width = `${this.minimumScrollBarWidth}px`;
      // TODO: Investigate precision. Currently using '2' to fix end of scrollbar issues
      this.#scrollBarTrackToViewportRatio = (this.scrollBarTrack.offsetWidth + this.minimumScrollBarWidth - actualScrollBarWidth + 2) / this.scrollBarTrack.offsetWidth;
    }
  }

  #moveScrollBar(position) {
    this.scrollBar.style.transform = `translateX(${position}px)`;
  }

  #moveItems(position, behavior = 'instant') {
    let itemsScrollX = position;
    if (itemsScrollX < 0) {
      itemsScrollX = 0;
    } else if (itemsScrollX > this.items.scrollWidth - this.items.offsetWidth) {
      itemsScrollX = this.items.scrollWidth - this.items.offsetWidth;
    }

    if (behavior === 'instant') {
      this.items.scrollTo({
        behavior: 'instant',
        left: itemsScrollX
      });
    } else {
      this.#isNavigating = true;
      this.classList.add('is-scrolling');

      this.smoothScrollItems(itemsScrollX)
        .finally(() => {
          this.#isNavigating = false;
          this.classList.remove('is-scrolling');
        });
    }
  }

  smoothScrollItems(position) {
    return new Promise((resolve, reject) => {
      let same = 0;
      let lastPos = null;

      const check = () => {
        const newPos = this.items.scrollLeft;

        if (this.#isScrollBarDragged) return reject(newPos);

        if (newPos === lastPos) {
          if (same++ > 2) {
            return resolve(position);
          }
        } else {
          same = 0;
          lastPos = newPos;
        }

        window.requestAnimationFrame(check);
      }

      this.items.scrollTo({
        left: position,
        behavior: 'smooth'
      });

      window.requestAnimationFrame(check);
    });
  }
}
customElements.define('items-scroll', ItemsScroll);
