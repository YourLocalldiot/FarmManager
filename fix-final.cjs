const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/pages/BioPass/components');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

files.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');

  // Fix remaining fontWeight="bold"
  content = content.replace(/fontWeight="bold"/g, "sx={{ fontWeight: 'bold' }}");

  // Fix duplicate sx attributes: sx={{ mb: 2 }} sx={{ fontWeight: 'bold' }} -> sx={{ mb: 2, fontWeight: 'bold' }}
  content = content.replace(/sx=\{\{(.*?)\}\}\s+sx=\{\{ fontWeight: 'bold' \}\}/g, "sx={{ $1, fontWeight: 'bold' }}");
  content = content.replace(/sx=\{\{ fontWeight: 'bold' \}\}\s+sx=\{\{(.*?)\}\}/g, "sx={{ fontWeight: 'bold', $1 }}");

  // Remove unused useEffect in GeolocationStep
  if (f === 'GeolocationStep.tsx') {
    content = content.replace('import React, { useState, useEffect } from', 'import React, { useState } from');
  }

  fs.writeFileSync(p, content, 'utf8');
});

console.log('Fixed more errors');
