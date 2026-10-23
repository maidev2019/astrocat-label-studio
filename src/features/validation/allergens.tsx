import type {ReactNode} from 'react';
/** Candidate synonyms for EU Annex II allergens. Not a substitute for checking supplier documents. */
const patterns: Array<[string, RegExp]> = [
 ['Milch', /\b(?:milch(?:pulver|schokolade|karamell|zucker|protein|erzeugnis)?|vollmilch\w*|magermilch\w*|butter(?:rein)?fett|buttermilch\w*|süßmolke\w*|molke\w*|kondensmilch|laktose|casein|kasein)\b/giu],
 ['Soja', /\b(?:soja\w*|sojalecithin\w*)\b/giu],
 ['Weizen', /\b(?:weizen\w*|dinkel\w*|roggen\w*|gersten\w*|gerstenmalz\w*|hafer\w*|khorasan\w*)\b/giu],
 ['Ei', /\b(?:eier|hühnerei\w*|vollei\w*|eipulver|trockeneiweiß|eiweißpulver\s*\(ei\))\b/giu],
 ['Erdnüsse', /\berdnuss\w*|\berdnüsse\b/giu],
 ['Schalenfrüchte', /\b(?:haselnuss\w*|haselnüsse|mandel\w*|walnuss\w*|walnüsse|cashew\w*|pistazie\w*|macadamia\w*|pekannuss\w*|paranuss\w*)\b/giu],
 ['Sesam', /\bsesam\w*\b/giu],['Sellerie', /\bsellerie\w*\b/giu],['Senf', /\bsenf\w*\b/giu],
 ['Lupine', /\blupine\w*\b/giu],['Fisch', /\bfisch(?:protein|gelatine)?\b/giu],
 ['Krebstiere', /\b(?:krebstiere|garnelen|krabben|hummer)\b/giu],
 ['Weichtiere', /\b(?:weichtiere|muscheln|tintenfisch)\b/giu],
 ['Sulfite', /\b(?:sulfite|schwefeldioxid|e\s*[- ]?22[0-8])\b/giu],
];
function ingredientOnly(raw:string){return raw.replace(/^(?:\s*Zutaten\s*:\s*)+/i,'').split(/(?:\s*#\s*|\s*\.\s*)(?=(?:kann|können)\s+(?:auch\s+)?(?:spuren|enthalten))/i)[0].trim();}
export function detectAllergens(raw:string){const t=ingredientOnly(raw);return patterns.filter(([,p])=>{p.lastIndex=0;return p.test(t)}).map(([n])=>n);}
/** Highlight full ingredient tokens including compounds, but not a voluntary trace statement. */
export function renderIngredients(raw:string, confirmed=''): ReactNode {
 const text=raw.trim().replace(/^(?:Zutaten\s*:\s*)+/i,'');
 if(!text)return '–';
 const matched: Array<{start:number;end:number}> = [];
 const cut = text.search(/(?:#|\.\s*)(?=(?:kann|können)\s+(?:auch\s+)?(?:spuren|enthalten))/i);
 const normal=cut>=0?text.slice(0,cut):text;
 for(const [,regex] of patterns){regex.lastIndex=0;for(const m of normal.matchAll(regex)) matched.push({start:m.index,end:m.index+m[0].length});}
 // Do not bold an allergen merely because it was entered as a speculative free-text note.
 matched.sort((a,b)=>a.start-b.start||b.end-a.end);
 const merged:typeof matched=[];for(const x of matched){const prev=merged[merged.length-1];if(prev&&x.start<=prev.end)prev.end=Math.max(prev.end,x.end);else merged.push({...x});}
 const result:ReactNode[]=[];let position=0;merged.forEach((m,i)=>{result.push(text.slice(position,m.start));result.push(<strong key={i}>{text.slice(m.start,m.end)}</strong>);position=m.end});result.push(text.slice(position));return result;
}
export function checkAllergenAgreement(raw:string,declared:string):string[]{
 const found=detectAllergens(raw);if(!found.length)return [];
 if(!declared.trim()||declared.toLowerCase()==='keine')return [`Automatisch mögliche Allergene erkannt: ${found.join(', ')}. Allergenstatus und Hervorhebung gegen Herstellerangaben prüfen.`];
 return [];
}
