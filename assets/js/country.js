// country
function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  console.log('URL Params:', urlParams); // Debug log to check available parameters
  return urlParams.get(param);
}


function fetchCountryData() {
  const countryId = getQueryParam('id');
  console.log('Country ID:', countryId);

  if (!countryId) return;

  fetch('/data/data.json') // Adjust the path if needed
    .then(response => response.json())
    .then(data => {
      console.log('Fetched Data:', data);
      const countryData = data.countries.find(
        country => country.id === parseInt(countryId)
      );
      console.log('Country Data:', countryData);

      if (countryData) {
        // Update country name
        document.querySelectorAll('.countryname').forEach(element => {
          element.textContent = countryData.countryname;
        });

        // Update country description
        const descriptionElement = document.querySelector('.countrydescription');
        if (descriptionElement) {
          descriptionElement.textContent = countryData.countrydescription;
        }

        // Update country image
        const imageElement = document.querySelector('.countryimage');
        if (imageElement) {
          imageElement.src = countryData.countryimage || 'default-image.png'; // Fallback if image is missing
          imageElement.alt = `Flag of ${countryData.countryname}`;
        }

        // Update country code
        const countryCodeElement = document.querySelector('.countrycode');
        if (countryCodeElement) {
          countryCodeElement.textContent = countryData.countrycode || 'N/A'; // Default if country code is missing
        }
      } else {
        console.error('Country not found in the data file');
      }
    })
    .catch(error => {
      console.error('Error fetching country data:', error);
    });
}

// Call the function on page load
fetchCountryData();
