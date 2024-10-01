document.getElementById('submitButton').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent default form submission

    // Get the input values
    const username = document.getElementById('user').value;
    const password = document.getElementById('pass').value;

    // Check credentials
    if (username === 'shinan' && password === '1234') {
        // Redirect to index.html on success
        window.location.href = '../html/admin panel.html'; // Adjusted path to go back to the main folder
    } else {
        // Display error message for incorrect username or password
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = 'Incorrect username or password.';
        errorMessage.style.display = 'block'; // Show the error message
    }
});
