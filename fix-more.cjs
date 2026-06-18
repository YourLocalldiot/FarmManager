const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src/pages/BioPass/components');

function replaceInFile(fileName, regex, replacement) {
  const p = path.join(dir, fileName);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace(regex, replacement);
  fs.writeFileSync(p, content, 'utf8');
}

// Fix Typography fontWeight="bold" -> sx={{ fontWeight: 'bold' }}
// Wait, some might already have sx={{ mb: 2 }}
function fixTypography(fileName) {
  const p = path.join(dir, fileName);
  if (!fs.existsSync(p)) return;
  let content = fs.readFileSync(p, 'utf8');
  
  content = content.replace(/fontWeight="bold"/g, "sx={{ fontWeight: 'bold' }}");
  // If there are two sx props, they need merging, but simple replace might result in: sx={{ fontWeight: 'bold' }} sx={{ mb: 2 }} which is a syntax error in React if both are jsx props.
  // Actually, replacing fontWeight="bold" with fontWeight="bold" is wrong, wait.
  // MUI v5 had fontWeight on Typography? No, it's Box.
  // Let's just remove fontWeight="bold" and put it in sx.
  content = content.replace(/fontWeight="bold"\s+sx=\{\{/g, "sx={{ fontWeight: 'bold', ");
  content = content.replace(/fontWeight="bold"/g, "sx={{ fontWeight: 'bold' }}");
  
  fs.writeFileSync(p, content, 'utf8');
}

['GeolocationStep.tsx', 'MitigationStep.tsx', 'RiskAssessmentStep.tsx', 'SupplyChainStep.tsx'].forEach(fixTypography);

// Fix InputLabelProps
replaceInFile('MitigationStep.tsx', /InputLabelProps=\{\{ shrink: true \}\}/g, "slotProps={{ inputLabel: { shrink: true } }}");

// Fix e: any in GeolocationStep
replaceInFile('GeolocationStep.tsx', /onChange=\{\(e\)/g, "onChange={(e: any)");
// Ah wait, it's click(e) in GeolocationStep
replaceInFile('GeolocationStep.tsx', /click\(e\)/g, "click(e: any)");

// Fix unused variables in biopassService
const serviceFile = path.join(__dirname, 'src/services/biopassService.ts');
let serviceContent = fs.readFileSync(serviceFile, 'utf8');
serviceContent = serviceContent.replace('import { collection, doc, setDoc, getDoc, updateDoc }', 'import { collection, doc, setDoc, updateDoc }');
serviceContent = serviceContent.replace('createRecord: async (userId: string)', 'createRecord: async (_userId: string)');
fs.writeFileSync(serviceFile, serviceContent, 'utf8');

console.log('Fixed more TS errors');
