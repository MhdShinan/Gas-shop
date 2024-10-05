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
  