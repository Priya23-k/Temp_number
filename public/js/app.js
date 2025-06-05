document.addEventListener('DOMContentLoaded', function () {
  const currentPage = window.location.pathname;

  if (currentPage.includes('/app/countries')) {
    fetchCountries();
    const continueButton = document.getElementById('continueButton');
    continueButton.disabled = true; // Disable the button initially
  } else if (currentPage.includes('/app/services')) {
    fetchServices();
    const continueButton = document.getElementById('continueButton');
    continueButton.disabled = true; // Disable the button initially
  }
});

function selectCountry(countryCode, countryName, dialCode) {
  // console.log("Received:", { countryCode, countryName, dialCode }); // Debugging log
  
  localStorage.setItem('selectedCountry', countryName);
  localStorage.setItem('selectedCountryCode', countryCode);
  localStorage.setItem('selectedDialCode', dialCode);
  
  console.log('Stored Country:', countryName, 'Code:', countryCode, 'Dial Code:', dialCode);
  
  document.querySelectorAll('#countryList .list-group-item').forEach(item => {
    item.classList.remove('selected');
  });

  const selectedItem = document.querySelector(`[data-code="${countryCode}"]`);
  if (selectedItem) {
    selectedItem.classList.add('selected');
  }

  document.getElementById('continueButton').disabled = false;
}

function selectService(serviceCode, serviceName, price) {
  localStorage.setItem('selectedService', serviceName); // Store the service name
  localStorage.setItem('selectedServiceCode', serviceCode); // Store the service ID
  localStorage.setItem('selectedPrice', price); // Store the price
  console.log('Stored Service:', serviceName, 'ID:', serviceCode, 'Price:', price); // Log stored data

  // Remove previous selection
  document.querySelectorAll('#serviceList .list-group-item').forEach(item => {
    item.classList.remove('selected');
  });

  // Add selected class to the clicked item
  const selectedItem = Array.from(document.querySelectorAll('#serviceList .list-group-item'))
    .find(button => button.textContent.includes(serviceName));

  if (selectedItem) {
    selectedItem.classList.add('selected');
  }

  // Enable continue button
  document.getElementById('continueButton').disabled = false;
}

async function fetchCountries() {
  try {
    const response = await fetch('/api/countries');
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

    const data = await response.json();
    if (data.success) {
      populateCountryList(data.countries);
    } else {
      console.error('Failed to fetch countries:', data.message);
    }
  } catch (error) {
    console.error('Error fetching countries:', error);
  }
}

function populateCountryList(countries) {
  const countryList = document.getElementById('countryList');
  countryList.innerHTML = '';

  countries.forEach(country => {
    const listItem = document.createElement('a');
    listItem.href = '#';
    listItem.className = 'list-group-item list-group-item-action';
    listItem.textContent = country.name;
    listItem.dataset.code = country.code;
    listItem.dataset.dialCode = country.dial_code;
    listItem.addEventListener('click', () => selectCountry(country.code, country.name, country.dial_code)); // Pass country code and name
    countryList.appendChild(listItem);
  });
}

async function fetchServices() {
  const countryCode = localStorage.getItem('selectedCountryCode'); // Retrieve the country code
  console.log('Selected Country Code:', countryCode); // Log selected country code

  if (!countryCode) {
    alert('No country selected! Redirecting...');
    window.location.href = '/app/countries';
    return;
  }

  try {
    const response = await fetch('/api/services'); // Fetch all services
    const data = await response.json();

    console.log('API Response (All Services):', data); // Log all services

    if (data.success) {
      // Filter services for the selected country code
      const filteredServices = data.services.filter(service => service.country === countryCode);
      console.log('Filtered Services:', filteredServices); // Log filtered services
      displayServices(filteredServices);
    } else {
      document.getElementById('serviceList').innerHTML = `<p class="text-danger">Failed to fetch services.</p>`;
    }
  } catch (error) {
    console.error('Error fetching services:', error);
  }
}

function displayServices(services) {
  const serviceList = document.getElementById('serviceList');
  serviceList.innerHTML = '';

  if (services.length === 0) {
    serviceList.innerHTML = `<p class="text-warning">No services available for this country.</p>`;
    return;
  }

  services.forEach(service => {
    console.log('Service Data:', service); // Debugging log
    if (!service.service) {
      console.warn('Service ID is missing for:', service);
    }
    const button = document.createElement('button');
    button.className = 'list-group-item list-group-item-action';
    button.textContent = `${service.serviceDescription}`;
    button.onclick = () => selectService(service.service, service.serviceDescription, service.price);
    serviceList.appendChild(button);
  });
}