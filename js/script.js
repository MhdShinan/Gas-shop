// Get references to the order buttons and the overlay elements
const orderButtons = document.querySelectorAll('.btn-order');
const overlay = document.getElementById('new-overlay');
const overlayText = document.querySelector('.new-overlay-content p');
const closeOverlayButton = document.getElementById('close-new-overlay');

// Function to open the overlay with the corresponding size
orderButtons.forEach(button => {
  button.addEventListener('click', (event) => {
    const cardTitle = event.target.closest('.card-inner').querySelector('.card-title').textContent;
    overlayText.innerHTML = `<p>${cardTitle}</p><!--{SIZE}-->`; // Set the size in the overlay
    overlay.style.display = 'block'; // Show the overlay
  });
});

// Close the overlay when the cancel button is clicked
closeOverlayButton.addEventListener('click', (event) => {
  event.preventDefault(); // Prevent default button behavior
  overlay.style.display = 'none'; // Hide the overlay
});

// Optional: Close the overlay when clicking outside of it
window.addEventListener('click', (event) => {
  if (event.target === overlay) {
    overlay.style.display = 'none'; // Hide the overlay
  }
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




  
  

