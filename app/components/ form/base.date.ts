export interface IBase {
    id: string;
    name: string;
    value: string;
}

export const BASES: IBase[] = [
    {
        id: '001',
        name: 'Существующее бетонное',
        value: 'base_concrete',
    },
    {
        id: '002',
        name: 'Уплотненный песок',
        value: 'base_sand',
    },
    {
        id: '003',
        name: 'Уплотненный щебень',
        value: 'base_rubble',
    },
];
