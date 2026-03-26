//This file handles global functionality that works across all pages

//Waiting for the page to load
document.addEventListener('DOMContentLoaded', function () {

    // Close the mobile menu when a navigation link is clicked
    const menuToggle = document.getElementById('menu-toggle');

    const navLinks = document.querySelectorAll('.nav-menu a')  //Find all navigation links

    if (menuToggle && navLinks.length > 0) {    //Check if menuToggle exists and there if are navigation links
        navLinks.forEach(link => {              //Loop through each navigation link
            link.addEventListener('click', function () {    //When a link is clicked...
                menuToggle.checked = false;                 //Uncheck the menu toggle to close the mobile menu
            });
        });
    }

    //Newsletter subscription form validation
    const newsletterForm = document.querySelector('.newsletter-form'); //Select the newsletter form
    const emailInput = document.getElementById('newsletter-email'); //Select the email input field

    // only run if the form and email input exist
    if (newsletterForm && emailInput) {
        newsletterForm.addEventListener('submit', function (e) { //When the form is submitted...
            e.preventDefault(); //Prevent the default form submission behavior

            const email = emailInput.value.trim(); //Get the trimmed value of the email input
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //Simple email validation pattern

            const isValid = emailPattern.test(email); //Test if the email matches the pattern

            if (isValid) { //Show result to user
                alert('Thank you for subscribing to our newsletter!');
                emailInput.value = ''; //Clear the input field
            } else {
                alert('Please enter a valid email address.'); //Show error message if email is not valid
            }
        });
    }



});