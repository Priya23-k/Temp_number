const urlParams = new URLSearchParams(window.location.search);
const serviceId = urlParams.get('id');

if (!serviceId) {
  console.error("No service ID provided in the URL.");
  document.querySelector('.servicename').textContent = "Service Not Found";
  document.querySelector('.servicedescription').textContent = "The service ID is missing or invalid.";
} else {
  // Fetch the data from the JSON file
  fetch('/data/data.json')
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      // Find the service with the matching ID
      const service = data.services.find(s => s.id.toString() === serviceId);

      if (service) {
        // Update the HTML with the service details
        document.querySelectorAll('.servicename').forEach(el => {
          el.textContent = service.servicename;
        });
        document.querySelector('.serviceimage').src = service.serviceimage;
        document.querySelector('.servicedescription').textContent = service.servicedescription;
      } else {
        // If no service is found, show an error message
        document.querySelectorAll('.servicename').forEach(el => {
          el.textContent = "Service Not Found";
        });
        document.querySelector('.servicedescription').textContent = "The requested service could not be located.";
        console.error("Service not found!");
      }

      // Generate the service list dynamically
      const placeholder = document.getElementById('try_service');
        if (placeholder) {
          // Find the selected service by ID or use a default value
          const selectedService = data.services.find(s => s.id.toString() === serviceId);

          // Dynamically generate the dropdown options
          let out = `<option selected>${selectedService ? selectedService.servicename : "Select a Service"}</option>`;
          for (let service of data.services) {
            if (!selectedService || service.servicename !== selectedService.servicename) {
              out += `
                <option value="${service.servicename}">${service.servicename}</option>
              `;
            }
          }
          placeholder.innerHTML = out;
        }
    })
    .catch(error => {
      console.error('Error loading data:', error);
    });
}
