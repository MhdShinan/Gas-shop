
// Elements
const clickableDiv = document.getElementById('clickable-div');
const originalOverlay = document.getElementById('original-overlay');
const closeOverlayBtn = document.getElementById('close-overlay');
const orderNowNewBtn = document.getElementById('order-now-new-btn');
const newOverlay = document.getElementById('new-overlay');
const closeNewOverlayBtn = document.getElementById('close-new-overlay');

// Show the original overlay when clickable-div is clicked
clickableDiv.addEventListener('click', () => {
  originalOverlay.style.display = 'block';
});

// Close the original overlay and open the new overlay when Order button is clicked
orderNowNewBtn.addEventListener('click', () => {
  originalOverlay.style.display = 'none';
  newOverlay.style.display = 'block';
});

// Close the new overlay when Cancel is clicked
closeNewOverlayBtn.addEventListener('click', (e) => {
  e.preventDefault(); // Prevent form submission if it's a button within a form
  newOverlay.style.display = 'none';
});

// Close the original overlay when the close button is clicked
closeOverlayBtn.addEventListener('click', () => {
  originalOverlay.style.display = 'none';
});


function updateDateTime() {
    const dateElement = document.getElementById('current-date');
    const timeElement = document.getElementById('current-time');
    
    const now = new Date();
    
    // Format the date as DD/MM/YYYY
    const date = now.toLocaleDateString('en-GB');
    
    // Format the time as HH:MM AM/PM
    const time = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
    
    dateElement.textContent = date;
    timeElement.textContent = time;
}

// Update the time every second
setInterval(updateDateTime, 1000);

// Initial call to display the time immediately
updateDateTime();

const swiper = new Swiper('.swiper', {
    autoplay: {
        delay: 1000, // Delay in milliseconds
        disableOnInteraction: false, // Autoplay continues after user interactions
    },
    loop: true, // Loop the slides
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
});




  
  

