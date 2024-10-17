document.getElementById('consumption-form').addEventListener('submit', function (e) {
    e.preventDefault();

    const month = document.getElementById('month').value;
    const waterConsumption = parseFloat(document.getElementById('water-consumption').value);
    const electricityConsumption = parseFloat(document.getElementById('electricity-consumption').value);

    // Fetch existing data from localStorage or initialize an empty array
    const consumptionData = JSON.parse(localStorage.getItem('consumptionData')) || [];

    // Add the new entry
    const newEntry = {
        month: month,
        waterConsumption: waterConsumption,
        electricityConsumption: electricityConsumption
    };
    consumptionData.push(newEntry);

    // Save updated data back to localStorage
    localStorage.setItem('consumptionData', JSON.stringify(consumptionData));

    // Refresh display and chart
    displayData();
    updateChart();
});

// Function to display the data and calculate increase or decrease
function displayData() {
    const consumptionData = JSON.parse(localStorage.getItem('consumptionData')) || [];
    const display = document.getElementById('display');
    display.innerHTML = ''; // Clear previous content

    if (consumptionData.length === 0) {
        display.innerHTML = '<p>No data available.</p>';
        return;
    }

    consumptionData.forEach((data, index) => {
        const formattedMonth = new Date(data.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        let waterDifference = 0;
        let electricityDifference = 0;

        if (index > 0) {
            const previousData = consumptionData[index - 1];
            waterDifference = data.waterConsumption - previousData.waterConsumption;
            electricityDifference = data.electricityConsumption - previousData.electricityConsumption;
        }

        display.innerHTML += `
            <div>
                <h3>Month: ${formattedMonth}</h3>
                <p>Water Consumption: ${data.waterConsumption} liters</p>
                <p>Electricity Consumption: ${data.electricityConsumption} kWh</p>
                ${index > 0 ? `
                    <p>Water Change: ${waterDifference > 0 ? '+' : ''}${waterDifference} liters</p>
                    <p>Electricity Change: ${electricityDifference > 0 ? '+' : ''}${electricityDifference} kWh</p>
                    <p>${suggestChanges(waterDifference, electricityDifference)}</p>
                ` : ''}
                <hr>
            </div>
        `;
    });
}

// Suggest changes to become more sustainable if consumption has increased
function suggestChanges(waterDifference, electricityDifference) {
    let suggestions = '';
    
    if (waterDifference > 0) {
        suggestions += 'Water consumption increased. Consider using low-flow faucets or shorter showers. ';
    }
    if (electricityDifference > 0) {
        suggestions += 'Electricity consumption increased. Consider using energy-efficient appliances or turning off unused devices.';
    }

    return suggestions || 'Great! Your consumption is stable or has decreased!';
}

// Update the graph using Chart.js
function updateChart() {
    const consumptionData = JSON.parse(localStorage.getItem('consumptionData')) || [];

    // Only take the last 6 months of data
    const recentData = consumptionData.slice(-6);

    const labels = recentData.map(data => new Date(data.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
    const waterData = recentData.map(data => data.waterConsumption);
    const electricityData = recentData.map(data => data.electricityConsumption);

    const ctx = document.getElementById('consumptionChart').getContext('2d');

    // Create a new chart or update an existing one
    if (window.myChart) {
        window.myChart.destroy(); // Destroy the old chart instance to prevent duplicates
    }
    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Water Consumption (liters)',
                data: waterData,
                borderColor: 'rgba(54, 162, 235, 1)',
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderWidth: 1,
                fill: true
            }, {
                label: 'Electricity Consumption (kWh)',
                data: electricityData,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderWidth: 1,
                fill: true
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'category',
                    title: {
                        display: true,
                        text: 'Month'
                    },
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 6 // Adjust the maximum number of ticks displayed
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Consumption'
                    }
                }
            }
        }
    });

    // Analyze consumption and give suggestions
    analyzeConsumption(waterData, electricityData);
}

// Analyze consumption and determine if levels are optimal
function analyzeConsumption(waterData, electricityData) {
    const avgWater = waterData.reduce((a, b) => a + b, 0) / waterData.length;
    const avgElectricity = electricityData.reduce((a, b) => a + b, 0) / electricityData.length;

    const optimalWaterConsumption = 1000; // Example value for optimal water consumption
    const optimalElectricityConsumption = 300; // Example value for optimal electricity consumption

    let analysis = '';

    if (avgWater > optimalWaterConsumption) {
        analysis += `Your average water consumption is above the optimal level. Consider taking shorter showers or using water-saving appliances.<br>`;
    } else {
        analysis += `Your average water consumption is within the optimal level.<br>`;
    }

    if (avgElectricity > optimalElectricityConsumption) {
        analysis += `Your average electricity consumption is above the optimal level. Consider switching to energy-efficient lighting or unplugging unused electronics.<br>`;
    } else {
        analysis += `Your average electricity consumption is within the optimal level.<br>`;
    }
}

// Initial display and chart when the page loads
displayData();
updateChart();
