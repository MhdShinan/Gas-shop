// Function to handle navigation with SweetAlert confirmation
document.getElementById("Home-button").addEventListener("click", function(event) {
    event.preventDefault(); // Prevent the default action
  
    Swal.fire({
      title: 'Are you sure?',
      text: "You will be redirected to the homepage!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, go to Home!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        // Redirect to the index.html page in the root folder
        window.location.href = "http://localhost:3000";
      }
    });
  });
  


  document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('form'); // Select your form
  
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent the default form submission
  
        // Collect form data
        const size = document.getElementById('size').value;
        const price = document.getElementById('price').value;
        const quantity = document.getElementById('quantity').value;
  
        try {
            // Send a POST request to the server to add a product
            const response = await fetch('/api/products', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ size, price, quantity }),
            });
  
            const data = await response.json(); // Parse the JSON response
  
            if (data.success) {
                // If successful, show a success alert
                Swal.fire({
                    icon: 'success',
                    title: 'Product Added',
                    text: data.message,
                });
                form.reset(); // Reset the form after successful submission
            } else {
                // If unsuccessful, show an error alert
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.message,
                });
            }
        } catch (error) {
            console.error('Error:', error); // Log error to console
            // Show a generic error alert
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to add product. Please try again later.',
            });
        }
    });
  });
  