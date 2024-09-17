/**
 * Script to clean a JSON file by removing unnecessary fields and adding a sequential ID at the start of each object.
 */

import fs from 'fs-extra';

const filePath = 'database/khutbahs_main_data.json';

const fieldsToRemove = [
    'author_id',
    'read_at',
    'views',
    'print',
    'downloads',
    'search',
    'id',
    'category',
    'rate',
    'page'
];

const authorFieldsToRemove = [
    'id',
    'username'
];

async function cleanJsonFile() {
    try {
        const jsonData = await fs.readJson(filePath);

        const cleanedData = jsonData.map((item, index) => {
            fieldsToRemove.forEach(field => delete item[field]);

            if (item.author) {
                authorFieldsToRemove.forEach(field => delete item.author[field]);
            }

            const newItem = { id: index + 1, ...item };

            return newItem;
        });

        await fs.writeJson(filePath, cleanedData, { spaces: 2 });
        console.log(`Cleaned data with sequential IDs at the start saved to ${filePath}`);
    } catch (error) {
        console.error(`Error cleaning JSON file: ${error.message}`);
    }
}

cleanJsonFile();
