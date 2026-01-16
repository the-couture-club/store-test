/*-----------------------------------------------------------------------------/
/ Custom Theme JS
/-----------------------------------------------------------------------------*/

// Function Init - Global

window.addEventListener('load', function(event) {
  genderToggleInit();

}, true);

// Header Transform Event Listener

const container = document.querySelector("#main");
const header = document.getElementById('top');
const announcement = document.querySelector(".js-section__announcement").classList;

container.addEventListener('scroll', function() {
    if (container.scrollTop < 100 && header.getAttribute('data-transparent-header') == 'false') {
        header.setAttribute("data-transparent-header", "true");
        announcement.remove("js-hidden");
    } else if ( container.scrollTop > 100 && header.getAttribute('data-transparent-header') == 'true' ) {
        header.setAttribute("data-transparent-header", "false");
        announcement.add("js-hidden");
    }
});

// Homepage Scroll Button Functionality

$('.hero-image--content_scroll').on( "click", function() {
  document.getElementById('main').scroll({
    behavior: 'smooth',
    left: 0,
    top:  document.getElementById('main').scrollTop + 500
  });
} );

// Navigation Event Listeners

const childMenus = document.querySelectorAll('.mobile-nav__item--sub')

childMenus.forEach((menu) => {

  var submenu = menu.querySelector('.mobile-nav_submenu');
  
  menu.addEventListener('click', () => {

    if (menu.getAttribute('aria-expanded') == 'false') {

      gsap.to(submenu, {
        height:'0',
        opacity: 0,
        duration: 0.3,
       });

    } else {

      gsap.to(submenu, {
        height:'auto',
        opacity: 1,
        duration: 0.3,
       });

    }

  });

  if(menu.getAttribute('href') == '#load') {
    gsap.to(submenu, {
        height:'auto',
        opacity: 1,
        duration: 0.3,
    });
  }

});

// Navigation Sub Menu Back Button

const backbutton = document.querySelectorAll('.js-back-mfp');

backbutton.forEach((button) => {
  button.addEventListener('click', () => {

    var currentNav = button.closest('[data-navigation]');
    var parentmenu = document.querySelector('[data-menu="active"][data-level="1"]');
    

    gsap.to(currentNav, {
      onStart: function() { },
      left:"100%",
      duration: 0.3,
      ease: "none",
      onComplete: function() { }
    });

    gsap.to('[data-menu="active"][data-level="1"], [data-navigation="root"]', {
      onStart: function() { },
      left:"0%",
      duration: 0.3,
      ease: "none",
      onComplete: function() { }
    });
    
  });
});



// One listener for all current/future .js-collection-load-next buttons
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.js-collection-load-next');
  if (!btn) return;                 // clicked something else
  if (btn.dataset.loading === '1') return; // simple guard against double-clicks
  btn.dataset.loading = '1';

  let here = new URL(window.location.href);
  const pagesCount = Number(
    document.querySelector('.collection-pagination')?.dataset.pages ?? 1
  );

  const currentPage = Number(here.searchParams.get('page') ?? 1);
  const nextPage = currentPage + 1;

  // Remove/disable when we hit the end
  if (nextPage >= pagesCount) {
    var isLast = true
  } else {
    var isLast = false
  }

  if (nextPage <= pagesCount) {
    here.searchParams.set('page', String(nextPage));
    history.pushState({}, document.title, here.href);
    try {
      await fetchNextPage(isLast); // your existing function
    } finally {
      btn.dataset.loading = '0';
    }
  }
});


// Load Next Page

function fetchNextPage(isLast) {

  let btn = document.querySelector('.js-collection-load-next')
  btn.classList.add('page-loading');

  fetch(window.location.href, {
    headers: {
        'Accept': 'text/html'
    }
  })
  .then(function(response) {
    return response.text()
  })
  .then(function(html) {
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, "text/html");
    var html = doc.querySelector('.collection__cards');
    prodResize(html, 'loadMore');
    document.querySelector("#collection-main > div.collection-products.collection-products--sort-enabled > div > div.o-layout__item.u-1\\/1 > div.collection__cards.o-layout.o-layout--small.o-layout--small\\@tab-down").insertAdjacentHTML("beforeend", html.innerHTML);
    scrollSnapInit();
    var loadedProducts = html.querySelectorAll('[data-product-grid]').length
    updateProductsLoaded(loadedProducts);
    const forms = document.querySelectorAll('form[action^="/cart/add"]:not(.initialised)'); Array.from(forms).forEach((form) => window.ajaxCart.initForm(form) ); Array.from(forms).forEach((form) => form.classList.add('initialised') );
    collectionSpotsResize();
    CollectionGAEvents();
    quickbuyGA();
    document.dispatchEvent(new CustomEvent("swym:collections-loaded"));
    btn.classList.remove('page-loading');
    initPageClick();
    if(isLast){btn.remove();};

  })

}

// Works with dynamic content via event delegation
function initPageClick() {
  // If you have a stable wrapper, use it instead of document for better perf:
  // const root = document.querySelector('[data-product-list]');
  const root = document;

  root.addEventListener('click', (e) => {
    const product = e.target.closest('[data-product-grid]');
    if (!product || !root.contains(product)) return;

    // If you truly want to block multiple pushes for the same element in one session, keep this.
    // Otherwise remove this guard.
    if (product.classList.contains('initialised')) return;

    const page = product.getAttribute('data-page');
    const prodId = product.querySelector('.product-card')?.getAttribute('data-product-id');

    const url = new URL(location.href);
    if (page) url.searchParams.set('page', page);
    if (prodId) url.searchParams.set('product', prodId);

    history.pushState(null, document.title, url.href);

    product.classList.add('initialised');
  }, { passive: true });
}


// Load Previous Page

var loadButton = document.querySelector('.js-collection-load-previous');
let here = new URL(window.location.href);
var currentPage = parseInt(here.searchParams.get('page'));

if (loadButton != null) {

  loadButton.addEventListener('click', function() {

    loadButton.classList.add('page-loading');

      currentPage = currentPage - 1;
      here.searchParams.set('page', currentPage);


      fetch(here.href, {
        headers: {
            'Accept': 'text/html'
        }
      })
      .then(function(response) {
        return response.text()
      })
      .then(function(html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, "text/html");
        var html = doc.querySelector('.collection__cards');
        prodResize(html, 'loadMore');
         initPageClick();
        var heightBefore = document.querySelector("#collection-main > div.collection-products.collection-products--sort-enabled > div > div.o-layout__item.u-1\\/1 > div.collection__cards.o-layout.o-layout--small.o-layout--small\\@tab-down").offsetHeight;
        document.querySelector("#collection-main > div.collection-products.collection-products--sort-enabled > div > div.o-layout__item.u-1\\/1 > div.collection__cards.o-layout.o-layout--small.o-layout--small\\@tab-down").insertAdjacentHTML("afterbegin", html.innerHTML);
        var heightAfter = document.querySelector("#collection-main > div.collection-products.collection-products--sort-enabled > div > div.o-layout__item.u-1\\/1 > div.collection__cards.o-layout.o-layout--small.o-layout--small\\@tab-down").offsetHeight;
        const y = window.pageYOffset + (heightAfter - heightBefore);
        document.querySelector('html').scrollTop = y;
        loadButton.classList.remove('page-loading');

        // Initialise PDP with new products

        scrollSnapInit();
        const forms = document.querySelectorAll('form[action^="/cart/add"]:not(.initialised)'); Array.from(forms).forEach((form) => window.ajaxCart.initForm(form) ); Array.from(forms).forEach((form) => form.classList.add('initialised') );
        collectionSpotsResize();
        CollectionGAEvents();
        quickbuyGA();
        document.dispatchEvent(new CustomEvent("swym:collections-loaded"));

        if (currentPage <= 1) {
          loadButton.remove();
        }

      })

  }, false);

}

// Collection Spot Resize

function collectionSpotsResize() {

    var contentContainers = document.querySelectorAll('.hero-image--container');

    contentContainers.forEach((container) => {
      var height = document.querySelector('.product-card__media').clientHeight;
      container.style.height = height + 'px';
    });
}

// Starts Collection Loading Animation

function startCollectionLoad() {
  var collectionElement = document.querySelector('dynamic-product-search.collection');
  var docElement = document.querySelector('html');
  collectionElement.classList.add("is-loading");
  docElement.classList.add("no-scroll");
  
}

// Ends Collection Loading Animation

function endCollectionLoad() {
  var collectionElement = document.querySelector('dynamic-product-search.collection');
  var docElement = document.querySelector('html');
  collectionElement.classList.remove("is-loading");
  docElement.classList.remove("no-scroll");
}

// Initialise Custom Sort Filter

function sortInit() {
  let radioVal;
  const radios = document.querySelectorAll('input[name="sort_by"]');
  radios.forEach(radio => {
    radio.addEventListener('click', function () {
      radioVal = radio.value;
      document.getElementById('SortBy').value=radioVal;
      radios.forEach(option => {
        option.removeAttribute('checked');
      });
      this.setAttribute('checked', '')
    });
  });
}

// Updates Product Count on PDP

function updateProductsLoaded(products) {

  var totalProducts = parseInt(document.getElementById('loaded-products').innerHTML) + products

  document.getElementById('loaded-products').innerHTML = totalProducts
}

// Initialises PDP Resize Buttons

function resizeButtons(e) {


var gridButtons = document.querySelectorAll('.collection-main__bar--grid [data-grid]');

gridButtons.forEach(button => {
  button.removeAttribute('selected')
});

if (e == 'initialLoad') {
  var storageState = sessionStorage.getItem('grid');
  if (storageState == 'enabled') {
    document.querySelector('.collection-main__bar--grid [data-grid="1"]').setAttribute('selected', '');
    document.querySelector('.collection-main__bar--grid [data-grid="2"]').removeAttribute('selected');
  } else {
    document.querySelector('.collection-main__bar--grid [data-grid="2"]').setAttribute('selected', '');
    document.querySelector('.collection-main__bar--grid [data-grid="1"]').removeAttribute('selected');
  }
}

gridButtons.forEach(button => {
  button.addEventListener('click', function () {

    gridButtons.forEach(button => {
      button.removeAttribute('selected')
    });

    if(button.getAttribute('data-grid') == 1) {
      prodResize(document, 1);
      sessionStorage.setItem('grid', 'enabled');
      button.setAttribute('selected', '');
      Shopify.ActiveProduct[0].scrollIntoView();
    } else {
      prodResize(document, 2);
      sessionStorage.removeItem('grid');
      button.setAttribute('selected', '');
      Shopify.ActiveProduct[0].scrollIntoView();
    }
    setTimeout(() => {
      window.dispatchEvent(new Event('resize'));
    }, 300);
  });
});

}

// Function for resizing PDP content

function prodResize(doc ,key) {
  var productGrid = doc.querySelectorAll('[data-product-grid]');

  if (key == 'loadMore') {
    var gridButtonActive = document.querySelector('.collection-main__bar--grid [data-grid][selected]');
    key = gridButtonActive.getAttribute('data-grid');
  }

  if (key == 'initalLoad') {
    var storageState = sessionStorage.getItem('grid');
    if (storageState == 'enabled') {
      key = 1
    }
  }

  var gridElem = document.querySelector('.collection__cards');

    if (key == 1) {
      gridElem.setAttribute('aria-view','1/1');
    } else if (key == 2) {
      gridElem.setAttribute('aria-view','1/2');
    }

}

// Sets size of Carousel on PLP to ensure product form sits perfectly at bottom of page



// Initialise Size Guide Popup

function sizeGuideInit() {

var sizeGuideButtons = document.querySelectorAll(".js-size-guide");

sizeGuideButtons.forEach(button => {
  button.addEventListener('click', function () {
    theme.mfpOpen('product-form');
    });
})

};

// Navigation Menu Submenu Trigger

var radioElem = document.querySelector('.mobile-draw__nav-gender');
var radios = document.querySelectorAll('input[type=radio][name="gender_selection"]');
radios.forEach(radio => {
  radio.addEventListener('change', function(){

    radioElem.setAttribute('aria-toggled', 'true');
  
    var currentMenu = document.querySelector('[data-menu="active"]')
    currentMenu.removeAttribute('data-menu');

    var newMenu = document.querySelector('[data-level="1"][data-name="' + radio.value + '"]');
    newMenu.setAttribute('data-menu', 'active');

    currentMenu.setAttribute('aria-active', 'false');
    newMenu.setAttribute('aria-active', 'true');

    var currentMenupercent;
    var newMenupercent;

    
    if (currentMenu.getAttribute('data-navigation') > newMenu.getAttribute('data-navigation')) {
      var currentMenupercent = '100%';
      var newMenupercent = '-100%';
    } else {
      var currentMenupercent = '-100%';
      var newMenupercent = '100%';
    }
  

    gsap.to(currentMenu, {
      onStart: function() { },
      left: currentMenupercent,
      duration: 0.3,
      ease: "none",
      onComplete: function() { }
    });

    gsap.set(newMenu, { left: newMenupercent })

    gsap.to(newMenu, {
      onStart: function() { },
      left:"0%",
      duration: 0.3,
      ease: "none",
      onComplete: function() { }
    });

    sessionStorage.setItem('nav_preference', radio.value);

  })
});

// PLP Variant Image Preview Function


  function swatchHover(state, elem) {
    if (state = 'enter') {
      document.querySelector('[data-product-id="' + elem.getAttribute('data-id') + '"] .js-swatch-image').src = elem.getAttribute('data-url');
      document.querySelector('[data-product-id="' + elem.getAttribute('data-id') + '"] .product-card__img.js-img-grid').classList.toggle('cc-hidden-opacity')
    } else {
      document.querySelector('[data-product-id="' + elem.getAttribute('data-id') + '"] .product-card__img.js-img-grid').classList.toggle('cc-hidden-opacity')
    }
  }

// PLP Function to check/toggle resize if previously selected ON LOAD

function toggleInit() {
  var storageState = sessionStorage.getItem('toggle');
  var collectionContainer = document.querySelector('html');
  if (storageState == 'enabled') {
      document.querySelector('.collection-main__bar--toggle input').checked = true;
      collectionContainer.classList.add("layout-model");
  }

  window.Shopify.ActiveProduct = []

  var activeProdTimer = null;
  window.addEventListener('scroll', function() {
      if(activeProdTimer !== null) {
          clearTimeout(activeProdTimer);        
      }
      activeProdTimer = setTimeout(function() {
        let scroll = window.scrollY;
        let elements = $("[data-product-grid]"); 
        let el;
        for (let i=0; i<elements.length; i++) {
            el = $(elements[i]);
            if (el.offset().top >= scroll && el.is(':visible')){
                window.Shopify.ActiveProduct = el;
                break;
            }
        }
      }, 100);
  }, false);

}

// PLP Function to check/toggle resize if previously selected

function toggleFunctionality() {
  const checkbox = document.querySelector('.collection-main__bar--toggle input');
  var collectionContainer = document.querySelector('html')

  checkbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        collectionContainer.classList.add("layout-model");
        sessionStorage.setItem('toggle', 'enabled');
    } else {
        collectionContainer.classList.remove("layout-model");
        sessionStorage.removeItem('toggle');
    }
  })
}

// Navigation Gender Toggle Function

function genderToggleInit() {
  var storageState = sessionStorage.getItem('nav_preference');
      document.querySelector(".mobile-draw__nav-gender #" + storageState).click();
}

// Initialise Sitewide Countdowns

heroCountdown();

function heroCountdown() {
  const now = new Date();
  const newNow = new Date(now.toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    dateStyle: 'medium',
    timeStyle: 'medium'
  }));

  var countdown = document.querySelectorAll('.countdown-container');

  countdown.forEach(elem => {
    var time = elem.getAttribute('data-time');
    var countDownDate = new Date(time).getTime();
    var now = newNow.getTime();
    window.time = now;

    // 👇 Define update function scoped per element
    function updateCountdown() {
      var distance = countDownDate - window.time;

      var days = Math.floor(distance / (1000 * 60 * 60 * 24));
      var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      var seconds = Math.floor((distance % (1000 * 60)) / 1000);

      var type = elem.getAttribute('data-countdown-type');

      switch (type) {
        case 'inline':
        case 'clubhouse':
          elem.querySelector('[data-content]').innerHTML = elem.getAttribute('data-content');
          elem.querySelector('[data-countdown]').innerHTML =
            ("0" + days).slice(-2) + "D " +
            ("0" + hours).slice(-2) + "H " +
            ("0" + minutes).slice(-2) + "M " +
            ("0" + seconds).slice(-2) + "S";
          break;

        default:
          elem.querySelector('[data-countdown]').innerHTML =
            ("0" + days).slice(-2) + ":" +
            ("0" + hours).slice(-2) + ":" +
            ("0" + minutes).slice(-2) + ":" +
            ("0" + seconds).slice(-2);
          break;
      }

      if (distance < 0) {
        clearInterval(x);
        switch (type) {
          case 'announcement':
            elem.querySelector('[data-countdown]').remove();
            break;
          case 'hero-image':
          case 'inline':
            elem.innerHTML = "";
            break;
          case 'clubhouse-signup':
            elem.innerHTML = "";
            var state = elem.closest('[aria-countdown]').getAttribute('aria-countdown');
            if (state == 'opens') {
              elem.closest('[aria-countdown]').setAttribute('aria-countdown', 'disabled');
            } else if (state == 'closes') {
              elem.closest('[aria-countdown]').setAttribute('aria-countdown', 'opens');
              elem.closest('[aria-countdown]').querySelector('.form-countdown span').innerHTML = theme.clubhouse.countdown_expired;
            }
            break;
          case 'clubhouse':
            elem.querySelector('[data-loaded]').removeAttribute('hidden');
            elem.querySelector('[data-content]').setAttribute('hidden', '');
            elem.querySelector('[data-countdown]').setAttribute('hidden', '');
            break;
        }
      }
    }

    // Call it immediately
    updateCountdown();

    // Then start the interval
    var x = setInterval(updateCountdown, 1000);

    setTimeout(function () {
      elem.removeAttribute('data-time');
      elem.classList.add('loaded');
    }, 1000);
  });

  // Global clock tick
  var y = setInterval(function () {
    window.time = window.time + 1000;
  }, 1000);
}


// Initialise PDP Similar Products popup

var similarToggleArray = document.querySelectorAll('.js-button-similar');

similarToggleArray.forEach(toggle => {
  toggle.addEventListener('click', function () {
    document.getElementById('product_similar').classList.toggle("active");
    document.querySelector('html').classList.toggle("no-scroll");
    });
});

// Function to check if element is in Viewport

function isInViewport(element) {

  var bounding = element.getBoundingClientRect();
  
  if (
      bounding.top >= 0 &&
      bounding.left >= 0 &&
      bounding.right <= (window.innerWidth || document.documentElement.clientWidth) &&
      bounding.bottom <= (window.innerHeight || document.documentElement.clientHeight)
  ) {
      return true;
  } else {
      return false;
  }
}

// PLP Mobile Slider

function prodSliderInit() {
  var elms = document.querySelectorAll( '.mobile_image-snap' );
  for ( var i = 0; i < elms.length; i++ ) {
    new Splide( elms[ i ] ).mount();
    elms[ i ].setAttribute('slider-initialised', '');
  }
}

// Scroll Snap Animation

function scrollSnapInit(type) {

  var elms = document.querySelectorAll('.splide:not(.is-initialized)');
  for ( var i = 0; i < elms.length; i++ ) {
    if (i == 0 && type == 'load') {
      var splide = new Splide( elms[ i ] ).mount();
      setTimeout(() => {
        splide.go( '>' );
      }, 400);
      setTimeout(() => {
        splide.go( '<' );
      }, 1200);
    } else {
      new Splide( elms[ i ] ).mount();
    }
  }
}

function BISQuickbuy(event) {
  event.preventDefault();
  var buttonContainer = event.target.closest('form').querySelector('button.js-product-add');
  var variantID = event.target.closest('form').querySelector('.product-form__content input[name="id"]').value;
  var prodID = event.target.closest('form').querySelector('.product-form__content input[name="productID"]').value;
  var emailInput = event.target.closest('form').querySelector('.quick-shop-bis [type="email"]');
  var isMarketing = true;


  if (emailInput.validity.valid) {
      promise = BIS.create(emailInput.value, variantID, prodID, { accepts_marketing: isMarketing })
      buttonContainer.classList.add('is-adding');
      promise.then(function(data) {
        buttonContainer.classList.remove('is-adding');
        buttonContainer.classList.add('is-added');
        setTimeout(() => { buttonContainer.classList.remove('is-added')
        $.magnificPopup.close();
        document.querySelector('quick-shop.active .quick-shop__close').click();
        }, "1000");
      })
  }
}

function BIS_url(elem) {
  let id = elem.closest('form').querySelector('[name="id"]').value;
  let variantURL = elem.closest('quick-shop').getAttribute('data-product-url');
  var url = new URL(variantURL);
  url.searchParams.set('bis', id);
  window.location.href = url.href;
  console.log(elem)
  elem.classList.add('is-adding');
}



function waitForElm(selector) {
  return new Promise(resolve => {
      if (document.querySelector(selector)) {
          return resolve(document.querySelector(selector));
      }

      const observer = new MutationObserver(mutations => {
          if (document.querySelector(selector)) {
              observer.disconnect();
              resolve(document.querySelector(selector));
          }
      });

      // If you get "parameter 1 is not of type 'Node'" error, see https://stackoverflow.com/a/77855838/492336
      observer.observe(document.body, {
          childList: true,
          subtree: true
      });
  });
}

document.addEventListener("click", function(e){
  const target = e.target.closest(".collection-sidebar__filter__availability--item:not([active])"); // Or any other selector.
  const elem = document.querySelector(".collection-sidebar__item[aria-filter] input");
  if(target){
    console.log(e.target, target, elem)
   elem.click();
  }
});

window.addEventListener('DOMContentLoaded', function(event) {
  document.querySelector('html').classList.add('js-dom-loaded');
});