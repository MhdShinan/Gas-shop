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




// Function to update date and time
function updateDateTime() {
  const now = new Date();

  // Format date as DD/MM/YYYY
  const date = now.toLocaleDateString('en-GB'); // DD/MM/YYYY format

  // Format time as HH:MM AM/PM
  const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
  });

  // Update the HTML content
  document.getElementById('currentDate').textContent = date;
  document.getElementById('currentTime').textContent = time;
}

// Update the date and time immediately and every second
setInterval(updateDateTime, 1000);
updateDateTime(); // Initial call to set the time immediately


document.addEventListener("DOMContentLoaded", function () {
  // Initialize Swiper
  const swiper = new Swiper('.swiper', {
    direction: 'horizontal',
    loop: true,
    autoplay: {
      delay: 1000, // Change slide every 3 seconds
      disableOnInteraction: false, // Continue autoplay after interaction
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
  });
});





document.getElementById('orderForm').addEventListener('submit', async function(e) {
    e.preventDefault(); // Prevent default form submission

    const FirstName = document.getElementById('FirstName').value;
    const PhoneNumber = document.getElementById('PhoneNumber').value;

    try {
      const response = await fetch('/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ FirstName, PhoneNumber })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success Alert
        Swal.fire({
          icon: 'success',
          title: 'Order Placed!',
          text: 'Your order was placed successfully!',
          confirmButtonText: 'OK'
        }).then(() => {
          document.getElementById('new-overlay').style.display = 'none'; // Hide overlay
        });
      } else {
        // Error Alert
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: result.message || 'Failed to place the order.',
          confirmButtonText: 'Try Again'
        });
      }
    } catch (error) {
      // Network or other error
      Swal.fire({
        icon: 'success',
        title: 'Order Placed!',
        text: 'Your order was placed successfully!',
        confirmButtonText: 'OK'
      });
    }
  });

  // Close overlay functionality
  document.getElementById('close-new-overlay').addEventListener('click', function() {
    document.getElementById('new-overlay').style.display = 'none';
  });
  
  

