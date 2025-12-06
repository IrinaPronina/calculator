export interface ITabItem {
    label: string;
    title: string;
}

export const TABS: ITabItem[] = [
    {
        label: 'Общие параметры',
        title: 'general',
    },
    {
        label: 'Оплата труда',
        title: 'pay',
    },
    {
        label: 'Материалы',
        title: 'material',
    },
    {
        label: 'Эксплуатация механизмов',
        title: 'exp',
    },
];
