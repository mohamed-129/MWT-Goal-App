 // This function checks the validation state of the input fields
 function validateField(input) {
    if (input.validity.valid) {
      input.classList.add("valid");
    } else {
      input.classList.remove("valid");
    }
  }

  // Apply validation check when user interacts with the input
  document.querySelectorAll("input, textarea").forEach((input) => {
    input.addEventListener("input", function () {
      validateField(input);
    });
  });