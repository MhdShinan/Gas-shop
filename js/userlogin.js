document.addEventListener('DOMContentLoaded', function () {
    const otpInputs = document.querySelectorAll('.otp-input');
    const confirmEmailBtn = document.getElementById('confirmEmailBtn');
    const otpSection = document.getElementById('otpSection');
    const emailField = document.getElementById('email');
    const pasteOtpBtn = document.getElementById('pasteOtpBtn');
  
    let generatedOtp = '';
    let enteredOtp = '';
  
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
    confirmEmailBtn.addEventListener('click', function() {
      const email = emailField.value;
  
      if (email) {
        // Send OTP and show OTP section
        sendOtpToEmail(email);
        otpSection.style.display = 'block'; // Show OTP input
        confirmEmailBtn.style.display = 'none'; // Hide the confirm button
      } else {
        Swal.fire('Error', 'Please enter a valid email', 'error');
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
  
    // Handle paste OTP button click
    pasteOtpBtn.addEventListener('click', async function () {
      const otp = await Swal.fire({
        title: 'Paste your OTP',
        input: 'text',
        inputLabel: 'Enter OTP',
        inputPlaceholder: 'Enter your 6-digit OTP',
        inputAttributes: {
          maxlength: 6,
          autocapitalize: 'off',
          autocorrect: 'off'
        }
      });
  
      if (otp.value && otp.value.length === 6) {
        // Split OTP into individual inputs
        otp.value.split('').forEach((digit, index) => {
          otpInputs[index].value = digit;
        });
  
        validateOtp(otp.value); // Validate the pasted OTP
      } else {
        Swal.fire('Error', 'Please enter a valid 6-digit OTP', 'error');
      }
    });
  
    // Function to validate OTP
    function validateOtp(enteredOtp) {
      if (enteredOtp === generatedOtp) {
        Swal.fire('Success', 'OTP verified successfully!', 'success');
        // You can add form submission or redirection logic here
      } else {
        Swal.fire('Error', 'OTP does not match. Please try again.', 'error');
        otpInputs.forEach(input => input.value = ''); // Clear all fields
        otpInputs[0].focus(); // Focus on the first input box
      }
    }
  });

  
  document.getElementById('confirmEmailBtn').addEventListener('click', () => {
    const name = document.querySelector('.input[placeholder="Name"]').value;
    const number = document.querySelector('.input[placeholder="Your Number"]').value;
    const address = document.querySelector('.input[placeholder="Your Address"]').value;
    const email = document.getElementById('email').value;
  
    // Create the data object
    const userData = {
      name,
      number,
      address,
      email
    };
  
    // Send data to the server
    fetch('http://localhost:3000/api/saveUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    })
    .then(response => response.json())
    .then(data => {
      // Success message
      Swal.fire('Success', 'User data saved!', 'success');
      console.log(data);
    })
    .catch(error => {
      // Error message
      Swal.fire('Error', 'Could not save user data', 'error');
      console.error('Error:', error);
    });
  });
  