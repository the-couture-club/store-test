// Initialising Functions

window.addEventListener('load', function(event) {
    CollectionGAEvents();
    quickbuyGA();
  }, true);

// Homepage Content Images Click

var HomepageImages = document.querySelectorAll('.hero-image--content');

HomepageImages.forEach(image => {
  image.addEventListener('click', function () {
    gtag("event", 'Homepage Image Content - Click', {
        'term': image.href,
    });
    console.log('Homepage Image Content - Click Fired')
    });
})

// Navigation Click

var NavigationMenu = document.querySelectorAll('.mobile-draw [data-route]');

NavigationMenu.forEach(menu => {
    menu.addEventListener('click', function () {
        var handle = menu.getAttribute('data-route');
        gtag("event", "Navigation Menu - Click", {
            'value': handle
        });
        console.log('Navigation Menu - Click Fired')
    });
})

function cartUpsellsGA(upsellType) {

    console.log(upsellType)
    // Cart Upsells Click

    var CartUpsells = document.querySelectorAll('[aria-type="' + upsellType + '"] .ajaxcart__recommendations--items [data-product].product-card');
    CartUpsells.forEach(form => {

        document.body.addEventListener('click', function( event ){
            if( form.contains( event.target ) && event.target.classList.contains('js-quickshop-trigger') == false ){
                var title = form.getAttribute('data-title');
                var type = form.parentNode.parentNode.getAttribute('aria-type')
                gtag("event", 'Cart Upsell - Click Through', {
                    'title': title,
                    'term': type
                });
                console.log('Cart Upsell - ' + type + ' - Click Through' + ' Fired 💥')
            }
        });
    })

    // Cart Upsells ATC (Via Quick Buy)

    var CartUpsellsATC = document.querySelectorAll('quick-shop[aria-type="' + upsellType + '"] form[action^="/cart/add"][data-type="cart-recommendations"]');
    CartUpsellsATC.forEach(form => {
        form.addEventListener('submit', function () {
            var title = form.getAttribute('data-title');
            var type = form.parentNode.parentNode.getAttribute('aria-type')
            gtag("event", 'Cart Upsell - Quick Buy ATC', {
                'title': title,
                'term': type,
            })
            console.log('Cart Upsell - ' + type + ' - Quick Buy ATC' + ' Fired 💥')
        });
    })

}

// Collection Content Spots

function CollectionGAEvents() {
    var collectionContentSpots = document.querySelectorAll('#hero-collection__image_container.collection-content-spot:not(.ga-initialised)');
    collectionContentSpots.forEach(spot => {
        spot.querySelector('a').addEventListener('click', function () {
            var title = spot.querySelector('.hero-image--content_cta h5').innerHTML;
            gtag("event", 'Collection Content Spot - Click', {
                'value': title
            })
            console.log('Collection Content Spot - Click' + ' Fired')
        });
        spot.classList.add('ga-initialised');
    })
}

// Navigation Content Spots

var navigationContentSpots = document.querySelectorAll('.navigation__collections--item');
navigationContentSpots.forEach(spot => {
    spot.addEventListener('click', function () {
        var route = spot.getAttribute('data-route');
        gtag("event", 'Navigation Content Spot - Click', {
            'value': route,
        })
        console.log('Navigation Content Spot - Click' + ' Fired')
    });
})

// Search Content Spots

var searchContentSpots = document.querySelectorAll('.popular__collections--item');
searchContentSpots.forEach(spot => {
    spot.addEventListener('click', function () {
        var title = spot.querySelector('.popular__collections--item-content span:first-child').innerHTML;
        gtag("event", 'Search Content Spot - Click', {
            'value': title,
        })
        console.log('Search Content Spot - Click' + ' Fired')
    });
})

// Filter Used

function filterGA() {
    gtag("event", 'Filter Used', {

    })
    console.log('Filter Used' + ' Fired')
}

// Quick Buy

function quickbuyGA() {

    var quickBuyForms = document.querySelectorAll('[data-type="standard"]:not(.ga-initialised)')
    quickBuyForms.forEach(form => {
        form.addEventListener('submit', function () {
            var title = form.getAttribute('data-title');
            gtag("event", 'Quick Buy - ATC', {
                'value': title
            })
            console.log('Quick Buy - ATC' + ' Fired')
        });
        form.classList.add('ga-initialised')
    })

};

// Product Upsells

function productUpsellsGA() {
    var productUpsellForms = document.querySelectorAll('[data-type="product-recommendations"]');
    productUpsellForms.forEach(form => {
        var formSelect = form.querySelector('select')
        formSelect.addEventListener('change', function () {
            gtag("event", 'Product Page Upsell - ATC', {
                'value': form.getAttribute('data-title')
            })
            console.log('Product Page Upsell - ATC' + ' Fired')
        });
        form.classList.add('ga-initialised')
    })
}

// Similar Products Opened


var similarProductsCTA = document.querySelector('.similar_items-cta');

if (similarProductsCTA != null) {
    similarProductsCTA.addEventListener('click', function () {
        gtag("event", 'Similar Products - Opened', {
            
        })
        console.log('Similar Products - Opened' + ' Fired')
    });
}

// Similar Products Click

var similarProductsClick = document.querySelectorAll('.product_similar-products .product-card');
similarProductsClick.forEach(form => {
    document.body.addEventListener('click', function( event ){
        if( form.contains( event.target ) && event.target.id != 'product-form__select' && event.target.tagName != 'BUTTON' ){
            var title = form.getAttribute('data-title');
            gtag("event", 'Similar Products - Click Through', {
                'value': title
            });
            console.log('Similar Products - Click Through' + ' Fired')
        }
    });
})

// Similar Products ATC

var similarProductsATC = document.querySelectorAll('.product_similar-products form');
similarProductsATC.forEach(form => {
    var formSelect = form.querySelector('select')
    formSelect.addEventListener('change', function () {
        gtag("event", 'Similar Products - ATC', {
            'value': form.getAttribute('data-title')
        })
        console.log('Similar Products - ATC' + ' Fired')
    });
})

// On Model Toggle

const checkbox = document.querySelector('.collection-main__bar--toggle input');
if (checkbox != null) {
    var div = checkbox.closest('div');
    checkbox.addEventListener('change', (event) => {
        gtag("event", 'On Model - Toggle', {
            'title': div.getAttribute('data-title'),
            'term': div.getAttribute('data-type')
        })
    })
}

// Homepage Button Clicks

var homepageButtons = document.querySelectorAll('.hero-image--content_cta-buttons a')

homepageButtons.forEach(button => {
    button.addEventListener('click', function () {
        var title = button.closest('.hero-image--content_cta').querySelector('h5').innerHTML;
        var btnTitle = button.innerHTML
        gtag("event", "Homepage Button - Click", {
            'title': title,
            'term': btnTitle,
        });
        console.log('Homepage Button - Click Fired')
    });
})

// Homepage Button Clicks

const productLinks = document.querySelectorAll("#hero-collection__collection_container [data-product]" );

productLinks.forEach(link => {
link.addEventListener("click", function () {
    // Find the parent slider (items-scroll)
    const slider = link.closest("items-scroll");
    let sliderTitle = "";
    
    if (slider) {
    const titleEl = slider.querySelector(".items-scroll-title");
    sliderTitle = titleEl ? titleEl.textContent.trim() : "";
    }

    // Get the product title from link/title attribute or inner text
    const productTitle =
    link.getAttribute("title") ||
    link.querySelector(".product-card__title")?.textContent.trim() ||
    "";

    // --- GA4 Event ---
    if (typeof gtag === "function") {
    gtag("event", "Homepage Product Carousel - Click", {
        event_category: "Hero Collection",
        type: sliderTitle,
        title: productTitle
    });
    }
    console.log('Homepage Product Carousel - Click Fired')
});
});