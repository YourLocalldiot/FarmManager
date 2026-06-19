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

export const generateComplianceDataJSON = (record: Partial<BioPassRecord>) => {
  const jsonData = JSON.stringify(record, null, 2);
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
  doc.text('Commodity Information', 14, 32);
  if (record.commodity) {
    autoTable(doc, {
      startY: 36,
      body: [
        ['Type', record.commodity.type],
        ['Description', record.commodity.description],
        ['Quantity', `${record.commodity.quantity} ${record.commodity.unit}`],
        ['Country', record.commodity.productionCountry],
        ['Year', record.commodity.productionYear],
      ],
      theme: 'grid',
    });
  }

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

  // Add a new page for remaining sections if necessary, but autoTable handles pagination mostly
  // For simplicity, let's just add a new page
  doc.addPage();
  
  // Risk Assessment
  doc.setFontSize(14);
  doc.text('Risk Assessment Summary', 14, 20);
  if (record.riskAssessment && record.riskAssessment.length > 0) {
    autoTable(doc, {
      startY: 24,
      head: [['Question ID', 'Answer', 'Evidence']],
      body: record.riskAssessment.map(ra => [ra.questionId, ra.answer, ra.evidenceUrl ? 'Attached' : 'None']),
      theme: 'grid',
    });
  } else {
    doc.setFontSize(10);
    doc.text('No risk assessment provided.', 14, 26);
  }

  // Mitigation
  const finalY3 = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 35;
  doc.setFontSize(14);
  doc.text('Risk Mitigation Actions', 14, finalY3);
  if (record.mitigation && record.mitigation.length > 0) {
    autoTable(doc, {
      startY: finalY3 + 4,
      head: [['Risk', 'Action', 'Status', 'Due Date']],
      body: record.mitigation.map(m => [m.riskDescription, m.action, m.status, m.dueDate || '-']),
      theme: 'grid',
    });
  } else {
    doc.setFontSize(10);
    doc.text('No mitigation actions provided.', 14, finalY3 + 6);
  }

  // Declaration
  const finalY4 = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : finalY3 + 15;
  doc.setFontSize(14);
  doc.text('Declaration and Signature', 14, finalY4);
  doc.setFontSize(10);
  doc.text('The information provided is accurate and complete to the best of my knowledge.', 14, finalY4 + 6);
  
  if (record.declaration?.signatureUrl) {
    try {
      // It's a remote URL from Firebase, we can't easily add it synchronously to jsPDF without downloading it as base64 first.
      // However, if we capture the signature as base64 and store it in state, we could use it directly. 
      // For now, we will just textually acknowledge it.
      doc.text(`Digitally signed at: ${new Date(record.declaration.timestamp).toLocaleString()}`, 14, finalY4 + 12);
      doc.text(`Signature URL: ${record.declaration.signatureUrl}`, 14, finalY4 + 18);
    } catch (e) {
      console.error(e);
    }
  }

  doc.save('compliance_report.pdf');
};
