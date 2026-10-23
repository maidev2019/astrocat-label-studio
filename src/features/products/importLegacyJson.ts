import type {Product, Nutrition} from '../../types/models';
import {newProduct} from '../../lib/defaults';
import {detectAllergens} from '../validation/allergens';
export interface LegacyImportResult {products:Product[]; warnings:string[]; skipped:number}
const cleanText=(s:string)=>s.replace(/\u00a0|\u202f/g,' ').trim();
const amount=(s:string)=>cleanText(s).replace(/\s/g,'').replace(/\.(?=\d{3}(?:\D|$))/g,'').replace(/\d,\d{3}/g,m=>m).replace(/,/g,'.');
const get=(source:string,pattern:RegExp)=>{const m=source.match(pattern);return m?amount(m[1]).replace('.',','):''};
function parseNutrients(source:string):{values:Nutrition;warnings:string[]}{
 const text=cleanText(source).replace(/\s+/g,' ');
 const v={energyKj:get(text,/([\d., ]+)\s*kJ\b/i),energyKcal:get(text,/([\d., ]+)\s*kcal\b/i),fat:'',saturatedFat:'',carbs:'',sugar:'',fibre:'',protein:'',salt:''} as Nutrition;
 const val=(label:string,until:string)=>{const m=text.match(new RegExp('(?:'+label+')\\s*:?\\s*([<>~]?[\\d.,]+)\\s*(?:g\\b|(?=\\s*(?:'+until+')))', 'i'));return m?m[1].replace('.',','):''};
 v.fat=val('Fett','davon');v.saturatedFat=val('davon gesättigte Fettsäuren|gesättigt','Kohlenhydrate');v.carbs=val('Kohlenhydrate','davon');v.sugar=val('davon Zucker','Eiweiß');v.fibre=val('Ballaststoffe','Eiweiß');v.protein=val('Eiweiß|Eiweiss','Salz');v.salt=val('Salz','Vitamin');
 const warnings:string[]=[];
 for(const key of ['energyKj','energyKcal','fat','saturatedFat','carbs','sugar','protein','salt'] as const)if(!v[key])warnings.push(`Nährwert ${key} nicht eindeutig erkannt`);
 if(/\b(?:ca\.|ungefähr|~|<|–)\b|<\s*\d/i.test(text))warnings.push('Ungefähre Werte/Grenzwerte bitte manuell abgleichen');
 return {values:v,warnings};
}
export function parseLegacyProductJson(raw:unknown):LegacyImportResult{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))throw Error('Erwartet ein JSON-Objekt mit SKU-Schlüsseln.');
 const products:Product[]=[];const warnings:string[]=[];let skipped=0;
 for(const [rawSku,value] of Object.entries(raw)){
  if(!value||typeof value!=='object'||Array.isArray(value)){skipped++;continue;}
  const row=value as Record<string,unknown>;
  const sku=rawSku.replace(/^SKU\s*:\s*/i,'').trim();const name=String(row.Name||'').trim();
  if(!sku||!name){warnings.push(`${sku||rawSku}: Produktname/SKU fehlt`);skipped++;continue;}
  const p=newProduct();p.sku=sku;p.name=name;p.netWeight='';p.approval=false;
  p.category=/ananas|apfelchips|fruchtscheiben/i.test(name)?'Früchte':'Candy';
  p.vegan=/\(vegan\)/i.test(name);p.name=name.replace(/\s*\(vegan\)?\s*$/i,'').trim();
  p.ingredients=String(row.Zutaten||'').trim().replace(/^(?:Zutaten\s*:\s*)+/i,'').replace(/\s*#\s*/g,' ');
  const detected=detectAllergens(p.ingredients);
  p.allergens=detected.join(', '); // candidate only, requires manual supplier check
  const nutrient=parseNutrients(String(row['Nährwertangaben']||''));p.nutrition=nutrient.values;
  warnings.push(...nutrient.warnings.map(w=>`${sku}: ${w}`));
  if(!p.ingredients)warnings.push(`${sku}: Zutaten fehlen`);
  if(detected.length)warnings.push(`${sku}: mögliche Allergene ${detected.join(', ')} – manuell prüfen`);
  if(p.vegan&&/gelatine|e\s*120|karmin|bienenwachs|schellack/i.test(p.ingredients))warnings.push(`${sku}: Vegan-Aussage prüfen`);
  if(/\bE\s*171\b/i.test(p.ingredients))warnings.push(`${sku}: E171 erkannt – vor Vertrieb klären`);
  if(/\bE\s*(?:102|104|110|122|124|129)\b/i.test(p.ingredients))warnings.push(`${sku}: Farbstoffpflichtwarnung prüfen`);
  products.push(p);
 }
 return {products,warnings,skipped};
}
