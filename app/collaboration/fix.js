const fs = require('fs');
const filePath = 'c:/Users/ak192/Downloads/CalVant-Next-main-for-collaboration-framework/CalVant-Next-main/app/collaboration/CollaborationPageClient.jsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace `pc.something || "string"` with `(pc.something !== undefined ? pc.something : "string")`
content = content.replace(/pc\.([a-zA-Z0-9_]+)\s*\|\|\s*("[^"]*")/g, '(pc.$1 !== undefined ? pc.$1 : $2)');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed text fallbacks!');
