import type { Product, ValidationIssue } from '../../types/models';
import {checkAllergenAgreement} from './allergens';
const requiredNutrition: Array<keyof Product['nutrition']>=['energyKj','energyKcal','fat','saturatedFat','carbs','sugar','protein','salt'];
export function validateProduct(p:Product):ValidationIssue[]{
 const issues:ValidationIssue[]=[];
 const error=(message:string)=>issues.push({severity:'error',message});
 const warn=(message:string)=>issues.push({severity:'warning',message});
 if(!p.name.trim())error('Produktname fehlt.');
 if(!p.sku.trim())error('SKU fehlt.');
 if(!p.netWeight.trim())error('Nettofüllmenge fehlt.');
 if(!p.ingredients.trim())error('Zutatenangabe fehlt.');
 if(!p.storage.trim())warn('Lagerhinweis fehlt.');
 if(requiredNutrition.some(k=>!String(p.nutrition[k]).trim()))error('Pflichtwerte der Nährwerttabelle sind unvollständig.');
 if(/\b(?:e\s*-?\s*171|titandioxid)\b/i.test(p.ingredients))error('E171 / Titandioxid erkannt: in der EU als Lebensmittelzusatzstoff nicht zugelassen. Rezeptur prüfen.');
 if(p.vegan&&/\b(?:e\s*-?\s*120|karmin|cochenille|gelatine|bienenwachs|schellack)\b/i.test(p.ingredients))error('Vegan-Angabe widerspricht tierischen Zutaten (z. B. E120).');
 if(!p.allergens.trim())warn('Allergenstatus nicht bestätigt. Bitte prüfen; „keine“ ggf. bewusst eintragen.');
 checkAllergenAgreement(p.ingredients,p.allergens).forEach(warn);
 if(!p.approval)warn('Produktdaten sind noch nicht manuell bestätigt.');
 return issues;
}
export const canPrint = (p:Product)=>!validateProduct(p).some(i=>i.severity==='error')&&p.approval;
