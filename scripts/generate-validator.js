// Script to generate a standalone validator from the JSON schema
// This avoids runtime eval/Function issues in VS Code webviews

const Ajv = require('ajv');
const standaloneCode = require('ajv/dist/standalone').default;
const fs = require('fs');
const path = require('path');

// Load the schema
const schemaPath = path.join(__dirname, '../schema/reference.data.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'));

// Create AJV instance with desired options
const ajv = new Ajv({
  allErrors: true,
  code: { source: true, esm: true }
});

// Compile the schema
const validate = ajv.compile(schema);

// Generate standalone code
let moduleCode = standaloneCode(ajv, validate);

// Write to output file
const outputPath = path.join(__dirname, '../src/web/app/validator.generated.js');
fs.writeFileSync(outputPath, moduleCode);

console.log('✓ Generated standalone validator at:', outputPath);
