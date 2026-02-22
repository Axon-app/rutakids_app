const fs = require('fs');
const buf = fs.readFileSync('js/app.remote.js');
const mojibake = buf.toString('utf8');
const restored = Buffer.from(mojibake, 'latin1').toString('utf8');
fs.writeFileSync('js/app.cleaned.js', restored, 'utf8');
