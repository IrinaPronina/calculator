import { SettingsType } from './adminDataTypes';

export type BaseType = 'base_concrete' | 'base_sand' | 'base_rubble';
export type ReinforcementType =
    | 'single'
    | 'double'
    | 'grid'
    | 'fiber'
    | 'doNotKnow';

export interface CalculateRequest {
    area: number;
    base: BaseType;
    thickness: number | 'auto';
    reinforcement?: ReinforcementType;
    topping?: 'yes' | 'no';
}

export interface ServiceItem {
    id: string;
    name: string;
    unit: string;
    note: string;
    volume: number;
    price: number;
    total: number;
}

export interface OfferTotals {
    subtotal: number;
    transport: number;
    overheads: number;
    profit: number;
    grandTotal: number;
    unitPrice: number;
}

export interface CalculateResponseData {
    section: {
        title: string;
        items: ServiceItem[];
        total: number;
    };
    totals: OfferTotals;
    normalizedInput: Required<CalculateRequest>;
}

export interface CalculateResult {
    status: 'success' | 'error';
    data?: CalculateResponseData;
    errors?: string[];
}

export interface CalculationContext {
    request: Required<CalculateRequest>;
    settings: SettingsType;
}
