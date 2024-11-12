document.addEventListener('DOMContentLoaded', function () {
  const otpInputs = document.querySelectorAll('.otp-input');
  const confirmEmailBtn = document.getElementById('confirmEmailBtn');
  const otpSection = document.getElementById('otpSection');
  const emailField = document.getElementById('email');

  let generatedOtp = '';

  // Function to generate a random 6-digit OTP
  function generateOtp() {
      return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Function to send OTP to the user's email (send request to backend)
  async function sendOtpToEmail(email) {
      // Generate OTP
      generatedOtp = generateOtp();

      try {
          // Send the email and OTP to the backend via POST request
          const response = await fetch('/send-otp', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                  email: email,
                  otp: generatedOtp
              })
          });

          if (response.ok) {
              // If OTP sent successfully, show success message
              console.log(`OTP sent to ${email}: ${generatedOtp}`);
              Swal.fire('Success', `OTP has been sent to ${email}`, 'success');
          } else {
              throw new Error('Failed to send OTP');
          }
      } catch (error) {
          console.error('Error sending OTP:', error);
          Swal.fire('Error', 'There was an issue sending the OTP. Please try again.', 'error');
      }
  }

  // When "Confirm E-Mail" button is clicked
  confirmEmailBtn.addEventListener('click', async () => {
      const name = document.querySelector('.input[placeholder="Name"]').value;
      const number = document.querySelector('.input[placeholder="Your Number"]').value;
      const address = document.querySelector('.input[placeholder="Your Address"]').value;
      const email = emailField.value;

      if (!email || !number) {
          Swal.fire('Error', 'Please provide both email and phone number', 'error');
          return;
      }

      try {
          // Check if the user exists in the database using phone number or email
          const response = await fetch('http://localhost:5000/api/checkUser', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email, number })
          });

          const data = await response.json();

          if (data.exists) {
              // Handle duplicate cases and prevent OTP sending
              if (data.isSameUser) {
                  Swal.fire('Error', 'User is already registered.', 'error');
              } else if (data.duplicateEmail) {
                  Swal.fire('Error', 'This email is associated with another number. Duplicate accounts cannot be added.', 'error');
              } else if (data.duplicateNumber) {
                  Swal.fire('Error', 'This phone number is associated with another email. Duplicate accounts cannot be added.', 'error');
              }
              // Stop further execution, including OTP sending
              return;
          } else {
              // If no duplicate is found, proceed to send OTP
              sendOtpToEmail(email);
              otpSection.style.display = 'block'; // Show OTP input
              confirmEmailBtn.style.display = 'none'; // Hide the confirm button
          }
      } catch (error) {
          console.error('Error checking user data:', error);
          Swal.fire('Error', 'Could not verify user data. Please try again.', 'error');
      }
  });

  // Move focus to the next OTP input field
  otpInputs.forEach((input, index) => {
      input.addEventListener('input', () => {
          if (input.value.length === 1 && index < otpInputs.length - 1) {
              otpInputs[index + 1].focus();
          }
          // If all fields are filled, validate the OTP
          if (Array.from(otpInputs).every(input => input.value.length === 1)) {
              const enteredOtp = Array.from(otpInputs).map(input => input.value).join('');
              validateOtp(enteredOtp);
          }
      });
  });
// Function to save user data to the database
async function saveUserToDatabase(name, number, address, email) {
  try {
      const response = await fetch('/api/saveUser', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ name, number, address, email }) // Send user details to the backend
      });

      const data = await response.json();

      if (response.status === 201) {
            // Show success message and redirect after clicking OK
              const result = await Swal.fire({
             title: 'Success',
             text: data.message,
              icon: 'success',
              confirmButtonText: 'OK'
              });
    if (result.isConfirmed) {
                 // Redirect to index.html
                 window.location.href = "http://localhost:5000"; // Redirect to index.html
            }
      } else {
          throw new Error(data.message || 'Failed to save user');
      }
  } catch (error) {
      console.error('Error saving user data:', error);
      Swal.fire('Error', 'Could not save user data. Please try again.', 'error');
  }
}function validateOtp(enteredOtp) {
  if (enteredOtp === generatedOtp) {
      Swal.fire('Success', 'OTP verified successfully!', 'success');
      
      // Get the user's data from the form
      const name = document.querySelector('.input[placeholder="Name"]').value;
      const number = document.querySelector('.input[placeholder="Your Number"]').value;
      const address = document.querySelector('.input[placeholder="Your Address"]').value;
      const email = document.getElementById('email').value;

      // Save user data to the database
      saveUserToDatabase(name, number, address, email);
      
  } else {
      Swal.fire('Error', 'OTP does not match. Please try again.', 'error');
      otpInputs.forEach(input => input.value = ''); // Clear all fields
      otpInputs[0].focus(); // Focus on the first input box
  }
}
});
