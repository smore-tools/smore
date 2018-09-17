const fs = require('fs');
const path = require('path');

const readmePath = path.join(__dirname, '..', 'README.md')
let readmeContent = fs.readFileSync(readmePath, 'utf-8');

fs.writeFileSync(readmePath, readmeContent);