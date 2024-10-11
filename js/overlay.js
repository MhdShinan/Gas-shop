// Open overlay when the loader is clicked
document.getElementById('openOverlayButton').addEventListener('click', function() {
    document.getElementById('overlay12345').style.display = 'flex';
  });
  
  // Close overlay when the close button is clicked
  document.querySelector('.close-btn12345').addEventListener('click', function() {
    document.getElementById('overlay12345').style.display = 'none';
  });
  
  // Optional: Close overlay when clicking outside the overlay content
  document.getElementById('overlay12345').addEventListener('click', function(event) {
    if (event.target === this) {
      this.style.display = 'none';
    }
  });
  