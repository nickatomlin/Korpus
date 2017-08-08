let fs = require('fs');
let obj = JSON.parse(fs.readFileSync('data/index.json', 'utf8'));

console.log(obj);