import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BioPassRecord } from '../types/biopass';

export const downloadFile = (data: string, filename: string, type: string) => {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

/** Returns true/false/null for a risk-assessment question id.
 *  "Yes" → true, "No" → false, anything else (Unknown / missing) → null */
const riskBool = (answers: BioPassRecord['riskAssessment'], qId: string): boolean | null => {
  const found = answers?.find((a) => a.questionId === qId);
  if (!found || found.answer === '' || found.answer === 'Unknown') return null;
  return found.answer === 'Yes';
};

// ─── JSON Export ──────────────────────────────────────────────────────────────

export const generateComplianceDataJSON = (
  record: Partial<BioPassRecord>,
  userProfile?: UserProfile | null
) => {
  // ── Supplier Information ───────────────────────────────────────────────────
  const supplier = {
    firstName:         userProfile?.firstName   ?? null,
    middleName:        userProfile?.middleName  ?? null,
    lastName:          userProfile?.lastName    ?? null,
    address:           record.commodity?.address          ?? null,
    establishmentName: record.commodity?.companyName      ?? null,
    phoneNumber:       userProfile?.phoneNumber ?? null,
    email:             userProfile?.email       ?? null,
    dateOfDeclaration: new Date().toISOString(),
  };

  // ── Product Information ────────────────────────────────────────────────────
  const product = {
    product:         record.commodity?.type        ?? null,
    description:     record.commodity?.description ?? null,
    volumeTonnes:    record.commodity?.quantity    ?? null,
  };

  // ── Geolocation Data ───────────────────────────────────────────────────────
  const features = record.plots?.map((plot) => ({
    type: 'Feature',
    properties: {
      id:        plot.id,
      name:      plot.name,
      areaha:    plot.area,
      latitude:  plot.latitude,
      longitude: plot.longitude,
    },
    geometry: plot.geoJson?.geometry ?? null,
  })) ?? [];

  const geolocation = {
    type: 'FeatureCollection',
    country: record.commodity?.productionCountry ?? null,
    features,
  };

  // ── Risk Assessment ────────────────────────────────────────────────────────
  // Question mapping (from RiskAssessmentStep.tsx):
  //   q1 → NearProtectedArea
  //   q2 → IndigenousAffected
  //   q3 → (deforestation question – mapped to DeforestationRisk placeholder)
  //   q4 → LegalityConcerns
  //   q5 → SupplyChainGaps
  //   q6 → PreviousNonCompliance
  const ra = record.riskAssessment;
  const riskAssessment = {
    NearProtectedArea:    riskBool(ra, 'q1'),
    IndigenousAffected:   riskBool(ra, 'q2'),
    LegalityConcerns:     riskBool(ra, 'q4'),
    SupplyChainGaps:      riskBool(ra, 'q5'),
    PreviousNonCompliance: riskBool(ra, 'q6'),
    DeforestationRisk:    null as boolean | null, // To be developed
  };

  // ── Final structured output ────────────────────────────────────────────────
  const output = {
    supplierInformation: supplier,
    productInformation:  product,
    geolocationData:     geolocation,
    riskAssessment,
  };

  const jsonData = JSON.stringify(output, null, 2);
  downloadFile(jsonData, 'compliance_data.json', 'application/json');
};

export const generateFarmBoundaryGeoJSON = (record: Partial<BioPassRecord>) => {
  const features = record.plots?.map(plot => ({
    type: 'Feature',
    properties: {
      id: plot.id,
      name: plot.name,
      area: plot.area,
      latitude: plot.latitude,
      longitude: plot.longitude
    },
    geometry: plot.geoJson.geometry
  })) || [];

  const featureCollection = {
    type: 'FeatureCollection',
    features
  };

  const geoJsonData = JSON.stringify(featureCollection, null, 2);
  downloadFile(geoJsonData, 'farm_boundary.geojson', 'application/geo+json');
};

export const generateComplianceReportPDF = (record: Partial<BioPassRecord>) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('EUDR Due Diligence Statement Data', 14, 22);
  
  // Commodity Information
  doc.setFontSize(14);
  doc.text('Supplier Information', 14, 32);
  autoTable(doc, {
    startY: 36,
    body: [
      ['First Name',          userProfile?.firstName   ?? '—'],
      ['Middle Name',         userProfile?.middleName  ?? '—'],
      ['Last Name',           userProfile?.lastName    ?? '—'],
      ['Address',             record.commodity?.address      ?? '—'],
      ['Establishment Name',  record.commodity?.companyName  ?? '—'],
      ['Phone Number',        userProfile?.phoneNumber ?? '—'],
      ['Email',               userProfile?.email       ?? '—'],
      ['Date of Declaration', new Date().toLocaleDateString()],
    ],
    theme: 'grid',
  });

  // Supply Chain
  const finalY1 = (doc as any).lastAutoTable.finalY + 10;
  doc.text('Supply Chain Mapping', 14, finalY1);
  if (record.supplyChain && record.supplyChain.length > 0) {
    autoTable(doc, {
      startY: finalY1 + 4,
      head: [['Role', 'Company', 'Contact', 'Phone']],
      body: record.supplyChain.map(sc => [sc.role, sc.companyName, sc.contactName || '-', sc.phoneNumber || '-']),
      theme: 'grid',
    });
  } else {
    doc.setFontSize(10);
    doc.text('No supply chain actors provided.', 14, finalY1 + 6);
  }

  // Farm Geolocation Summary
  const finalY2 = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : finalY1 + 15;
  doc.setFontSize(14);
  doc.text('Farm Geolocation Summary', 14, finalY2);
  if (record.plots && record.plots.length > 0) {
    autoTable(doc, {
      startY: finalY2 + 4,
      head: [['Plot Name', 'Area (ha)', 'Lat', 'Lng']],
      body: record.plots.map(p => [p.name, p.area.toString(), p.latitude.toFixed(4), p.longitude.toFixed(4)]),
      theme: 'grid',
    });
  } else {
    doc.setFontSize(10);
    doc.text('No plots provided.', 14, finalY2 + 6);
  }

  // ── GEE Verification & Carbon Stats ────────────────────────────────────────
  const y_gee = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : y2 + 25;
  doc.setFontSize(14);
  doc.text('GEE Compliance & Carbon Metrics', 14, y_gee);
  autoTable(doc, {
    startY: y_gee + 4,
    body: [
      ['GEE Deforestation Check (Dec 31, 2020)', record.geeStatus === 'Valid' ? 'HỢP LỆ (Compliant - No Forest)' : 'KHÔNG HỢP LỆ (Non-Compliant - Deforested)'],
      ['EU Export Status',                        record.geeStatus === 'Valid' ? 'APPROVED / CHO PHÉP' : 'LOCKED / BỊ KHÓA (Non-Compliant)'],
      ['Biomass Carbon Stock',                    record.carbonCredits ? `${record.carbonCredits.estimatedStock} tC` : '—'],
      ['Annual Sequestration',                    record.carbonCredits ? `${record.carbonCredits.annualSequestration} tCO2/yr` : '—'],
      ['Est. Offset Annual Value',                record.carbonCredits ? `$${record.carbonCredits.creditValueUSD} (~${(record.carbonCredits.creditValueVND / 1000000).toFixed(2)}M VND)` : '—'],
    ],
    theme: 'grid',
  });

  // Add a new page for remaining sections if necessary, but autoTable handles pagination mostly
  // For simplicity, let's just add a new page
  doc.addPage();
  
  // Risk Assessment
  doc.setFontSize(14);
  doc.text('Risk Assessment', 14, 20);

  const ra = record.riskAssessment;
  const fmt = (v: boolean | null) => (v === null ? 'Unknown' : v ? 'Yes' : 'No');

  autoTable(doc, {
    startY: 24,
    head: [['Risk Factor', 'Result']],
    body: [
      ['Near Protected Area',     fmt(riskBool(ra, 'q1'))],
      ['Indigenous Communities Affected', fmt(riskBool(ra, 'q2'))],
      ['Legality Concerns',       fmt(riskBool(ra, 'q4'))],
      ['Supply Chain Gaps',       fmt(riskBool(ra, 'q5'))],
      ['Previous Non-Compliance', fmt(riskBool(ra, 'q6'))],
      ['Deforestation Risk',      'To be developed'],
    ],
    theme: 'grid',
  });

  // Declaration
  const finalY4 = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : finalY3 + 15;
  doc.setFontSize(14);
  doc.text('Declaration and Signature', 14, finalY4);
  doc.setFontSize(10);
  doc.text('The information provided is accurate and complete to the best of my knowledge.', 14, finalY4 + 6);
  
  if (record.declaration?.signatureUrl) {
    doc.text(`Digitally signed at: ${new Date(record.declaration.timestamp).toLocaleString()}`, 14, y3 + 12);
  }

  doc.save('compliance_report.pdf');
};
