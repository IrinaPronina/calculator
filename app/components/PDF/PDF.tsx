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

// Font registration
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

// Data structure for table rows
const laborData = [
    {
        id: '0156',
        name: 'Укладка пленки полиэтиленовой',
        volume: '1000',
        unit: 'м²',
        price: '22',
        total: '22000',
        note: 'в 1 слой с проклейкой',
    },
    {
        id: '0100',
        name: 'Армирование готовой сеткой',
        volume: '1000',
        unit: 'м²',
        price: '95',
        total: '95 000,00',
        note: 'укладка с нахлестом',
    },
    {
        id: '0155',
        name: 'Установка маячковых направляющих',
        volume: '450',
        unit: 'м/п',
        price: '81',
        total: '36 450,00',
        note: 'на сварку, съемные',
    },
    {
        id: '0145',
        name: 'Укладка бетонной смеси до 100 мм',
        volume: '1000',
        unit: 'м²',
        price: '270',
        total: '270 000,00',
        note: 'с вибрацией',
    },
    {
        id: '0102',
        name: 'Внесение упрочняющей смеси',
        volume: '1000',
        unit: 'м²',
        price: '22',
        total: '22 000,00',
        note: 'с помощью тележки',
    },
    {
        id: '0110',
        name: 'Затирка поверхности бетона',
        volume: '1000',
        unit: 'м²',
        price: '143',
        total: '143 000,00',
        note: 'железнение лопастями',
    },
    {
        id: '0140',
        name: 'Покрытие защитным лаком в 1 слой',
        volume: '1000',
        unit: 'м²',
        price: '15',
        total: '15 000,00',
        note: 'для набора прочности',
    },
    {
        id: '0130',
        name: 'Нарезка усадочных швов',
        volume: '700',
        unit: 'м/п',
        price: '80',
        total: '56 000,00',
        note: '1/3 от толщины пола',
    },
    {
        id: '0109',
        name: 'Заполнение усадочных швов',
        volume: '700',
        unit: 'м/п',
        price: '60',
        total: '42 000,00',
        note: 'вилатерм с герметиком',
    },
    {
        id: '0517',
        name: 'Уборка строительного мусора',
        volume: '1000',
        unit: 'м²',
        price: '14',
        total: '14 000,00',
        note: 'сухая уборка',
    },
];

const tableColumns = [
    { key: 'id', label: 'Арт.', width: '5%' },
    { key: 'name', label: 'Наименование', width: '30%' },
    { key: 'volume', label: 'Объем', width: '7%' },
    { key: 'unit', label: 'изм.', width: '5%' },
    { key: 'price', label: 'Стоимость, руб.', width: '16%' },
    { key: 'total', label: 'Всего', width: '16%' },
    { key: 'note', label: 'Примечание', width: '21%' },
];

// Reusable components
interface TableRowProps {
    data: Record<string, string>;
    columns: Array<{ key: string; width: string }>;
    isEven?: boolean;
    isTotal?: boolean;
}

const TableRow: React.FC<TableRowProps> = ({
    data,
    columns,
    isEven = false,
    isTotal = false,
}) => {
    const rowStyle = isTotal
        ? [styles.tableRow, { backgroundColor: '#c6eaef' }]
        : isEven
        ? [styles.tableRow, { backgroundColor: '#fbf9fa' }]
        : styles.tableRow;

    return (
        <View style={rowStyle}>
            {columns.map((column) => (
                <Text
                    key={column.key}
                    style={[
                        styles.tableCell,
                        { width: column.width },
                        ...(isTotal ? [{ fontWeight: 'bold' }] : []),
                    ]}>
                    {data[column.key] || ''}
                </Text>
            ))}
        </View>
    );
};

interface TableProps {
    title: string;
    columns: Array<{ key: string; label: string; width: string }>;
    data: Array<Record<string, string>>;
    totalAmount: string;
}

const Table: React.FC<TableProps> = ({ title, columns, data, totalAmount }) => {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionHeader}>{title}</Text>

            {/* Table header */}
            <View style={[styles.tableRow, styles.tableHeader]}>
                {columns.map((column) => (
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

            {/* Table rows */}
            {data.map((row, index) => (
                <TableRow
                    key={row.id || index}
                    data={row}
                    columns={columns}
                    isEven={index % 2 === 1}
                />
            ))}

            {/* Total row */}
            <TableRow
                data={{
                    section: 'Итого по разделу',
                    total: totalAmount,
                }}
                columns={[
                    { key: 'section', width: '63%' },
                    { key: 'total', width: '37%' },
                ]}
                isTotal={true}
            />
        </View>
    );
};

interface SectionProps {
    title: string;
    children: React.ReactNode;
}

const Section: React.FC<SectionProps> = ({ title, children }) => (
    <View style={styles.section}>
        <Text style={styles.sectionHeader}>{title}</Text>
        {children}
    </View>
);

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
    table: {
        width: '100%',
        borderCollapse: 'collapse',
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
});

const PDF = () => (
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
                    <Text style={styles.objectTitle}>Объект</Text>
                    <Text style={styles.objectValue}>-</Text>
                </View>
            </View>
            <Text style={styles.title}>Расчет стоимости бетонного пола</Text>

            <Text style={styles.description}>
                Предварительный расчет бетонных полов по уплотненному песку, со
                следующими работами:
            </Text>

            <Table
                title='Раздел 1. Оплата труда (с учетом налогов)'
                columns={tableColumns}
                data={laborData}
                totalAmount='715 450,00'
            />
        </Page>
    </Document>
);
export default PDF;
