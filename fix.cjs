const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/pages/BioPass');

const filesToFixGrid = [
  'components/CommodityStep.tsx',
  'components/GeolocationStep.tsx',
  'components/MitigationStep.tsx',
  'components/SupplyChainStep.tsx'
];

filesToFixGrid.forEach(f => {
  const p = path.join(dir, f);
  let content = fs.readFileSync(p, 'utf8');
  
  // Replace <Grid item xs={12}> with <Grid size={{ xs: 12 }}>
  content = content.replace(/<Grid item xs={([^}]+)}>/g, '<Grid size={{ xs: $1 }}>');
  // Replace <Grid item xs={12} sm={6}> with <Grid size={{ xs: 12, sm: 6 }}>
  content = content.replace(/<Grid item xs={([^}]+)} sm={([^}]+)}>/g, '<Grid size={{ xs: $1, sm: $2 }}>');
  // Replace <Grid item xs={12} md={8}> with <Grid size={{ xs: 12, md: 8 }}>
  content = content.replace(/<Grid item xs={([^}]+)} md={([^}]+)}>/g, '<Grid size={{ xs: $1, md: $2 }}>');
  // Replace <Grid item xs={12} md={4}> with <Grid size={{ xs: 12, md: 4 }}>
  content = content.replace(/<Grid item xs={([^}]+)} md={([^}]+)}>/g, '<Grid size={{ xs: $1, md: $2 }}>');
  
  fs.writeFileSync(p, content, 'utf8');
});

// Now fix import type
function walk(currentDir) {
  const files = fs.readdirSync(currentDir);
  for (const file of files) {
    const fullPath = path.join(currentDir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes("from '../../../types/biopass'") || content.includes("from '../../types/biopass'") || content.includes("from '../types/biopass'")) {
        content = content.replace(/import\s+{([^}]+)}\s+from\s+(['"])[^'"]*types\/biopass\2/g, (match, p1, p2, offset, string) => {
           // check if there's an import type already
           return `import type {${p1}} from ${p2}${match.split('from ')[1].replace(/['"]/g, '')}${p2}`;
        });
        
        fs.writeFileSync(fullPath, content, 'utf8');
      }
    }
  }
}

walk(path.join(__dirname, 'src'));

console.log('Fixed Grid and imports');
