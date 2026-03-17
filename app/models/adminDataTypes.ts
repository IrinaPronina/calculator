export interface SettingsType {
    general: { rate: number; overheads: number; profit: number };
    exp: Array<{ id: string; name: string; price: number; increase: number }>;
    pay: Array<{ id: string; name: string; price: number; increase: number }>;
    materials: Array<{
        id: string;
        name: string;
        price: number;
        increase: number;
    }>;
}
