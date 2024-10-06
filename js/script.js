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

// Handle address option change
document.querySelectorAll('input[name="addressOption"]').forEach((radio) => {
  radio.addEventListener('change', function() {
    if (this.value === 'typeAddress') {
      document.getElementById('addressInputContainer').style.display = 'block';
      document.getElementById('locationInputContainer').style.display = 'none';
    } else {
      document.getElementById('addressInputContainer').style.display = 'none';
      document.getElementById('locationInputContainer').style.display = 'block';
    }
  });
});

// Get user location
document.getElementById('getLocation').addEventListener('click', async function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;

      // Here you can use reverse geocoding to get the address based on latitude and longitude
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`);
      const data = await response.json();

      // Check if the location is in Kandy district
      if (data && data.address && data.address.district === 'Kandy') {
        document.getElementById('Location').value = data.display_name; // Set the location input
      } else {
        alert('Your location is not within the Kandy district. Please enter your address manually.');
      }
    }, (error) => {
      console.error('Error obtaining location:', error);
      alert('Unable to retrieve your location. Please allow location access in your browser.');
    });
  } else {
    alert('Geolocation is not supported by this browser.');
  }
});

document.getElementById('orderForm').addEventListener('submit', async function(e) {
  e.preventDefault(); // Prevent default form submission

  const FirstName = document.getElementById('FirstName').value;
  const PhoneNumber = document.getElementById('PhoneNumber').value;
  const Address = document.getElementById('Address').value;
  const Location = document.getElementById('Location').value;
  const Size = document.getElementById('size-display').textContent;

  // Determine which address option was selected
  const addressOption = document.querySelector('input[name="addressOption"]:checked').value;
  const finalAddress = addressOption === 'typeAddress' ? Address : Location;

  // Get the delivery option and delivery method
  const deliveryOption = document.querySelector('input[name="deliveryOption"]:checked').value; // Assuming you have radio buttons for delivery option
  const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked').value; // Assuming you have radio buttons for delivery method

  try {
      const response = await fetch('/send-message', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ FirstName, PhoneNumber, Size, finalAddress, addressOption, deliveryOption, deliveryMethod })
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
          icon: 'error',
          title: 'Error!',
          text: 'Failed to place the order. Please try again later.',
          confirmButtonText: 'Try Again'
      });
  }
});

// Close overlay functionality
document.getElementById('close-new-overlay').addEventListener('click', function() {
  document.getElementById('new-overlay').style.display = 'none';
});


document.getElementById('searchUserLink').addEventListener('click', function (event) {
    event.preventDefault(); // Prevent the default action
    document.getElementById('searchContainer').style.display = 'block'; // Show the search container
    document.getElementById('searchPhoneNumber').focus(); // Focus on the input field
});

document.getElementById('searchUserBtn').addEventListener('click', async function () {
    const phoneNumber = document.getElementById('searchPhoneNumber').value.trim();

    // Clear previous messages
    const searchMessage = document.getElementById('searchMessage');
    searchMessage.textContent = '';

    if (phoneNumber === '') {
        searchMessage.textContent = 'Please enter a phone number.';
        return;
    }

    // Call an API to get user details by phone number
    try {
        const response = await fetch(`/api/get-user/${phoneNumber}`); // Adjust the URL as necessary
        if (response.ok) {
            const userDetails = await response.json();
            if (userDetails) {
                // Fill the form with user details
                document.getElementById('FirstName').value = userDetails.FirstName;
                document.getElementById('PhoneNumber').value = userDetails.PhoneNumber;
                document.getElementById('Address').value = userDetails.finalAddress; // Assuming 'finalAddress' is the field in the response
                searchMessage.textContent = 'User found!'; // Display user found message
                searchMessage.style.color = 'green'; // Change message color to green
                document.getElementById('FirstName').focus(); // Focus on First Name input
            } else {
                searchMessage.textContent = 'No matches found.';
                searchMessage.style.color = 'red'; // Change message color to red
                document.getElementById('searchPhoneNumber').focus(); // Focus back on the search input
            }
        } else {
            searchMessage.textContent = 'Error fetching user details.';
            searchMessage.style.color = 'red'; // Change message color to red
        }
    } catch (error) {
        console.error('Error:', error);
        searchMessage.textContent = 'An error occurred while searching for the user.';
        searchMessage.style.color = 'red'; // Change message color to red
    }
});

document.addEventListener("DOMContentLoaded", function() {
    const deliveryOptionRadios = document.querySelectorAll('input[name="deliveryOption"]');
    const deliveryMethodContainer = document.getElementById("deliveryMethodContainer");
    const addressInputContainer = document.getElementById("addressInputContainer");
    const locationInputContainer = document.getElementById("locationInputContainer");
    
    deliveryOptionRadios.forEach(radio => {
        radio.addEventListener("change", function() {
            if (this.value === "doorToDoor") {
                deliveryMethodContainer.style.display = "block"; // Show delivery method options
                addressInputContainer.style.display = "block"; // Show address input
                locationInputContainer.style.display = "none"; // Hide location input
            } else {
                deliveryMethodContainer.style.display = "none"; // Hide delivery method options
                addressInputContainer.style.display = "none"; // Hide address input
                locationInputContainer.style.display = "none"; // Hide location input
            }
        });
    });

    // Address option change listener
    const addressOptionRadios = document.querySelectorAll('input[name="addressOption"]');
    addressOptionRadios.forEach(radio => {
        radio.addEventListener("change", function() {
            if (this.value === "selectLocation") {
                addressInputContainer.style.display = "none"; // Hide address input
                locationInputContainer.style.display = "block"; // Show location input
            } else {
                addressInputContainer.style.display = "block"; // Show address input
                locationInputContainer.style.display = "none"; // Hide location input
            }
        });
    });
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




  
  

  document.addEventListener("DOMContentLoaded", function() {
    // Fetch product data from the backend
    fetch('/api/products') // Adjust the URL to your actual API endpoint
      .then(response => {
        // Check if the response is ok (status code in the range 200-299)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        // Assuming the data array contains products in the correct order: Small, Medium, Large, Ex-Large
        const productElements = document.querySelectorAll('.center.text'); // Corrected class selector
        
        // Loop through each product and insert data into the HTML
        data.forEach((product, index) => {
          // Assuming your data array is structured properly
          if (productElements[index]) {
            productElements[index].innerHTML = `
              SIZE: ${product.size}<br><br>
              PRIZE: ${product.price}<br><br>
              STOCK: ${product.stock}
            `;
          }
        });
      })
      .catch(error => console.error('Error fetching product data:', error));
  });