let selectedService = null;
let selectedCountry = null;

async function fetchServices() {
    try {
        document.getElementById('serviceList').innerHTML = `
            <div class="text-center mt-3">
                <div class="spinner-border text-primary" role="status"></div>
                <p>Loading services...</p>
            </div>
        `;

        const response = await fetch('http://localhost:3000/api/try_now/services');

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const services = await response.json();

        if (!Array.isArray(services)) {
            console.error("❌ Error: API response is not an array.", services);
            document.getElementById('serviceList').innerHTML = "<p class='text-danger'>Error loading services.</p>";
            return;
        }

        const serviceList = document.getElementById('serviceList');
        serviceList.innerHTML = services.map(service => `
            <div class="list-group-item service-item" 
                data-id="${service.id || service.service_id || ''}" 
                data-name="${service.name || 'Unnamed Service'}">
                ${service.name || 'Unnamed Service'}
            </div>
        `).join('');

        document.querySelectorAll('.service-item').forEach(item => {
            item.addEventListener('click', function () {
                selectService(this);
            });
        });

    } catch (error) {
        console.error("❌ Error fetching services:", error.message);
        document.getElementById('serviceList').innerHTML = "<p class='text-danger'>Failed to load services. Please try again.</p>";
    }
}

function selectService(element) {
    document.querySelectorAll('.service-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');

    const serviceId = element.getAttribute('data-id');
    const serviceName = element.getAttribute('data-name');

    if (!serviceId || serviceId.trim() === '') {
        console.error("❌ Error: Service ID is missing.");
        return;
    }

    selectedService = { id: serviceId, name: serviceName };
    console.log("✅ Selected Service:", selectedService);
}

async function fetchCountries() {
    if (!selectedService) {
        alert("Please select a service first.");
        return;
    }

    document.getElementById('country').innerHTML = `
        <div class="text-center mt-3">
            <div class="spinner-border text-primary" role="status"></div>
            <p>Loading countries...</p>
        </div>
    `;

    try {
        const response = await fetch(`https://temp-number-api.com/test/api/v1/activation/prices/services?service_id=${selectedService.id}`);

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const data = await response.json();

        if (!data || !data.countries) {
            console.error("❌ Error: API response does not contain country data.", data);
            document.getElementById('country').innerHTML = "<p class='text-danger'>Error loading countries.</p>";
            return;
        }

        const countryList = document.getElementById('country');
        countryList.innerHTML = Object.entries(data.countries).map(([countryCode, countryName]) => `
            <div class="list-group-item country-item" 
                data-code="${countryCode}" 
                data-name="${countryName}">
                ${countryName}
            </div>
        `).join('');

        document.querySelectorAll('.country-item').forEach(item => {
            item.addEventListener('click', function () {
                selectCountry(this);
            });
        });

    } catch (error) {
        console.error("❌ Error fetching countries:", error.message);
        document.getElementById('country').innerHTML = "<p class='text-danger'>Failed to load countries. Please try again.</p>";
    }
}

function selectCountry(element) {
    document.querySelectorAll('.country-item').forEach(item => item.classList.remove('active'));
    element.classList.add('active');

    const countryCode = element.getAttribute('data-code');
    const countryName = element.getAttribute('data-name');

    selectedCountry = { code: countryCode, name: countryName };
    console.log("✅ Selected Country:", selectedCountry);
}

function showStep(stepNumber) {
    if (stepNumber === 2) {
        if (!selectedService) {
            alert("Please select a service before continuing.");
            return;
        }
        document.getElementById('step1').style.display = 'none';
        document.getElementById('step2').style.display = 'block';
        fetchCountries(); // Fetch countries for the selected service
    } else if (stepNumber === 1) {
        document.getElementById('step1').style.display = 'block';
        document.getElementById('step2').style.display = 'none';
    } else if (stepNumber === 3) {
        if (!selectedCountry) {
            alert("Please select a country before continuing.");
            return;
        }
        const url = `/try_now/service?service_id=${encodeURIComponent(selectedService.id)}&country=${encodeURIComponent(selectedCountry.code)}`;
        console.log("🔗 Redirecting to:", url);
        window.location.href = url;
    }
}

document.addEventListener("DOMContentLoaded", fetchServices);
