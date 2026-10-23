import type { CompanySettings, Nutrition, Product } from '../types/models';
export const companyDefaults: CompanySettings = { name: 'Astrocat Candy', address: 'Slabystr. 19 · 12459 Berlin', website: 'astrocatcandy.shop', instagram: '@astrocatcandy', tiktok: '@astrocatcandy', topLine: 'TÜTE LEER? HOL DIR NACHSCHUB!', footerLine: 'HANDGEMACHT · GEFRIERGETROCKNET' };
export const emptyNutrition: Nutrition = { energyKj:'',energyKcal:'',fat:'',saturatedFat:'',carbs:'',sugar:'',fibre:'',protein:'',salt:'' };
export const newProduct = (): Product => ({ id: crypto.randomUUID(),sku:'',name:'',category:'Früchte',netWeight:'',ingredients:'',allergens:'',vegan:false,storage:'Kühl, trocken und lichtgeschützt lagern. Nach dem Öffnen luftdicht verschließen.',shelfLifeMonths:12,nutrition:{...emptyNutrition},approval:false,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString() });
export const demoProducts = (): Product[] => {
 const a=newProduct();a.name='Gefriergetrocknete Ananasscheiben';a.sku='AC-FRUIT-1001';a.ingredients='100 % Ananas';a.vegan=true;a.nutrition={energyKj:'1490',energyKcal:'350',fat:'0,8',saturatedFat:'0',carbs:'79',sugar:'68',fibre:'8',protein:'3',salt:'0,02'};a.approval=false;
 const b=newProduct();b.name='Rainbow Sour Bites';b.sku='ACC-FD-001';b.category='Candy';b.ingredients='Zucker, Glukosesirup, Palmfett, Säuerungsmittel (Weinsäure, Citronensäure, Apfelsäure), Farbstoffe (E120, E171)';b.vegan=true;b.netWeight='50 g';b.approval=false;
 return [a,b];
};
