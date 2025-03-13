// This script will handle displaying success or error messages dynamically

const form = document.querySelector("form");
const messageContainer = document.getElementById("message");

// Add event listener to the form submission
form.addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission

    const fileInput = document.querySelector("input[type='file']");
    const file = fileInput.files[0];

    // Validate file size and type before submission
    if (file && file.size > 10 * 1024 * 1024) { // Limit file size to 10MB
        showMessage("File size is too large. Please upload a file smaller than 10MB.", "error");
        return;
    }

    if (file && !['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        showMessage("Invalid file type. Please upload a JPG, PNG, or PDF file.", "error");
        return;
    }

    // If file passes validation, submit the form
    form.submit();

    // Show the loading message
    showMessage("Uploading file, please wait...", "info");
});

// Function to display success/error messages
function showMessage(message, type) {
    messageContainer.textContent = message;
    messageContainer.classList.remove("success", "error", "info");
    messageContainer.classList.add(type);
}

