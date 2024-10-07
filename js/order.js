// Function to create the card HTML dynamically
function createCard(size, price, quantity, imageSrc) {
    // Capitalize the first letter of the size
    const normalizedSize = size.charAt(0).toUpperCase() + size.slice(1).toLowerCase();

    // Check if the size is Extra-large to disable the button
    const isExtraLarge = ['Ex-large', 'EX-Large', 'Extra-large', 'extra-large'].includes(normalizedSize);

    return `
      <div class="cardrotate">
        <div class="card-inner">
          <div class="card-front">
            <h2 class="card-title">${size}</h2>
            <img src="${imageSrc}" alt="Card Image" class="card-image">
          </div>
          <div class="card-back">
            <div class="center-text-container">
              <p class="center-text">SIZE: ${size}<br><br>PRICE: ${price}/=<br><br>STOCK: ${quantity}</p>
            </div>
            <br>
            <button class="btn-order" ${isExtraLarge ? 'disabled' : ''} style="margin-top: 20px; background-color: ${isExtraLarge ? '#ccc' : '#007bff'}; color: white; padding: 10px 20px; border: none; cursor: ${isExtraLarge ? 'not-allowed' : 'pointer'};">
              ${isExtraLarge ? 'Order' : 'Order'}
            </button>
          </div>
        </div>
      </div>
    `;
}

// Get the container element
const container = document.querySelector('.rowsmall');

// Fetch product data from the backend
fetch('/api/products')
  .then(response => response.json())
  .then(products => {
    // Clear the container before adding new cards
    container.innerHTML = '';

    // Loop through the products and create cards dynamically
    products.forEach(product => {
      let imageSrc = '';

      // Capitalize the first letter of the size
      const normalizedSize = product.size.charAt(0).toUpperCase() + product.size.slice(1).toLowerCase();

      // Map product size to the correct image
      switch (normalizedSize) {
        case 'Small':
          imageSrc = 'images/SMALL.jpeg';
          break;
        case 'Medium':
          imageSrc = 'images/MEDIUM.jpeg';
          break;
        case 'Large':
          imageSrc = 'images/BIG.jpeg';
          break;
        case 'Ex-large': // Handle Ex-large
        case 'EX-Large': // Handle EX-Large
        case 'Extra-large': // Handle Extra-large
        case 'extra-large': // Handle lowercase extra-large
          imageSrc = 'images/Ex-large.jpeg';
          break;
        default:
          console.error(`No image found for size: ${normalizedSize}`);
      }

      // Append the card HTML to the container
      container.innerHTML += createCard(product.size, product.price, product.quantity, imageSrc);
    });

    // Get references to the order buttons and the overlay elements
    const orderButtons = document.querySelectorAll('.btn-order');
    const overlay = document.getElementById('new-overlay');
    const overlayText = document.querySelector('.new-overlay-content p');
    const closeOverlayButton = document.getElementById('close-new-overlay');

    // Function to open the overlay with the corresponding size
    orderButtons.forEach(button => {
      if (!button.disabled) { // Only add event listener if the button is not disabled
        button.addEventListener('click', (event) => {
          const cardTitle = event.target.closest('.card-inner').querySelector('.card-title').textContent;
          overlayText.innerHTML = `<p>${cardTitle}</p>`; // Set the size in the overlay
          overlay.style.display = 'block'; // Show the overlay
        });
      }
    });

    // Close the overlay when the close button is clicked
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

    // Handle other functionalities (address option, location, etc.)...
    // (keep the rest of your existing logic)
  })
  .catch(error => console.error('Error fetching products:', error));



  