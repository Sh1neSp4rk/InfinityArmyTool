import fs from 'fs'; // For file system operations
import fetch from 'node-fetch'; // For making HTTP requests
import path from 'path'; // For handling file and directory paths

// Paths to the files
const metadataFilePath = './CodeOne/CodeOne_metadata.json';
const headersFilePath = './headers.json';

// Function to read JSON data from a file
function readJSONFile(filePath) {
    try {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading JSON file ${filePath}:`, error);
        process.exit(1); // Exit with error code
    }
}

// Function to fetch and save JSON data for each faction
async function fetchAndSaveFactionData(factions, headers) {
    for (const faction of factions) {
        const url = `https://api.corvusbelli.com/army/units/en/${faction.id}`;
        const filePath = path.join('./CodeOne', `${faction.name}.json`);

        try {
            const response = await fetch(url, { headers });
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();

            // Save the JSON data to a file
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
            console.log(`Data for ${faction.name} saved to ${filePath}`);
        } catch (error) {
            console.error(`Error fetching or saving data for ${faction.name}:`, error);
            fs.appendFileSync('error.log', `${new Date().toISOString()} - ${error.message}\n`);
        }
    }
}

// Main function to read metadata and start fetching faction data
async function main() {
    const headers = readJSONFile(headersFilePath);
    const metadata = readJSONFile(metadataFilePath);
    const factions = metadata.factions;

    if (!factions || factions.length === 0) {
        console.log('No factions found in the metadata.');
        return;
    }

    await fetchAndSaveFactionData(factions, headers);
}

// Run the main function
main();
