const fs = require('fs');
const text = fs.readFileSync('js/app.remote.js','utf8');
function decode(s){return Buffer.from(s,'latin1').toString('utf8');}
const samples = [
  '👶',
  '�',
  '🌅',
  '🌆',
  '✅',
  '�',
  '��',
  '🗑�',
  '📋',
  '🎉',
  '📊',
  '⚙�',
  '✓',
  '⚠�',
  '✅',
  '💳',
  '📭',
  '👤',
  '🔄',
];
for(const s of samples){
  console.log(s,'=>',decode(s));
}
