// Get references to the order buttons and the overlay elements
const orderButtons = document.querySelectorAll('.button');
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

// Handle form submission for the order
document.getElementById('orderForm').addEventListener('submit', async function(e) {
  e.preventDefault(); // Prevent default form submission

  // Get values from the form
  const FirstName = document.getElementById('FirstName').value;
  const PhoneNumber = document.getElementById('PhoneNumber').value;
  const Address = document.getElementById('Address').value;
  const Location = document.getElementById('Location').value;
  const Size = document.getElementById('size-display').textContent;
  const Email = document.getElementById('Email').value;
  // Determine which address option was selected
  const addressOption = document.querySelector('input[name="addressOption"]:checked').value;
  const finalAddress = addressOption === 'typeAddress' ? Address : Location;

  // Get the delivery option and delivery method
  const deliveryOption = document.querySelector('input[name="deliveryOption"]:checked').value;
  const deliveryMethod = document.querySelector('input[name="deliveryMethod"]:checked').value;

  document.getElementById('new-overlay').style.display = 'none'; // Hide the order form overlay

  // Send request to generate and send OTP
  Swal.fire({
    title: 'One more step to make the order',
    text: 'We will now send you an OTP to verify your order.',
    icon: 'info',
    showCancelButton: true,
    confirmButtonText: 'Proceed',
    cancelButtonText: 'Cancel'
}).then((result) => {
    if (result.isConfirmed) {
        // Hide the current overlay
        document.getElementById('new-overlay').style.display = 'none'; 

        // Show OTP input overlay
        document.getElementById('new-overlay2').style.display = 'block'; 
    }
});
  try {
      const otpResponse = await fetch('/senduser-otp', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ Email: document.getElementById('Email').value }) // Assume Email field is present in your form
      });

      const otpResult = await otpResponse.json();

      if (otpResponse.ok && otpResult.success) {
          // Show OTP input overlay
          document.getElementById('new-overlay2').style.display = 'block';

          // Handle OTP input
          const otpInputs = document.querySelectorAll('.otp-input');
          otpInputs.forEach((input, index) => {
              input.addEventListener('input', function() {
                  if (this.value.length === this.maxLength && index < otpInputs.length - 1) {
                      otpInputs[index + 1].focus();
                  }
              });

              // Auto-submit OTP when all boxes are filled
              input.addEventListener('input', async function() {
                const otp = Array.from(otpInputs).map(input => input.value).join('');
                if (otp.length === otpInputs.length) {
                    // Send OTP for verification, including the email
                    const verifyResponse = await fetch('/verifyuser-otp', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ otp, Email: document.getElementById('Email').value }) // Ensure Email is included
                    });
            
                    const verifyResult = await verifyResponse.json();
                      if (verifyResponse.ok && verifyResult.success) {
                          // If OTP is correct, place the order
                          const orderResponse = await fetch('/send-message', {
                              method: 'POST',
                              headers: {
                                  'Content-Type': 'application/json'
                              },
                              body: JSON.stringify({ FirstName, PhoneNumber, Size, finalAddress, addressOption, deliveryOption, deliveryMethod, Email })
                          });

                          const orderResult = await orderResponse.json();

                          if (orderResponse.ok && orderResult.success) {
                              // Success Alert for Order
                              Swal.fire({
                                  icon: 'success',
                                  title: 'Order Placed!',
                                  text: 'Your order was placed successfully!',
                                  confirmButtonText: 'OK'
                              }).then(() => {
                                  document.getElementById('new-overlay').style.display = 'none'; // Hide order overlay
                                  document.getElementById('new-overlay2').style.display = 'none'; // Hide OTP overlay
                              });
                          } else {
                              // Error Alert for Order
                              Swal.fire({
                                  icon: 'error',
                                  title: 'Error!',
                                  text: orderResult.message || 'Failed to place the order.',
                                  confirmButtonText: 'Try Again'
                              });
                          }
                      } else {
                          // Error Alert for OTP
                          Swal.fire({
                              icon: 'error',
                              title: 'Error!',
                              text: 'OTP does not match. Please ensure you enter the correct OTP sent to your email and try again.',
                              confirmButtonText: 'Try Again'
                          });

                          // Clear OTP inputs
                          otpInputs.forEach(input => input.value = '');
                          otpInputs[0].focus(); // Focus the first input
                      }
                  }
              });
          });
      } else {
          // Error Alert for OTP sending
          Swal.fire({
              icon: 'error',
              title: 'Error!',
              text: otpResult.message || 'Failed to send OTP.',
              confirmButtonText: 'Try Again'
          });
      }
  } catch (error) {
      // Network or other error
      Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: 'Failed to send OTP. Please try again later.',
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

document.getElementById('searchUserLink').addEventListener('click', function() {
  document.getElementById('searchContainer').style.display = 'block';
});

document.getElementById('searchUserBtn').addEventListener('click', function() {
  const email = document.getElementById('searchEmail').value;

  // Perform the search request by email
  fetch(`/api/users/search?email=${email}`)
      .then(response => response.json())
      .then(data => {
          if (data.success) {
              // Auto-fill the form with user data
              document.getElementById('FirstName').value = data.user.name;
              document.getElementById('PhoneNumber').value = data.user.number;
              document.getElementById('Email').value = data.user.email;
              document.getElementById('Address').value = data.user.address;
              
              // Make all fields read-only
              document.getElementById('FirstName').setAttribute('readonly', true);
              document.getElementById('PhoneNumber').setAttribute('readonly', true);
              document.getElementById('Email').setAttribute('readonly', true);
              document.getElementById('Address').setAttribute('readonly', true);

              document.getElementById('searchMessage').textContent = '';
          } else {
              document.getElementById('searchMessage').textContent = 'User not found.';
              resetForm();
          }
      })
      .catch(error => {
          document.getElementById('searchMessage').textContent = 'Error searching user.';
          console.error('Error:', error);
          resetForm();
      });
});

function resetForm() {
  // Clear form fields and make them editable again
  document.getElementById('FirstName').value = '';
  document.getElementById('PhoneNumber').value = '';
  document.getElementById('Email').value = '';
  document.getElementById('Address').value = '';
  
  // Make all fields editable again
  document.getElementById('FirstName').removeAttribute('readonly');
  document.getElementById('PhoneNumber').removeAttribute('readonly');
  document.getElementById('Email').removeAttribute('readonly');
  document.getElementById('Address').removeAttribute('readonly');
}


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