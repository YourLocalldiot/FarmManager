import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BioPassRecord } from '../types/biopass';
import type { UserProfile } from '../contexts/AuthContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    firstName: userProfile?.firstName ?? null,
    middleName: userProfile?.middleName ?? null,
    lastName: userProfile?.lastName ?? null,
    address: record.commodity?.address ?? null,
    establishmentName: record.commodity?.companyName ?? null,
    phoneNumber: userProfile?.phoneNumber ?? null,
    email: userProfile?.email ?? null,
    dateOfDeclaration: new Date().toISOString(),
  };

  // ── Land Certificate Information ───────────────────────────────────────────
  const landCertificate = record.certificate ? {
    certificateNumber: record.certificate.certificateNumber,
    ownerName: record.certificate.ownerName,
    issueDate: record.certificate.issueDate,
    declaredAreaHa: record.certificate.declaredArea,
    documentUrl: record.certificate.fileUrl || null,
  } : null;

  // ── Product Information ────────────────────────────────────────────────────
  const product = {
    product: record.commodity?.type ?? null,
    description: record.commodity?.description ?? null,
    volumeTonnes: record.commodity?.quantity ?? null,
  };

  // ── Geolocation Data ───────────────────────────────────────────────────────
  const features = record.plots?.map((plot) => ({
    type: 'Feature',
    properties: {
      id: plot.id,
      name: plot.name,
      areaha: plot.area,
      latitude: plot.latitude,
      longitude: plot.longitude,
    },
    geometry: plot.geoJson?.geometry ?? plot.geoJson ?? null,
  })) ?? [];

  const geolocation = {
    type: 'FeatureCollection',
    country: record.commodity?.productionCountry ?? null,
    features,
  };

  // ── GEE Verification & Carbon Stats ────────────────────────────────────────
  const complianceVerification = {
    geeStatus: record.geeStatus ?? 'Pending',
    isEUDREligible: record.geeStatus === 'Valid',
    carbonCredits: record.carbonCredits ? {
      estimatedCarbonStock_tC: record.carbonCredits.estimatedStock,
      annualSequestration_tCO2: record.carbonCredits.annualSequestration,
      annualCreditValueUSD: record.carbonCredits.creditValueUSD,
    } : null
  };

  // ── Risk Assessment ────────────────────────────────────────────────────────
  const ra = record.riskAssessment;
  const riskAssessment = {
    NearProtectedArea: riskBool(ra, 'q1'),
    IndigenousAffected: riskBool(ra, 'q2'),
    LegalityConcerns: riskBool(ra, 'q4'),
    SupplyChainGaps: riskBool(ra, 'q5'),
    PreviousNonCompliance: riskBool(ra, 'q6'),
    DeforestationRisk: record.geeStatus === 'Deforested',
  };

  // ── Final structured output ────────────────────────────────────────────────
  const output = {
    supplierInformation: supplier,
    landCertificate,
    productInformation: product,
    geolocationData: geolocation,
    complianceVerification,
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
    geometry: plot.geoJson?.geometry ?? plot.geoJson
  })) || [];

  const featureCollection = {
    type: 'FeatureCollection',
    features
  };

  const geoJsonData = JSON.stringify(featureCollection, null, 2);
  downloadFile(geoJsonData, 'farm_boundary.geojson', 'application/geo+json');
};

export const generateComplianceReportPDF = (
  record: Partial<BioPassRecord>,
  userProfile?: UserProfile | null
) => {
  const doc = new jsPDF();
  let currentY = 22;

  // Title
  doc.setFontSize(18);
  doc.text('EUDR Due Diligence Statement Data', 14, currentY);
  currentY += 10;

  // Supplier Information
  doc.setFontSize(14);
  doc.text('Supplier Information', 14, currentY);
  autoTable(doc, {
    startY: currentY + 4,
    body: [
      ['First Name', userProfile?.firstName ?? '—'],
      ['Middle Name', userProfile?.middleName ?? '—'],
      ['Last Name', userProfile?.lastName ?? '—'],
      ['Address', record.commodity?.address ?? '—'],
      ['Establishment Name', record.commodity?.companyName ?? '—'],
      ['Phone Number', userProfile?.phoneNumber ?? '—'],
      ['Email', userProfile?.email ?? '—'],
      ['Date of Declaration', new Date().toLocaleDateString()],
    ],
    theme: 'grid',
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // ── Land Registry Information (Sổ Đỏ) ──────────────────────────────────────────────
  doc.setFontSize(14);
  doc.text('Land Registry Information (Sổ Đỏ)', 14, currentY);
  autoTable(doc, {
    startY: currentY + 4,
    body: [
      ['Certificate Number', record.certificate?.certificateNumber ?? '—'],
      ['Registered Owner', record.certificate?.ownerName ?? '—'],
      ['Issue Date', record.certificate?.issueDate ?? '—'],
      ['Declared Area (ha)', String(record.certificate?.declaredArea ?? '—')],
    ],
    theme: 'grid',
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // ── Product Information ────────────────────────────────────────────────────
  doc.setFontSize(14);
  doc.text('Product Information', 14, currentY);
  autoTable(doc, {
    startY: currentY + 4,
    body: [
      ['Product', record.commodity?.type ?? '—'],
      ['Description', record.commodity?.description ?? '—'],
      ['Volume (Tonnes)', String(record.commodity?.quantity ?? '—')],
    ],
    theme: 'grid',
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // ── Geolocation Summary ────────────────────────────────────────────────────
  doc.setFontSize(14);
  doc.text('Geolocation Data', 14, currentY);
  doc.setFontSize(10);
  doc.text(`Country: ${record.commodity?.productionCountry ?? '—'}`, 14, currentY + 6);
  if (record.plots && record.plots.length > 0) {
    autoTable(doc, {
      startY: currentY + 10,
      head: [['Plot Name', 'Area (ha)', 'Lat', 'Lng']],
      body: record.plots.map(p => [p.name, p.area.toString(), p.latitude.toFixed(4), p.longitude.toFixed(4)]),
      theme: 'grid',
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.text('No plots provided.', 14, currentY + 12);
    currentY += 20;
  }

  // Supply Chain
  doc.setFontSize(14);
  doc.text('Supply Chain Mapping', 14, currentY);
  if (record.supplyChain && record.supplyChain.length > 0) {
    autoTable(doc, {
      startY: currentY + 4,
      head: [['Role', 'Company', 'Contact', 'Phone']],
      body: record.supplyChain.map(sc => [sc.role, sc.companyName, sc.contactName || '-', sc.phoneNumber || '-']),
      theme: 'grid',
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.text('No supply chain actors provided.', 14, currentY + 10);
    currentY += 18;
  }

  // ── GEE Verification & Carbon Stats ────────────────────────────────────────
  doc.setFontSize(14);
  doc.text('GEE Compliance & Carbon Metrics', 14, currentY);
  autoTable(doc, {
    startY: currentY + 4,
    body: [
      ['GEE Deforestation Check (Dec 31, 2020)', record.geeStatus === 'Valid' ? 'HỢP LỆ (Compliant - No Forest)' : 'KHÔNG HỢP LỆ (Non-Compliant - Deforested)'],
      ['EU Export Status', record.geeStatus === 'Valid' ? 'APPROVED / CHO PHÉP' : 'LOCKED / BỊ KHÓA (Non-Compliant)'],
      ['Biomass Carbon Stock', record.carbonCredits ? `${record.carbonCredits.estimatedStock} tC` : '—'],
      ['Annual Sequestration', record.carbonCredits ? `${record.carbonCredits.annualSequestration} tCO2/yr` : '—'],
      ['Est. Offset Annual Value', record.carbonCredits ? `$${record.carbonCredits.creditValueUSD} (~${(record.carbonCredits.creditValueVND / 1000000).toFixed(2)}M VND)` : '—'],
    ],
    theme: 'grid',
  });

  // Add a new page for remaining sections
  doc.addPage();
  currentY = 20;

  // Risk Assessment
  doc.setFontSize(14);
  doc.text('Risk Assessment Summary', 14, currentY);
  const ra = record.riskAssessment;
  const fmt = (v: boolean | null) => (v === null ? 'Unknown' : v ? 'Yes' : 'No');

  autoTable(doc, {
    startY: currentY + 4,
    head: [['Risk Factor', 'Result']],
    body: [
      ['Near Protected Area', fmt(riskBool(ra, 'q1'))],
      ['Indigenous Communities Affected', fmt(riskBool(ra, 'q2'))],
      ['Legality Concerns', fmt(riskBool(ra, 'q4'))],
      ['Supply Chain Gaps', fmt(riskBool(ra, 'q5'))],
      ['Previous Non-Compliance', fmt(riskBool(ra, 'q6'))],
      ['Deforestation Risk (GEE Classification)', record.geeStatus === 'Deforested' ? 'Yes (Deforested Plot)' : 'No (Compliant)'],
    ],
    theme: 'grid',
  });
  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Mitigation
  doc.setFontSize(14);
  doc.text('Risk Mitigation Actions', 14, currentY);
  if (record.mitigation && record.mitigation.length > 0) {
    autoTable(doc, {
      startY: currentY + 4,
      head: [['Risk', 'Action', 'Status', 'Due Date']],
      body: record.mitigation.map(m => [m.riskDescription, m.action, m.status, m.dueDate || '-']),
      theme: 'grid',
    });
    currentY = (doc as any).lastAutoTable.finalY + 10;
  } else {
    doc.setFontSize(10);
    doc.text('No mitigation actions provided.', 14, currentY + 6);
    currentY += 12;
  }

  // ── Declaration & Signature ────────────────────────────────────────────────
  const y3 = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.text('Declaration and Signature', 14, currentY);
  doc.setFontSize(10);
  doc.text('The information provided is accurate and complete to the best of my knowledge.', 14, finalY4 + 6);
  
  if (record.declaration?.signatureUrl) {
    doc.text(`Digitally signed at: ${new Date(record.declaration.timestamp).toLocaleString()}`, 14, y3 + 12);
  }

  doc.save('compliance_report.pdf');
};
