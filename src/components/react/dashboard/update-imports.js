const fs = require('fs');
const path = require('path');

const dashboardPath = path.join(__dirname, 'dashboard');
const files = fs.readdirSync(dashboardPath);

files.forEach(file => {
  if (file.endsWith('.tsx') || file.endsWith('.ts')) {
    const filePath = path.join(dashboardPath, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Update import paths
    content = content.replace(
      /from '@Components\/react\/dashboard\//g, 
      'from "./"'
    );
    
    fs.writeFileSync(filePath, content, 'utf8');
  }
});

console.log('Import paths updated successfully!');
