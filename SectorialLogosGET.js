import fs from 'fs'; // For file system operations
import fetch from 'node-fetch'; // For making HTTP requests
import path from 'path'; // For path operations

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

// Function to download and save a logo
async function downloadAndSaveLogo(url, logoPath) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const buffer = await response.buffer();
        fs.writeFileSync(logoPath, buffer);
        console.log(`Logo saved to ${logoPath}`);
    } catch (error) {
        console.error(`Error downloading logo from ${url}:`, error);
        fs.appendFileSync('error.log', `${new Date().toISOString()} - ${error.message}\n`);
    }
}

// Function to process a faction and download logos for all units
async function processFaction(factionFolderPath) {
    const files = fs.readdirSync(factionFolderPath);
    
    for (const file of files) {
        if (path.extname(file) === '.json') {
            const filePath = path.join(factionFolderPath, file);
            const data = readJSONFile(filePath);
            
            for (const unit of data.units) {
                for (const profileGroup of unit.profileGroups) {
                    for (const profile of profileGroup.profiles) {
                        if (profile.logo) {
                            const logoFolderPath = path.join(factionFolderPath, 'logos');

                            // Create the 'logos' folder if it does not exist
                            if (!fs.existsSync(logoFolderPath)) {
                                fs.mkdirSync(logoFolderPath, { recursive: true });
                            }

                            const logoFilename = path.basename(profile.logo);
                            const logoPath = path.join(logoFolderPath, logoFilename);

                            await downloadAndSaveLogo(profile.logo, logoPath);
                        }
                    }
                }
            }
        }
    }
}

// Main function to process all factions and download logos
async function main() {
    const n4FolderPath = './N4';
    const factions = fs.readdirSync(n4FolderPath);

    for (const faction of factions) {
        const factionFolderPath = path.join(n4FolderPath, faction);

        if (fs.lstatSync(factionFolderPath).isDirectory()) {
            await processFaction(factionFolderPath);
        }
    }
}

// Run the main function
main();
