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
    preparation?: number | 'no';
    concrete_grade?: number;
    fiber?: number | 'no';
    pump?: 'yes' | 'no';
    topping_amount?: number;
    reinforcement?: ReinforcementType;
    topping?: 'yes' | 'no';
    reinforcement_single_fitting?: number;
    reinforcement_single_cell?: number;
    reinforcement_double_fitting?: number;
    reinforcement_double_fitting2?: number;
    reinforcement_double_cell?: number;
    reinforcement_grid_fitting?: number;
    reinforcement_grid_cell?: number;
    reinforcement_fiber?: number;
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
    description: string;
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
