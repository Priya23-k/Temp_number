const defaultOptionText = "Choose a country";

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

  fetch('/data/data.json') // Adjust the path to your `data.json` file
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

        // Add event listener to update the URL and fetch related data when a new service is selected
        serviceDropdown.addEventListener('change', (event) => {
          const newServiceId = event.target.value;
          updateQueryParam('serviceid', newServiceId); // Update serviceid in URL
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

        // Add event listener to update the URL and fetch related data when a new country is selected
        countryDropdown.addEventListener('change', (event) => {
          const newCountryId = event.target.value;
          updateQueryParam('countryid', newCountryId); // Update countryid in URL
          fetchAdditionalData('country', newCountryId, data); // Fetch related data
        });
      }

      // Fetch additional data based on pre-selected values from the URL
      if (selectedCountryId) {
        fetchAdditionalData('country', selectedCountryId, data);
      }
    })
    .catch(error => {
      console.error("Error fetching dropdown data:", error);
    });
}

// Function to fetch and display additional data
// Function to fetch and display additional data
function fetchAdditionalData(type, id, data) {
  if (type === 'country') {
    const selectedCountry = data.countries.find(country => country.countryid == id);
    console.log("Selected Country:", selectedCountry); // Debugging
    
    if (selectedCountry) {
      // Update all instances of `.countryname`
      const countryNameElements = document.querySelectorAll('.countryname');
      countryNameElements.forEach((element) => {
        element.textContent = selectedCountry.countryname || "Unknown Country";
      });

      // Update country description
      const countryDescription = document.querySelectorAll('.countrydescription');
      countryDescription.forEach((element) => {
        element.textContent = selectedCountry.countrydescription || "No description available.";
      });

      // Update country image
      const countryImageElements = document.querySelectorAll('.countryimage');
      countryImageElements.forEach((element) => {
        element.src = selectedCountry.countryimage || '/assets/image/default.png';
        element.alt = `Flag of ${selectedCountry.countryname}`;
      });

      // Update country code
      const countryCodeElements = document.querySelectorAll('.countrycode');
      countryCodeElements.forEach((element) => {
        element.textContent = selectedCountry.countrycode || "N/A";
      });
    } else {
      console.warn(`Country with ID ${id} not found.`);
    }
  }
}

// Call the function to fetch and populate data
fetchDropdownData();

