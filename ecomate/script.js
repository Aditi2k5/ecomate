// Optimal consumption thresholds (adjust as needed)
const optimalWaterConsumption = 1500; // in liters per month
const optimalElectricityConsumption = 100; // in kWh per month

// Consumption Data Array stored in localStorage
const consumptionData = JSON.parse(localStorage.getItem('consumptionData')) || [];

document.getElementById('dataForm').addEventListener('submit', function (e) {
    e.preventDefault();
    
    const month = document.getElementById('month').value;
    const waterConsumption = parseInt(document.getElementById('waterConsumption').value);
    const electricityConsumption = parseInt(document.getElementById('electricityConsumption').value);

    const newData = { month, waterConsumption, electricityConsumption };
    consumptionData.push(newData);
    
    localStorage.setItem('consumptionData', JSON.stringify(consumptionData));
    displayData();
    updateChart();
});

// Function to update the chart
function updateChart() {
    const recentData = consumptionData.slice(-6); // Get last 6 months of data
    const labels = recentData.map(data => new Date(data.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    const waterData = recentData.map(data => data.waterConsumption);
    const electricityData = recentData.map(data => data.electricityConsumption);

    const ctx = document.getElementById('consumptionChart').getContext('2d');
    if (window.myChart) window.myChart.destroy(); // Avoid duplicate charts

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                { label: 'Water Consumption (liters)', data: waterData, borderColor: '#52b788', fill: false },
                { label: 'Electricity Consumption (kWh)', data: electricityData, borderColor: '#2d6a4f', fill: false }
            ]
        },
        options: { responsive: true }
    });
}

// Function to display data and provide suggestions
function displayData() {
    const display = document.getElementById('display');
    display.innerHTML = ''; // Clear previous content

    consumptionData.forEach((data, index) => {
        const monthFormatted = new Date(data.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        let suggestions = '';

        // Compare consumption data to optimal values and provide suggestions
        if (data.waterConsumption > optimalWaterConsumption) {
            suggestions += `<p style="color: red;">High water consumption! Consider reducing shower time, fixing leaks, or using water-efficient appliances.</p>`;
        }

        if (data.electricityConsumption > optimalElectricityConsumption) {
            suggestions += `<p style="color: red;">High electricity consumption! Try switching to energy-efficient appliances, turning off lights when not in use, or using solar power.</p>`;
        }

        if (suggestions === '') {
            suggestions = `<p style="color: green;">Great! Your consumption is within optimal levels.</p>`;
        }

        display.innerHTML += `
            <div>
                <h3>Month: ${monthFormatted}</h3>
                <p>Water Consumption: ${data.waterConsumption} liters</p>
                <p>Electricity Consumption: ${data.electricityConsumption} kWh</p>
                ${suggestions}
                <hr>
            </div>
        `;
    });
}

// Clear all data from localStorage
function clearData() {
    localStorage.removeItem('consumptionData');
    location.reload();
}

// Initialize display and chart
displayData();
updateChart();
