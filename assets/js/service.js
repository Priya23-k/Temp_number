const urlParams = new URLSearchParams(window.location.search);
const serviceId = urlParams.get('serviceid');

// Function to display error when no service ID is provided
// Function to update service details dynamically
function updateServiceDetails(serviceId) {
  fetch('/data/data.json') // Path to your JSON file
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Fetched Data:", data); // Debugging: check the structure of the fetched data
      const service = data.services.find(s => s.serviceid.toString() === serviceId.toString());

      if (service) {
        // Update service name
        const serviceNameEls = document.querySelectorAll('.servicename');
        serviceNameEls.forEach(el => el.textContent = service.servicename);

        // Update service image
        const serviceImage = document.querySelector('.serviceimage');
        if (serviceImage) {
          serviceImage.src = service.serviceimage;
        }

        // Update service description
        const serviceDescriptionEl = document.querySelector('.servicedescription');
        if (serviceDescriptionEl) {
          serviceDescriptionEl.textContent = service.servicedescription;
        }
      } else {
        // If service not found, log and show a message
        console.error("Service not found!");
        const serviceNameEls = document.querySelectorAll('.servicename');
        serviceNameEls.forEach(el => el.textContent = "Service Not Found");

        const serviceDescriptionEl = document.querySelector('.servicedescription');
        if (serviceDescriptionEl) {
          serviceDescriptionEl.textContent = "The requested service could not be located.";
        }
      }
    })
    .catch(error => {
      console.error('Error loading service data:', error);
    });
}

// Function to handle missing service ID
function handleMissingServiceId() {
  console.error("No service ID provided in the URL.");
  const serviceNameEls = document.querySelectorAll('.servicename');
  serviceNameEls.forEach(el => el.textContent = "Service Not Found");

  const serviceDescriptionEl = document.querySelector('.servicedescription');
  if (serviceDescriptionEl) {
    serviceDescriptionEl.textContent = "The service ID is missing or invalid.";
  }
}

// Function to get query parameter from the URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Main execution
const serviceId1 = getQueryParam('serviceid'); // Get service ID from the URL
if (!serviceId1) {
  handleMissingServiceId(); // Handle the case where no service ID is provided
} else {
  updateServiceDetails(serviceId); // Update service details based on the service ID
}

// Fetch data for dropdowns (service and country) and update the URL parameters dynamically
fetchDropdownData();


// Function to get query parameter from the URL
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Function to update query parameters in the URL
function updateQueryParam(param, value) {
  const urlParams = new URLSearchParams(window.location.search);
  if (value) {
    urlParams.set(param, value); // Update or add the parameter
  } else {
    urlParams.delete(param); // Remove the parameter if value is empty
  }
  window.history.replaceState(null, '', `?${urlParams.toString()}`); // Update URL without reloading
}

// Function to fetch data and populate dropdowns
function fetchDropdownData() {
  const selectedServiceId = getQueryParam('serviceid'); // Get serviceid from URL
  const selectedCountryId = getQueryParam('countryid'); // Get countryid from URL

  fetch('/data/data.json') // Path to your JSON file
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to fetch JSON: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log("Fetched Data:", data); // Debugging

      // Populate the service dropdown
      const serviceDropdown = document.getElementById('try_service');
      if (serviceDropdown && data.services) {
        let serviceOptions = `<option value="" disabled ${!selectedServiceId ? 'selected' : ''}>Select a service</option>`;
        data.services.forEach(service => {
          serviceOptions += `<option value="${service.serviceid}" ${selectedServiceId == service.serviceid ? 'selected' : ''}>${service.servicename}</option>`;
        });
        serviceDropdown.innerHTML = serviceOptions;

        // Add event listener to update the URL and content when the user selects a new service
        serviceDropdown.addEventListener('change', (event) => {
          const newServiceId = event.target.value;
          updateQueryParam('serviceid', newServiceId); // Update serviceid in URL
          updateServiceDetails(newServiceId); // Update page content dynamically
        });
      }

      // Populate the country dropdown
      const countryDropdown = document.getElementById('try_country');
      if (countryDropdown && data.countries) {
        let countryOptions = `<option value="" disabled ${!selectedCountryId ? 'selected' : ''}>Select a country</option>`;
        data.countries.forEach(country => {
          countryOptions += `<option value="${country.countryid}" ${selectedCountryId == country.countryid ? 'selected' : ''}>${country.countryname}</option>`;
        });
        countryDropdown.innerHTML = countryOptions;

        // Add event listener to update the URL when the user selects a new country
        countryDropdown.addEventListener('change', (event) => {
          const newCountryId = event.target.value;
          updateQueryParam('countryid', newCountryId); // Update countryid in URL
        });
      }
    })
    .catch(error => {
      console.error("Error fetching dropdown data:", error);
    });
}

// Main execution
if (!serviceId) {
  handleMissingServiceId();
} else {
  updateServiceDetails(serviceId); // Load service details based on service ID
}
fetchDropdownData(); // Populate dropdowns
