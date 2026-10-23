import Dexie, { type EntityTable } from 'dexie';
import type { Product, Batch } from '../types/models';
export const db = new Dexie('AstrocatLabelStudio') as Dexie & {products: EntityTable<Product,'id'>; batches: EntityTable<Batch,'id'>};
db.version(1).stores({products:'id,&sku,name,updatedAt',batches:'id,&number,productId,productionDate'});
