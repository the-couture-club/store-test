

function swymCallbackFn(swat){
  // your API calls go here
  document.addEventListener("swym:collections-loaded", function(){
    swat.initializeActionButtons(".collection__cards");
    window.SwymCallbacks.push(onSwymLoadCallback);
  })

  swat.evtLayer.addEventListener(swat.JSEvents.addedToWishlist, function(data){
    // Execute code after an add to wishlist action
    console.log("Add to wishlist event data:", data);

    gtag("event", 'Wishlist Add', {
      'title': data.detail.d.dt
    })


  
    var notificationElem = document.querySelector('.wishlist-notification');
    notificationElem.classList.add('active')

    setTimeout(() => {
      notificationElem.classList.remove('active')
    }, 3000);

  });
  
}
if(!window.SwymCallbacks){
  window.SwymCallbacks = [];
}

window.SwymCallbacks.push(swymCallbackFn);


function onSwymLoadCallback(swat) {

let onSuccess = function(lists) {

    window.lists = lists;



    var swymButtons = document.querySelectorAll('.wishlist-add')



    swymButtons.forEach(button => {

        button.addEventListener("click", (event) => {

            

            if ((button.classList.toString()).indexOf('swym-added') > -1) {



                button.classList.remove('swym-added')
                
                // Define the list id of the list to be updated
                let lid = window.lists[0].lid; // lid

                // Define the Product to be deleted
                let product = {
                epi: button.getAttribute('data-variant-id'),  // unique variant id  per listid
                empi:  button.getAttribute('data-product-id'), // product id
                du: button.getAttribute('data-product-url') // product url.
                };
                

                // Define success callback 
                let onSuccess = function(deletedProduct) {
                // Executed when product is successfully deleted
                    console.log("Successfully deleted the Product", deletedProduct);
                }

                // Define error callback 
                let onError = function(error) {
                    // Error is an xhrObject
                    console.log("Error while deleting the Product", error);
                }

                // Call `deleteFromList` using the above callbacks, lid and listItem
                swat.deleteFromList(lid, product, onSuccess, onError);

            } else if((button.classList.toString()).indexOf('non-customer') > -1) {
              theme.mfpOpen('wishlist-notice');
            }

        });

    });

}

let onError = function(error) {
  console.log("Error while fetching all Lists", error);
}

swat.fetchLists({
  callbackFn: onSuccess,
  errorFn: onError
});

}
if (!window.SwymCallbacks) {
  window.SwymCallbacks = [];
}
window.SwymCallbacks.push(onSwymLoadCallback);

