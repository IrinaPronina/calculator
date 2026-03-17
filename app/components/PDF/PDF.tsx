import React from 'react';
import {
    Page,
    Text,
    View,
    Document,
    Font,
    Link,
    StyleSheet,
} from '@react-pdf/renderer';
import Logo from './Logo';
import {
    CalculateRequest,
    OfferTotals,
    ServiceItem,
} from '@/app/models/concreteCalcTypes';

Font.register({
    family: 'Roboto',
    src: '/fonts/Roboto-Regular.woff',
    fontWeight: 400,
});
Font.register({
    family: 'Roboto',
    src: '/fonts/Roboto-Medium.woff',
    fontWeight: 500,
});
Font.register({
    family: 'Roboto',
    src: '/fonts/Roboto-Light.woff',
    fontWeight: 300,
});

interface PDFProps {
    description?: string;
    title?: string;
    items?: ServiceItem[];
    sectionTotal?: number;
    totals?: OfferTotals;
    orderInfo?: Required<CalculateRequest>;
    calcNumber?: string;
    calcDate?: string;
}

const tableColumns = [
    { key: 'id', label: 'Арт.', width: '5%' },
    { key: 'name', label: 'Наименование', width: '30%' },
    { key: 'volume', label: 'Объем', width: '8%' },
    { key: 'unit', label: 'изм.', width: '5%' },
    { key: 'price', label: 'Стоимость, руб.', width: '16%' },
    { key: 'total', label: 'Всего', width: '16%' },
    { key: 'note', label: 'Примечание', width: '20%' },
];

const formatCurrency = (value: number): string => {
    return value.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const formatNumber = (value: number): string => {
    return Number.isInteger(value)
        ? value.toLocaleString('ru-RU')
        : value.toLocaleString('ru-RU', {
              minimumFractionDigits: 0,
              maximumFractionDigits: 2,
          });
};

const renderOrderInfoRows = (orderInfo: Required<CalculateRequest>) => {
    const baseLabelMap: Record<string, string> = {
        base_concrete: 'Существующее бетонное',
        base_sand: 'Уплотненный песок',
        base_rubble: 'Уплотненный щебень',
    };
    const gradeLabelMap: Record<number, string> = {
        1: 'М250 (В20)',
        2: 'М300 (В22,5)',
        3: 'М350 (В25)',
    };
    const reinforcementLabelMap: Record<string, string> = {
        single: 'Одинарное',
        double: 'Двойное',
        grid: 'Сварная сетка',
        fiber: 'Фибра полимерная',
        doNotKnow: 'Не знаю',
    };
    const autoThicknessMap: Record<string, number> = {
        base_concrete: 80,
        base_sand: 120,
        base_rubble: 100,
    };
    const thicknessText =
        orderInfo.thickness === 'auto'
            ? `${autoThicknessMap[orderInfo.base]} мм (авто)`
            : `${orderInfo.thickness} мм`;
    const preparationText =
        orderInfo.preparation === 'no'
            ? 'Нет'
            : `${orderInfo.preparation} мм`;
    const microfiberText =
        orderInfo.fiber === 'no'
            ? 'Нет'
            : `${orderInfo.fiber} кг/м³`;
    const toppingText =
        orderInfo.topping === 'no'
            ? 'Нет'
            : `Да (${orderInfo.topping_amount} кг/м²)`;
    const pumpText = orderInfo.pump === 'yes' ? 'Да' : 'Нет';

    return [
        { label: 'Площадь пола', value: `${orderInfo.area} м²` },
        { label: 'Ваше основание', value: baseLabelMap[orderInfo.base] || orderInfo.base },
        {
            label: 'Армирование',
            value:
                reinforcementLabelMap[orderInfo.reinforcement] ||
                orderInfo.reinforcement,
        },
        { label: 'Толщина бетона', value: thicknessText },
        { label: 'Подбетонка', value: preparationText },
        {
            label: 'Марка бетона',
            value: gradeLabelMap[orderInfo.concrete_grade] || '',
        },
        { label: 'Микрофибра', value: microfiberText },
        { label: 'Топпинг', value: toppingText },
        { label: 'Бетононасос', value: pumpText },
    ];
};

const styles = StyleSheet.create({
    page: {
        backgroundColor: '#fff',
        padding: 30,
    },
    section: {
        marginBottom: 20,
    },
    sectionHeader: {
        backgroundColor: '#475569',
        color: 'white',
        padding: 10,
        fontSize: 10,
        fontWeight: '500',
        fontFamily: 'Roboto',
    },
    tableHeader: {
        backgroundColor: '#54b0bf',
        color: 'white',
        fontSize: 10,
        fontWeight: '500',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
        minHeight: 18,
        fontFamily: 'Roboto',
        borderLeftWidth: 1,
        borderLeftStyle: 'solid',
        borderLeftColor: '#d1d5dc',
    },
    tableCell: {
        padding: 4,
        fontSize: 8,
        fontWeight: 300,
        color: '#4a5565',
        borderRightWidth: 1,
        borderRightStyle: 'solid',
        borderRightColor: '#d1d5dc',
    },
    title: {
        fontSize: 16,
        fontFamily: 'Roboto',
        color: '#525252',
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        fontSize: 10,
        fontFamily: 'Roboto',
        color: '#525252',
        marginBottom: 12,
        whiteSpace: 'pre-wrap',
        lineHeight: 1.35,
    },
    header: {
        flexDirection: 'row',
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderStyle: 'solid',
        marginBottom: 15,
        backgroundColor: '#fbf9fa',
    },
    headerLeft: {
        width: '60%',
        flexDirection: 'row',
        borderRightWidth: 1,
        borderRightColor: '#d1d5db',
        borderRightStyle: 'solid',
        padding: 10,
    },
    headerRight: {
        width: '40%',
        padding: 10,
        justifyContent: 'center',
    },
    headerSectionTitle: {
        fontSize: 8,
        fontFamily: 'Roboto',
        fontWeight: 500,
        color: '#475569',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    companyName: {
        fontSize: 14,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#475569',
        marginBottom: 6,
    },
    companyInfo: {
        fontSize: 8,
        fontFamily: 'Roboto',
        color: '#4a5565',
        marginBottom: 3,
        lineHeight: 1.4,
    },
    companyDetails: {
        fontSize: 7,
        fontFamily: 'Roboto',
        color: '#64748b',
        marginTop: 4,
        lineHeight: 1.3,
    },
    objectTitle: {
        fontSize: 10,
        fontFamily: 'Roboto',
        fontWeight: 500,
        color: '#475569',
        marginBottom: 8,
        textTransform: 'uppercase',
    },
    objectValue: {
        fontSize: 12,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#475569',
    },
    summaryBox: {
        borderWidth: 1,
        borderColor: '#d1d5dc',
        borderStyle: 'solid',
        marginTop: 10,
    },
    summaryRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5dc',
    },
    summaryLabel: {
        width: '70%',
        padding: 6,
        fontSize: 9,
        color: '#334155',
        borderRightWidth: 1,
        borderRightColor: '#d1d5dc',
    },
    summaryValue: {
        width: '30%',
        padding: 6,
        fontSize: 9,
        color: '#334155',
        textAlign: 'right',
    },
    summaryTotal: {
        backgroundColor: '#c6eaef',
    },
    infoBox: {
        borderWidth: 1,
        borderColor: '#d1d5dc',
        borderStyle: 'solid',
        marginBottom: 12,
    },
    infoTitle: {
        backgroundColor: '#e2e8f0',
        padding: 6,
        fontSize: 9,
        fontWeight: 'bold',
        color: '#334155',
    },
    infoRow: {
        flexDirection: 'row',
        borderTopWidth: 1,
        borderTopColor: '#d1d5dc',
    },
    infoLabel: {
        width: '40%',
        padding: 6,
        fontSize: 8,
        color: '#334155',
        borderRightWidth: 1,
        borderRightColor: '#d1d5dc',
        backgroundColor: '#f8fafc',
    },
    infoValue: {
        width: '60%',
        padding: 6,
        fontSize: 8,
        color: '#334155',
    },
});

const PDF = ({
    description,
    title,
    items = [],
    sectionTotal = 0,
    totals,
    orderInfo,
    calcNumber,
    calcDate,
}: PDFProps) => (
    <Document language='ru' title='Предварительная смета ПРОФИКС НН'>
        <Page size='A4' style={styles.page}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Logo />
                    <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.headerSectionTitle}></Text>
                        <Text style={styles.companyName}>ООО "ПРОФИКС НН"</Text>
                        <Text style={styles.companyInfo}>
                            Телефон:{' '}
                            <Link
                                href='tel:+79202520001'
                                style={{
                                    color: '#54b0bf',
                                    textDecoration: 'none',
                                }}>
                                +79202520001
                            </Link>
                        </Text>
                        <Text style={styles.companyInfo}>
                            Email:{' '}
                            <Link
                                href='mailto:office@profix-nn.ru'
                                style={{
                                    color: '#54b0bf',
                                    textDecoration: 'none',
                                }}>
                                office@profix-nn.ru
                            </Link>
                        </Text>
                        <Text style={styles.companyDetails}>
                            ИНН 5258123969 КПП 525801001 ОГРН 1155258004648
                        </Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <Text style={styles.objectTitle}>Расчет</Text>
                    <Text style={styles.objectValue}>
                        № {calcNumber || '-'}
                    </Text>
                    <Text style={styles.companyInfo}>
                        Дата: {calcDate || '-'}
                    </Text>
                </View>
            </View>

            <Text style={styles.title}>Расчет стоимости бетонного пола</Text>
            <Text style={styles.description}>
                {description ||
                    'Предварительный расчет бетонных полов. Параметры и работы указаны ниже.'}
            </Text>

            {orderInfo && (
                <View style={styles.infoBox}>
                    <Text style={styles.infoTitle}>Информация о заказе</Text>
                    {renderOrderInfoRows(orderInfo).map((row) => (
                        <View key={row.label} style={styles.infoRow}>
                            <Text style={styles.infoLabel}>{row.label}</Text>
                            <Text style={styles.infoValue}>{row.value}</Text>
                        </View>
                    ))}
                </View>
            )}

            <View style={styles.section}>
                <Text style={styles.sectionHeader}>
                    {title || 'Раздел 1. Оплата труда (с учетом налогов)'}
                </Text>

                <View style={[styles.tableRow, styles.tableHeader]}>
                    {tableColumns.map((column) => (
                        <Text
                            key={column.key}
                            style={[
                                styles.tableCell,
                                {
                                    width: column.width,
                                    color: '#fff',
                                    fontWeight: '500',
                                },
                            ]}>
                            {column.label}
                        </Text>
                    ))}
                </View>

                {items.map((item, index) => (
                    <View
                        key={`${item.id}-${index}`}
                        style={[
                            styles.tableRow,
                            index % 2 === 1 ? { backgroundColor: '#fbf9fa' } : {},
                        ]}>
                        <Text style={[styles.tableCell, { width: '5%' }]}>{item.id}</Text>
                        <Text style={[styles.tableCell, { width: '30%' }]}>{item.name}</Text>
                        <Text style={[styles.tableCell, { width: '8%' }]}>{formatNumber(item.volume)}</Text>
                        <Text style={[styles.tableCell, { width: '5%' }]}>{item.unit}</Text>
                        <Text style={[styles.tableCell, { width: '16%' }]}>{formatCurrency(item.price)}</Text>
                        <Text style={[styles.tableCell, { width: '16%' }]}>{formatCurrency(item.total)}</Text>
                        <Text style={[styles.tableCell, { width: '20%' }]}>{item.note}</Text>
                    </View>
                ))}

                <View style={[styles.tableRow, { backgroundColor: '#c6eaef' }]}>
                    <Text style={[styles.tableCell, { width: '64%', fontWeight: 'bold' }]}>
                        Итого по разделу
                    </Text>
                    <Text style={[styles.tableCell, { width: '36%', fontWeight: 'bold' }]}>
                        {formatCurrency(sectionTotal)}
                    </Text>
                </View>
            </View>

            {totals && (
                <View style={styles.summaryBox}>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Итого по разделам</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(totals.subtotal)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Транспортные расходы</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(totals.transport)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Прочие накладные</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(totals.overheads)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                        <Text style={styles.summaryLabel}>Сметная прибыль</Text>
                        <Text style={styles.summaryValue}>{formatCurrency(totals.profit)}</Text>
                    </View>
                    <View style={[styles.summaryRow, styles.summaryTotal]}>
                        <Text style={[styles.summaryLabel, { fontWeight: 'bold' }]}>Итого</Text>
                        <Text style={[styles.summaryValue, { fontWeight: 'bold' }]}>
                            {formatCurrency(totals.grandTotal)}
                        </Text>
                    </View>
                </View>
            )}
        </Page>
    </Document>
);

export default PDF;
