/*!
* Start Bootstrap - Resume v7.0.6 (https://startbootstrap.com/theme/resume)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-resume/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const sideNav = document.body.querySelector('#sideNav');
    if (sideNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#sideNav',
            rootMargin: '0px 0px -40%',
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });

});

// Visitor Counter - Fetches and displays visitor count from Azure Function

async function updateVisitorCount() {
    try {
        // Production API URL
        const apiUrl = 'https://noah-resume-api.azurewebsites.net/api/getvisitorcount';
        
        // Call the API
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Parse the JSON response
        const data = await response.json();
        
        // Update the counter display
        const counterElement = document.getElementById('visitor-count');
        if (counterElement) {
            counterElement.textContent = data.count;
        }
        
        console.log('Visitor count updated:', data.count);
        
    } catch (error) {
        console.error('Error fetching visitor count:', error);
        
        // Display error message to user
        const counterElement = document.getElementById('visitor-count');
        if (counterElement) {
            counterElement.textContent = 'Error loading count';
        }
    }
}

// Call the function when the page loads
document.addEventListener('DOMContentLoaded', updateVisitorCount);