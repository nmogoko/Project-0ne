const businessList = document.getElementById("business-list");
const searchBusinessList = document.getElementById("search-business-list");

// Search input logic
const searchInput = document.getElementById('search-input');
const searchContent = document.getElementById('search-content');
const mainContent = document.getElementById('main-content');
const backButton = document.getElementById('back-button');
const loading = document.querySelector('.loading');
const registerButton = document.getElementById('registerButton');
const businessInfoContainer = document.getElementById('business-info');

document.addEventListener("DOMContentLoaded", () => {
    // Initial population based on the default selected category
    populateBusinesses('makeup');
    
    // // Add event listeners to radio buttons
    // document.getElementById('makeup').addEventListener('change', () => {
    //     if (document.getElementById('makeup').checked) {
    //         populateBusinesses('makeup');
    //     }
    // });

    // document.getElementById('photography').addEventListener('change', () => {
    //     if (document.getElementById('photography').checked) {
    //         populateBusinesses('photography');
    //     }
    // });

    // Add event listeners to labels
    const labels = document.querySelectorAll('.custom-btn');
    labels.forEach(label => {
        label.addEventListener('click', (event) => {
            // Remove active class from all labels
            labels.forEach(lbl => lbl.classList.remove('active'));
            // Add active class to the clicked label
            event.target.classList.add('active');
            // Call populateBusinesses with the corresponding category
            populateBusinesses(event.target.htmlFor);
        });
    });

    let debounceTimeout;

    searchInput.addEventListener('input', () => {
        clearTimeout(debounceTimeout);
        if (searchInput.value.trim()) {
            loading.style.display = 'block';
            mainContent.style.display = 'none';
            debounceTimeout = setTimeout(() => {
                fetch(`http://localhost:3000/businesses?businessname_like=${searchInput.value.trim()}`)
                    .then(response => response.json())
                    .then(data => {
                        searchBusinessList.innerHTML = ''; // Clear previous results
                        data.forEach(data => {
                            searchBusinessList.innerHTML += `
                                <div class="col-3 mb-4">
                                    <div class="card">
                                        <img src=${data.poster} class="card-img-top" style="height: 180px; object-fit: cover; width: 100%;" alt="card image">
                                        <div class="card-body">
                                            <h5 class="card-title">${data.businessname}</h5>
                                            <p class="card-text">${data.description}</p>
                                            <div class="row">
                                                <div class="col-8">
                                                    Rating: ${data.review}
                                                </div>
                                                <div class="col-4 text-end">
                                                    <button class="btn btn-sm btn-primary" data-id="${data.id}">Book</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            `;
                        });
                        searchContent.style.display = 'block';
                        loading.style.display = 'none';

                        document.querySelectorAll('.btn-primary').forEach(button => {
                            button.addEventListener('click', () => {
                                document.querySelector('.first-page').style.display = 'none';
                                document.querySelector('.business-page').style.display = 'block';
            
                                const businessId = button.getAttribute('data-id');
            
                                fetch(`http://localhost:3000/businesses?id=${businessId}`)
                                    .then(response => response.json())
                                    .then(data => {
                                        if (data.length > 0) {
                                            const business = data[0]; // Get the first (and likely only) item
            
                                            // Map services to HTML with onclick event to show modal
                                            const servicesHTML = business.services.map((service, index) => `
                                                <a href="#" class="col-3 service-item" data-bs-toggle="modal" data-bs-target="#serviceModal" data-index="${index}">
                                                    <div class="card" style="width: 18rem;">
                                                        <div class="row card-body p-0">
                                                            <div class="col-5">
                                                                <img src="${service.image}" alt="service image" style="width: 100%; height: 80px; object-fit: cover; padding: 0; margin: 0;" />
                                                            </div>
                                                            <div class="col-7 mt-3">
                                                                <h6 class="card-subtitle mb-2 text-body-secondary no-underline" style="text-decoration: none !important;">${service.name}</h6>
                                                                <div class="row">
                                                                    <div class="col-12">
                                                                        <span>Ksh: ${service.price}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </a>
                                            `).join('');
            
                                            businessInfoContainer.innerHTML = `
                                                <div class="card">
                                                    <img src="${business.poster}" class="img-fluid" style="height: 500px;" alt="business image" />
                                                    <div class="card-body">
                                                        <h5 class="card-title">${business.businessname}</h5>
                                                        <p class="card-text">${business.description}</p>
                                                        <div class="row">
                                                            <div class="col-8">
                                                                Rating: ${business.review}
                                                            </div>
            
                                                        </div>
                                                        <div class="mt-4">
                                                            <h5 class="mb-4">Services</h5>
                                                            <div class="row">
                                                                ${servicesHTML}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    </div>
                                                </div>
                                            `;
            
                                            // Add event listeners to each service item to update and show the modal
                                            const serviceItems = document.querySelectorAll('.service-item');
                                            serviceItems.forEach(item => {
                                                item.addEventListener('click', event => {
                                                    event.preventDefault(); // Prevent default anchor behavior
                                                    const index = event.currentTarget.getAttribute('data-index');
                                                    const service = business.services[index];
                                                    document.getElementById('serviceModalLabel').innerText = `Book a ${service.name} session`;
                                                    document.getElementById('modalServicePrice').innerText = `Ksh: ${service.price}`;
            
                                                    // Show the modal
                                                    document.getElementById('serviceModal').classList.add('show');
                                                    document.getElementById('serviceModal').style.display = 'block';
                                                    document.body.classList.add('modal-open');
                                                });
                                            });
            
                                            // Add event listener to the Book button
                                            document.getElementById('bookButton').addEventListener('click', () => {
                                                const yourEmail = document.getElementById('service-email').value;
                                                const appointmentDate = document.getElementById('appointmentDate').value;
                                                const otherSpecifications = document.getElementById('otherSpecifications').value;
                                                
                                                fetch(`http://localhost:3000/bookings`, {
                                                    method: 'POST',
                                                    headers: {
                                                        'Content-Type': 'application/json'
                                                    },
                                                    body: JSON.stringify({
                                                        yourEmail,
                                                        appointmentDate,
                                                        otherSpecifications,
                                                        service: document.getElementById('serviceModalLabel').innerText,
                                                        price: document.getElementById('modalServicePrice').innerText
                                                    })
                                                })
                                                .then(response => response.json())
                                                .then(data => {
                                                    console.log(data);
                                                })
                                                .catch(error => {
                                                    console.error('Error:', error);
                                                });
                                                // You can send this data to your server here
                                            });
            
                                        } else {
                                            businessInfoContainer.innerHTML = '<p class="mt-5 text-center w-100">No business found with this ID.</p>';
                                        }
                                    })
                                    .catch(error => {
                                        businessInfoContainer.innerHTML = '<p class="mt-5 text-center w-100">An error ocurred.</p>';
                                    });
                            });
                        });
                    })
                    .catch(error => {
                        console.error(`Error fetching the search results: ${error}`);
                        loading.style.display = 'none';
                    });
            }, 300); // Adjust the debounce delay as needed
        } else {
            searchContent.style.display = 'none';
            mainContent.style.display = 'block';
            loading.style.display = 'none';
        }
    });

    backButton.addEventListener("click", () => {
        searchInput.value = '';
        searchContent.style.display = 'none';
        mainContent.style.display = 'block';
    });

    document.getElementById('registerButton').addEventListener('click', function (event) {
        // Get form values
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const errorMessage = document.getElementById('error-message');
    
        // Clear previous error messages
        errorMessage.style.display = 'none';
        errorMessage.textContent = '';
    
        // Validate form data
        if (!firstName || !lastName || !email || !password) {
            errorMessage.textContent = 'All fields are required.';
            errorMessage.style.display = 'block';
            return;
        }
    
        if (!validateEmail(email)) {
            errorMessage.textContent = 'Please enter a valid email address.';
            errorMessage.style.display = 'block';
            return;
        }
    
        if (password.length < 6) {
            errorMessage.textContent = 'Password must be at least 6 characters long.';
            errorMessage.style.display = 'block';
            return;
        }
    
        // Create the user object
        const user = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        };
    
        // Send the data to the JSON Server
        fetch('http://localhost:3000/account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(user)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            localStorage.setItem("user", JSON.stringify(data));
            // Reset the form
            document.getElementById('registrationForm').reset();
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    document.getElementById("logout-button").addEventListener("click", () => {
        localStorage.removeItem("user");
        window.location.reload();
    });

    document.getElementById("profile-icon").innerHTML = localStorage.getItem("user") ? `
        Welcome, ${JSON.parse(localStorage.getItem("user")).firstName} ${JSON.parse(localStorage.getItem("user")).lastName}
         <i class="bi bi-person-circle"></i>` : "";
    document.getElementById("register-button").style.display = localStorage.getItem("user") ? 'none' : 'block';
    document.getElementById("logout-button").style.display = localStorage.getItem("user") ? 'block' : 'none';

});

function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
}

function populateBusinesses(category) {
    fetch(`http://localhost:3000/businesses?category=${category}`)
        .then(response => response.json())
        .then(data => {
            // Clear existing content
            businessList.innerHTML = '';

            data.forEach(data => {
                businessList.innerHTML += `
                    <div class="col">
                        <div class="card">
                            <img src=${data.poster} class="card-img-top" style="height: 180px; object-fit: cover; width: 100%;" alt="card image">
                            <div class="card-body">
                                <h5 class="card-title">${data.businessname}</h5>
                                <p class="card-text">${data.description}</p>
                                <div class="row">
                                    <div class="col-8">
                                        Rating: ${data.review}
                                    </div>
                                    <div class="col-4 text-end">
                                        <button class="btn btn-sm btn-primary" data-id="${data.id}">Book</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            });

            document.querySelectorAll('.btn-primary').forEach(button => {
                button.addEventListener('click', () => {
                    document.querySelector('.first-page').style.display = 'none';
                    document.querySelector('.business-page').style.display = 'block';

                    const businessId = button.getAttribute('data-id');

                    fetch(`http://localhost:3000/businesses?id=${businessId}`)
                        .then(response => response.json())
                        .then(data => {
                            if (data.length > 0) {
                                const business = data[0]; // Get the first (and likely only) item

                                // Map services to HTML with onclick event to show modal
                                const servicesHTML = business.services.map((service, index) => `
                                    <a href="#" class="col-3 service-item" data-bs-toggle="modal" data-bs-target="#serviceModal" data-index="${index}">
                                        <div class="card" style="width: 18rem;">
                                            <div class="row card-body p-0">
                                                <div class="col-5">
                                                    <img src="${service.image}" alt="service image" style="width: 100%; height: 80px; object-fit: cover; padding: 0; margin: 0;" />
                                                </div>
                                                <div class="col-7 mt-3">
                                                    <h6 class="card-subtitle mb-2 text-body-secondary no-underline" style="text-decoration: none !important;">${service.name}</h6>
                                                    <div class="row">
                                                        <div class="col-12">
                                                            <span>Ksh: ${service.price}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </a>
                                `).join('');

                                businessInfoContainer.innerHTML = `
                                    <div class="card">
                                        <img src="${business.poster}" class="img-fluid" style="height: 500px;" alt="business image" />
                                        <div class="card-body">
                                            <h5 class="card-title">${business.businessname}</h5>
                                            <p class="card-text">${business.description}</p>
                                            <div class="row">
                                                <div class="col-8">
                                                    Rating: ${business.review}
                                                </div>

                                            </div>
                                            <div class="mt-4">
                                                <h5 class="mb-4">Services</h5>
                                                <div class="row">
                                                    ${servicesHTML}
                                                </div>
                                            </div>
                                        </div>
                                        </div>
                                    </div>
                                `;

                                // Add event listeners to each service item to update and show the modal
                                const serviceItems = document.querySelectorAll('.service-item');
                                serviceItems.forEach(item => {
                                    item.addEventListener('click', event => {
                                        event.preventDefault(); // Prevent default anchor behavior
                                        const index = event.currentTarget.getAttribute('data-index');
                                        const service = business.services[index];
                                        document.getElementById('serviceModalLabel').innerText = `Book a ${service.name} session`;
                                        document.getElementById('modalServicePrice').innerText = `Ksh: ${service.price}`;

                                        // Show the modal
                                        document.getElementById('serviceModal').classList.add('show');
                                        document.getElementById('serviceModal').style.display = 'block';
                                        document.body.classList.add('modal-open');
                                    });
                                });

                                // Add event listener to the Book button
                                document.getElementById('bookButton').addEventListener('click', () => {
                                    const yourEmail = document.getElementById('service-email').value;
                                    const appointmentDate = document.getElementById('appointmentDate').value;
                                    const otherSpecifications = document.getElementById('otherSpecifications').value;
                                    
                                    fetch(`http://localhost:3000/bookings`, {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json'
                                        },
                                        body: JSON.stringify({
                                            yourEmail,
                                            appointmentDate,
                                            otherSpecifications,
                                            service: document.getElementById('serviceModalLabel').innerText,
                                            price: document.getElementById('modalServicePrice').innerText
                                        })
                                    })
                                    .then(response => response.json())
                                    .then(data => {
                                        console.log(data);
                                    })
                                    .catch(error => {
                                        console.error('Error:', error);
                                    });
                                    // You can send this data to your server here
                                });

                            } else {
                                businessInfoContainer.innerHTML = '<p class="mt-5 text-center w-100">No business found with this ID.</p>';
                            }
                        })
                        .catch(error => {
                            businessInfoContainer.innerHTML = '<p class="mt-5 text-center w-100">An error ocurred.</p>';
                        });
                });
            });
        })
        .catch(error => console.error(`Error fetching the businesses: ${error}`));
}
