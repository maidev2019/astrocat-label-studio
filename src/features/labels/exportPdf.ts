import { jsPDF } from 'jspdf';
import type { Batch, CompanySettings, Product } from '../../types/models';
import { formatDate } from '../../lib/date';

/** Uniform, flow-based 70 × 100 mm label. Never truncate mandatory information. */
export function exportLabelPDF(product: Product, batch: Batch, settings: CompanySettings) {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [70, 100], compress: true });
  const left = 3.3, right = 66.7, width = right - left, bottom = 97;
  const copies = Math.min(Math.max(batch.quantity, 1), 500);
  const wrap = (value: string, size: number, maxWidth = width) => {
    pdf.setFontSize(size);
    return pdf.splitTextToSize(value, maxWidth) as string[];
  };
  function draw() {
    let y = 4;
    pdf.setTextColor(19,19,19);pdf.setDrawColor(19,19,19);
    // Brand header: compact, consistent for every product.
    pdf.setFont('helvetica','bold');pdf.setFontSize(7);
    if(settings.logoDataUrl && /^data:image\/(?:png|jpeg);base64,/.test(settings.logoDataUrl)) {
      try { const kind=settings.logoDataUrl.startsWith('data:image/png')?'PNG':'JPEG'; pdf.addImage(settings.logoDataUrl,kind,4.2,4.2,9,9,undefined,'FAST'); }
      catch {pdf.circle(8.5,8.5,4.1);pdf.text('AC',8.5,9.3,{align:'center'});}
    } else {pdf.circle(8.5,8.5,4.1);pdf.text('AC',8.5,9.3,{align:'center'});}
    const slogan=wrap(settings.topLine,7.0,47);
    pdf.text(slogan,right,5.4,{align:'right'});
    const sloganBottom=5.4+(slogan.length-1)*2.6;
    pdf.setFontSize(5.5);pdf.text(settings.website,right,Math.max(12,sloganBottom+2.8),{align:'right'});
    y=Math.max(14.3,sloganBottom+4.5);pdf.setLineWidth(.25);pdf.line(left,y,right,y);y+=3.2;

    pdf.setFont('helvetica','bold');
    const title=wrap(product.name+(product.vegan?' (Vegan)':''),6.5);
    pdf.text(title,left,y);y+=title.length*2.65+.5;
    pdf.setFont('helvetica','normal');pdf.setFontSize(5.5);
    pdf.text(`Inhalt: ${product.netWeight}`,left,y);pdf.text(`SKU: ${product.sku}`,right,y,{align:'right'});y+=2.8;
    // Two columns, just like the HTML preview. The MHD column wraps only if necessary.
    pdf.text(`Charge: ${batch.number}`,left,y);
    const mhdText=`Mindestens haltbar bis: ${formatDate(batch.bestBefore)}`;
    const mhdLines=wrap(mhdText,5.5,30);
    pdf.text(mhdLines,35.1,y);y+=Math.max(2.8, mhdLines.length*2.3)+.4;

    pdf.setFontSize(5.5);
    const cleanIngredients=product.ingredients.trim().replace(/^(?:Zutaten\s*:\s*)+/i,'');
    const ingredients=wrap(`Zutaten: ${cleanIngredients}`,5.5);
    pdf.text(ingredients,left,y);y+=ingredients.length*2.3+.6;
    if(product.allergens&&product.allergens.toLowerCase()!=='keine'){
      const allergenLines=wrap(`Allergene: ${product.allergens}`,5.5);
      pdf.text(allergenLines,left,y);y+=allergenLines.length*2.3+.5;
    }
    y+=.7;
    const n=product.nutrition;
    const rows:[string,string][]=[
      ['Energie',`${n.energyKj} kJ / ${n.energyKcal} kcal`],
      ['Fett',`${n.fat} g`],['davon gesättigte Fettsäuren',`${n.saturatedFat} g`],
      ['Kohlenhydrate',`${n.carbs} g`],['davon Zucker',`${n.sugar} g`],
      ...(n.fibre?[['Ballaststoffe',`${n.fibre} g`] as [string,string]]:[]),
      ['Eiweiß',`${n.protein} g`],['Salz',`${n.salt} g`]
    ];
    const rowH=2.45, headH=3.2, tableH=headH+rows.length*rowH;
    const storage=wrap(`Lagerung: ${product.storage}`,5.5);
    const company=wrap(`Verantwortlicher Lebensmittelunternehmer: ${settings.name}, ${settings.address}`,5.5);
    const tailHeight=2+storage.length*2.25+1+company.length*2.25;
    if(y+tableH+1.8+tailHeight>bottom){
      const extra=(y+tableH+1.8+tailHeight-bottom).toFixed(1);
      throw new Error(`Etikett benötigt etwa ${extra} mm zusätzlichen Platz. Zutatenliste und Pflichtangaben dürfen nicht abgeschnitten werden. Bitte Etikettentext oder Vorlage prüfen.`);
    }
    pdf.setFillColor(20,20,20);pdf.rect(left,y,width,headH,'F');
    pdf.setTextColor(255,255,255);pdf.setFont('helvetica','bold');pdf.setFontSize(5.5);
    pdf.text('Durchschnittliche Nährwerte pro 100 g',left+.9,y+2.25);
    pdf.setTextColor(20,20,20);let ry=y+headH;
    rows.forEach(([key,val])=>{
      pdf.setFont('helvetica',key==='Energie'?'bold':'normal');pdf.setFontSize(5.5);
      pdf.text(key,left+.9,ry+1.75);
      // Explicit x-position and width guard avoids right-alignment PDF rendering artefacts.
      pdf.setFont('helvetica','bold');pdf.setFontSize(5.5);pdf.setCharSpace(0);
      const valueWidth=pdf.getTextWidth(val);
      const valueX=right-.9-valueWidth;
      const keyEnd=left+.9+pdf.getTextWidth(key);
      if(valueX < keyEnd+2.0) throw new Error(`Nährwert „${key}“ passt nicht in die Tabellenspalte.`);
      pdf.text(val,valueX,ry+1.75);
      pdf.setLineWidth(.1);pdf.setDrawColor(210,210,210);pdf.line(left,ry+rowH,right,ry+rowH);ry+=rowH;
    });
    pdf.setDrawColor(20,20,20);pdf.setLineWidth(.15);pdf.rect(left,y,width,tableH);y=ry+1.8;
    pdf.setFont('helvetica','normal');pdf.setFontSize(5.5);
    pdf.text(storage,left,y+2);y+=storage.length*2.25+1;
    pdf.text(company,left,y+2);
  }
  // Render fully before saving so any layout failure never downloads a partial PDF.
  for(let i=0;i<copies;i++){if(i)pdf.addPage([70,100],'portrait');draw()}
  pdf.save(`astrocat-${product.sku}-${batch.number}.pdf`);
}
