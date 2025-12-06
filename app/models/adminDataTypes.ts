export interface SettingsType {
    general: { rate: number; overheads: number; profit: number };
    exp: [{ id: string; name: string; price: number; increase: number }];
    pay: [{ id: string; name: string; price: number; increase: number }];
    materials: [{ id: string; name: string; price: number; increase: number }];
}
