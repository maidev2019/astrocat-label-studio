export const formatDate = (iso:string) => iso ? iso.split('-').reverse().join('.') : '–';
export function addMonths(iso:string, months:number){ const [y,m,d]=iso.split('-').map(Number);if(!y||!m||!d)return ''; const date=new Date(Date.UTC(y,m-1+months,1)); const last=new Date(Date.UTC(date.getUTCFullYear(),date.getUTCMonth()+1,0)).getUTCDate();date.setUTCDate(Math.min(d,last));return date.toISOString().slice(0,10); }
/** A single daily sequence shared by all products. Existing legacy batch numbers remain unchanged. */
export function makeBatchNumber(_sku:string,date:string,used:string[]):string {
 const [year,month,day]=date.split('-');
 if(!year||!month||!day)return '';
 const tag=`${day}${month}${year.slice(-2)}`;
 let n=1;
 while(used.includes(`L${tag}-${String(n).padStart(2,'0')}`))n++;
 return `L${tag}-${String(n).padStart(2,'0')}`;
}
