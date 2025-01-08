// Store selected values globally
let selectedService = '';
let selectedCountry = '';

// Function to update the selected service
function updateSelectedService(service) {
    selectedService = service;
}

// Function to update the selected country
function updateSelectedCountry(country) {
    selectedCountry = country;
}

// Function to show steps and update the UI
function showStep(step) {
    // Hide all steps initially
    document.getElementById('step1').style.display = step === 1 ? 'block' : 'none';
    document.getElementById('step2').style.display = step === 2 ? 'block' : 'none';
    document.getElementById('step3').style.display = step === 3 ? 'block' : 'none';
    document.getElementById('step4').style.display = step === 4 ? 'block' : 'none';

    // If we are on step 3, update the displayed values for service and country
    if (step === 3) {
        document.getElementById('selectedService').textContent = selectedService || 'N/A';
        document.getElementById('selectedCountry').textContent = selectedCountry || 'N/A';
    }
}

// Fetch and display services in Step 1
fetch("/data/data.json")
.then(function(response) {
    return response.json(); 
})
.then(function(data) {
    let placeholder = document.getElementById('try_service');
    let out = "";

    for (let service of data.services) {
        out += `
        <div class="form-check">
            <img src="${service.serviceimage}" alt="${service.servicename}" style="width: 40px; height: 40px; margin-right: 10px;">
            <input class="form-check-input" type="radio" name="service" id="${service.servicename}" value="${service.servicename}" onclick="updateSelectedService('${service.servicename}')">
            <label class="form-check-label" for="${service.servicename}">${service.servicename}</label>
        </div>
        `;
    }
    placeholder.innerHTML = out;
})
.catch(function(error) {
    console.error("Error fetching or processing data:", error);
});

// Fetch and display countries in Step 2
fetch("/data/data.json")
.then(function(response) {
    return response.json(); 
})
.then(function(data) {
    let countryPlaceholder = document.getElementById('try_country');
    let out = "";

    for (let country of data.countries) {
        out += `
        <div class="form-check d-flex align-items-center mb-3">
            <img src="${country.countryimage}" alt="${country.countryname}" style="width: 40px; height: 40px; margin-right: 10px;">
            <input class="form-check-input me-2" type="radio" name="country" id="${country.countryname}" value="${country.countryname}" onclick="updateSelectedCountry('${country.countryname}')">
            <label class="form-check-label" for="${country.countryname}">${country.countryname} (${country.countrycode})</label>
        </div>
        `;
    }
    countryPlaceholder.innerHTML = out;
})
.catch(function(error) {
    console.error("Error fetching or processing data:", error);
});
