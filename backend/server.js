const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const app = express();
const port = 3000;

// Constants for carbon footprint calculation
const ELECTRICITY_FACTOR = 0.92; // lbs CO2 per kWh
const WATER_FACTOR = 0.18; // lbs CO2 per gallon

// In-memory storage (replace with a database in a production environment)
let consumptionData = [];

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Get all consumption data
app.get('/api/consumption', (req, res) => {
  res.json(consumptionData);
});

// Add new consumption data and return results
app.post('/api/consumption', (req, res) => {
  const { month, electricity, water } = req.body;
  const carbonFootprint = calculateCarbonFootprint(electricity, water);
  const newEntry = { month, electricity, water, carbonFootprint };
  consumptionData.push(newEntry);
  
  const results = generateResults(newEntry);
  res.status(201).json(results);
});

function calculateCarbonFootprint(electricity, water) {
  return (electricity * ELECTRICITY_FACTOR) + (water * WATER_FACTOR);
}

function generateResults(entry) {
  const previousEntry = consumptionData[consumptionData.length - 2];
  let feedback, trend;

  if (previousEntry) {
    const change = entry.carbonFootprint - previousEntry.carbonFootprint;
    if (change > 0) {
      feedback = `Your carbon footprint increased by ${change.toFixed(2)} lbs CO2. Try to reduce your consumption by using energy-efficient appliances and fixing any water leaks.`;
      trend = 'increase';
    } else if (change < 0) {
      feedback = `Great job! Your carbon footprint decreased by ${Math.abs(change).toFixed(2)} lbs CO2. Keep up the good work!`;
      trend = 'decrease';
    } else {
      feedback = `Your carbon footprint remained the same. Consider ways to further reduce your consumption.`;
      trend = 'same';
    }
  } else {
    feedback = `This is your first entry. Keep tracking to see your progress!`;
    trend = 'first';
  }

  return {
    carbonFootprint: entry.carbonFootprint.toFixed(2),
    feedback,
    trend,
    entry
  };
}

app.listen(port, () => {
  console.log(`EcoMate backend running at http://localhost:${port}`);
});