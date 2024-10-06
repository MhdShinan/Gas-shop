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
  
//js/admin.js
document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('form'); // Select your form

  form.addEventListener('submit', async (event) => {
      event.preventDefault(); // Prevent the default form submission

      const size = document.getElementById('size').value;
      const price = document.getElementById('price').value;
      const quantity = document.getElementById('quantity').value;

      try {
          const response = await fetch('/api/products', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
              },
              body: JSON.stringify({ size, price, quantity }),
          });

          const data = await response.json();
          if (data.success) {
              Swal.fire({
                  icon: 'success',
                  title: 'Product Added',
                  text: data.message,
              });
              form.reset(); // Reset the form after successful submission
          } else {
              Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: data.message,
              });
          }
      } catch (error) {
          console.error('Error:', error);
          Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Failed to add product. Please try again later.',
          });
      }
  });
});
