document.addEventListener('DOMContentLoaded', function () {
    let generatedOtp;
    
    // Function to generate a 4-digit OTP
    function generateOtp() {
        return Math.floor(1000 + Math.random() * 9000);
    }

    // Event listener for Confirm button
    document.getElementById('confirm-btn').addEventListener('click', function () {
        const contactNumber = document.getElementById('contactNumber').value;

        if (contactNumber) {
            // Generate OTP and display OTP input field
            generatedOtp = generateOtp();
            alert('Your OTP is: ' + generatedOtp); // For demo purposes
            
            // Show OTP input field and Submit button
            document.getElementById('otp-input-block').style.display = 'block';
            document.getElementById('submit-btn-container').style.display = 'block';
            document.getElementById('confirm-btn').disabled = true;
        } else {
            alert('Please enter a valid contact number.');
        }
    });

    // Event listener for OTP Submit button
    document.getElementById('submit-otp-btn').addEventListener('click', function () {
        const enteredOtp = document.getElementById('otp').value;
        const name = document.getElementById('Name').value;
        const contactNumber = document.getElementById('contactNumber').value;

        if (enteredOtp && parseInt(enteredOtp) === generatedOtp) {
            document.getElementById('otp-status').innerText = 'OTP verified successfully!';
            
            // Send data to the backend for MongoDB storage
            fetch('/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: name,
                    contactNumber: contactNumber,
                    otp: enteredOtp,
                    status: 'verified',
                }),
            })
            .then(response => {
                if (response.ok) {
                    // After successful OTP verification, redirect to index.html
                    window.location.href = 'index.html';
                } else {
                    alert('Error saving OTP to the database.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
        } else {
            document.getElementById('otp-status').innerText = 'Invalid OTP, please try again.';
        }
    });
});
