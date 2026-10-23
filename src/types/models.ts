export interface Nutrition { energyKj: string; energyKcal: string; fat: string; saturatedFat: string; carbs: string; sugar: string; fibre: string; protein: string; salt: string }
export interface Product { id: string; sku: string; name: string; category: string; netWeight: string; ingredients: string; allergens: string; vegan: boolean; storage: string; shelfLifeMonths: number; nutrition: Nutrition; approval: boolean; createdAt: string; updatedAt: string }
export interface RawMaterialSource { originalProduct: string; manufacturerLot: string; originalBestBefore: string; notes: string }
export interface Batch { id: string; productId: string; number: string; productionDate: string; bestBefore: string; quantity: number; createdAt: string; productSnapshot: Product; source?: RawMaterialSource; labelSnapshot?: string; slogan?: string; exportedAt?: string }
export interface CompanySettings { name: string; address: string; website: string; instagram: string; tiktok: string; topLine: string; footerLine: string; logoDataUrl?: string }
export type ValidationSeverity = 'error' | 'warning';
export interface ValidationIssue { severity: ValidationSeverity; message: string }
