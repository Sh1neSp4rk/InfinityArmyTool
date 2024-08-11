// main.js
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

// URLs for the API endpoints
const urls = {
    N4: "https://api.corvusbelli.com/army/infinity/en/metadata",
    CodeOne: "https://api.corvusbelli.com/army/codeone/en/metadata"
};

// Import headers from JSON file
const headers = JSON.parse(fs.readFileSync('headers.json', 'utf-8'));

// Function to fetch and save JSON data
async function fetchAndSaveData(url, folder, filename) {
    try {
        const response = await fetch(url, { headers });
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // Ensure the folder exists
        if (!fs.existsSync(folder)){
            fs.mkdirSync(folder, { recursive: true }); // Create folder and any necessary parent folders
        }

        // Save the JSON data to a file within the specified folder
        const filePath = path.join(folder, filename);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`Data saved to ${filePath}`);
    } catch (error) {
        console.error('Error fetching or saving data:', error);
        fs.appendFileSync('error.log', `${new Date().toISOString()} - ${error.message}\n`);
    }
}

// Fetch and save data for N4
fetchAndSaveData(urls.N4, 'N4', 'N4_metadata.json');

// Fetch and save data for CodeOne
fetchAndSaveData(urls.CodeOne, 'CodeOne', 'CodeOne_metadata.json');
