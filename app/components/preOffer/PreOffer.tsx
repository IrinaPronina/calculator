import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import PDF from '../PDF/PDF';
import Button from '../Simple/Button/Button';
import { formatCurrency } from '@/app/utils/common';
import ConcreteCalcStore from '@/app/stores/concrete-calc.store';
import { observer } from 'mobx-react';
import { SettingsType } from '@/app/models/adminDataTypes';

interface PreOfferProps {
    area: string;
    base: string;
    thickness: string;
    settings: SettingsType[];
    loading: boolean;
}

const PreOffer = observer(
    ({ area, base, thickness, settings, loading }: PreOfferProps) => {
        console.log(area, base, thickness);
        console.log('Loading:', loading);
        console.log('Props settings:', settings);

        // Check if settings are loaded and have data
        if (loading) {
            return (
                <div className='max-w-7xl mx-auto bg-white rounded-sm shadow-lg p-8'>
                    <div className='text-center text-gray-500'>
                        Калькулирую...
                    </div>
                </div>
            );
        }

        const settingsData = settings[0];
        if (!settingsData || !settingsData.pay) {
            return (
                <div className='max-w-7xl mx-auto bg-white rounded-sm shadow-lg p-8'>
                    <div className='text-center text-red-500'>
                        Ошибка загрузки данных настроек
                    </div>
                </div>
            );
        }

        return (
            <div className='max-w-7xl mx-auto bg-white rounded-sm shadow-lg'>
                {/* Раздел 1. Оплата труда */}
                <div className='mb-8'>
                    <div className='bg-slate-700 text-white px-4 py-3 font-bold rounded-t-sm'>
                        Раздел 1. Оплата труда (с учетом налогов)
                    </div>
                    <div className='overflow-x-auto'>
                        <table className='w-full border-collapse border border-gray-300'>
                            <thead>
                                <tr className='bg-[var(--color-primary)] text-white'>
                                    <th className='table-td text-left font-bold'>
                                        Арт.
                                    </th>
                                    <th className='table-td text-left font-bold'>
                                        Наименование
                                    </th>
                                    <th className='table-td text-left font-bold'>
                                        Объем
                                    </th>
                                    <th className='table-td text-left font-bold'>
                                        изм.
                                    </th>
                                    <th className='table-td text-left font-bold'>
                                        Стоимость, руб.
                                    </th>
                                    <th className='table-td text-left font-bold'>
                                        Всего
                                    </th>
                                    <th className='table-td text-left font-bold'>
                                        Примечание
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className='hover:bg-gray-50'>
                                    <td className='table-td'>0156</td>
                                    <td className='table-td'>
                                        Укладка пленки полиэтиленовой
                                    </td>
                                    <td className='table-td'>{area}</td>
                                    <td className='table-td'>м²</td>
                                    <td className='table-td'>
                                        {formatCurrency(
                                            settingsData.pay.find(
                                                (item) => item.id === '0156'
                                            )?.price || 0
                                        )}
                                    </td>
                                    <td className='table-td'>
                                        {formatCurrency(
                                            Number(area) *
                                                (settingsData.pay.find(
                                                    (item) => item.id === '0156'
                                                )?.price || 0)
                                        )}
                                    </td>
                                    <td className='table-td text-sm text-gray-600 italic'>
                                        в 1 слой с проклейкой
                                    </td>
                                </tr>
                            ))}
                                <tr className='bg-[var(--light-primary)] font-bold'>
                                    <td colSpan={5} className='table-td'>
                                        <strong>Итого по разделу</strong>
                                    </td>
                                    <td className='table-td'>
                                        <strong>
                                            {formatCurrency(715450)}
                                        </strong>
                                    </td>
                                    <td className='table-td'></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Раздел 2. Материалы */}
                <div className='mb-8'>
                    <div className='bg-slate-700 text-white px-4 py-3 font-bold rounded-t-sm'>
                        Раздел 2. Материалы
                    </div>
                    <div className='overflow-x-auto'>
                        <table className='w-full border-collapse border border-gray-300'>
                            <thead>
                                <tr className='bg-[var(--color-primary)] text-white'>
                                    <th className='table-td text-left font-bold'>
                                        Арт.
                                    </th>
                                    <th className='table-td text-left font-bold'>
                                        Наименование
                                    </th>
                                    <th className='table-td text-left font-bold'>
                                        Объем
                                    </th>
                                    <th className='table-td text-left font-bold'>
                                        изм.
                                    </th>
                                    <th className='table-td text-left font-bold'>
                                        Стоимость, руб.
                                    </th>
                                    <th className='table-td text-left font-bold'>
                                        Всего
                                    </th>
                                    <th className='table-td text-left font-bold'>
                                        Примечание
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className='hover:bg-gray-50'>
                                    <td className='table-td'>1011</td>
                                    <td className='table-td'>
                                        Пленка 200мкм п/э техническая рукав
                                        1,5м*100м
                                    </td>
                                    <td className='table-td'>1100</td>
                                    <td className='table-td'>м²</td>
                                    <td className='table-td'>19,80</td>
                                    <td className='table-td'>21 780,00</td>
                                    <td className='table-td text-sm text-gray-600 italic'>
                                        10% на перекрытие
                                    </td>
                                </tr>
                                <tr className='bg-gray-50 hover:bg-gray-100'>
                                    <td className='table-td'>7085</td>
                                    <td className='table-td'>
                                        Сетка сварная С5 150х150мм
                                    </td>
                                    <td className='table-td'>1200</td>
                                    <td className='table-td'>м²</td>
                                    <td className='table-td'>245,70</td>
                                    <td className='table-td'>294 840,00</td>
                                    <td className='table-td text-sm text-gray-600 italic'>
                                        S+20% карта 3х2м
                                    </td>
                                </tr>
                                <tr className='hover:bg-gray-50'>
                                    <td className='table-td'>7101</td>
                                    <td className='table-td'>
                                        Труба профильная 25х25х1,5 мм
                                    </td>
                                    <td className='table-td'>0,15</td>
                                    <td className='table-td'>т</td>
                                    <td className='table-td'>72 192,70</td>
                                    <td className='table-td'>10 828,91</td>
                                    <td className='table-td text-sm text-gray-600 italic'>
                                        0,25м/м², коэф=1,2
                                    </td>
                                </tr>
                                <tr className='bg-gray-50 hover:bg-gray-100'>
                                    <td className='table-td'>7005</td>
                                    <td className='table-td'>
                                        Арматура Ø10 А500С (фиксаторы)
                                    </td>
                                    <td className='table-td'>0,07</td>
                                    <td className='table-td'>т</td>
                                    <td className='table-td'>58 905,70</td>
                                    <td className='table-td'>4 123,40</td>
                                    <td className='table-td text-sm text-gray-600 italic'>
                                        штыри для маяков
                                    </td>
                                </tr>
                                <tr className='hover:bg-gray-50'>
                                    <td className='table-td'>1035</td>
                                    <td className='table-td'>
                                        Фиксатор арматуры на сыпучий грунт
                                        ФС-25/30
                                    </td>
                                    <td className='table-td'>2000</td>
                                    <td className='table-td'>шт</td>
                                    <td className='table-td'>5,00</td>
                                    <td className='table-td'>10 000,00</td>
                                    <td className='table-td text-sm text-gray-600 italic'>
                                        расход 2шт/м²
                                    </td>
                                </tr>
                                <tr className='bg-gray-50 hover:bg-gray-100'>
                                    <td className='table-td'>1002</td>
                                    <td className='table-td'>
                                        ВПС-полотно ТИЛИТ Базис 8мм
                                    </td>
                                    <td className='table-td'>18</td>
                                    <td className='table-td'>м²</td>
                                    <td className='table-td'>87,20</td>
                                    <td className='table-td'>1 569,60</td>
                                    <td className='table-td text-sm text-gray-600 italic'>
                                        расход +10%
                                    </td>
                                </tr>
                                <tr className='hover:bg-gray-50'>
                                    <td className='table-td'>7021</td>
                                    <td className='table-td'>
                                        Бетон М250 В20 на гравии
                                    </td>
                                    <td className='table-td'>79</td>
                                    <td className='table-td'>м³</td>
                                    <td className='table-td'>8 568,00</td>
                                    <td className='table-td'>676 872,00</td>
                                    <td className='table-td text-sm text-gray-600 italic'>
                                        5% запас-усадка
                                    </td>
                                </tr>
                                <tr className='bg-gray-50 hover:bg-gray-100'>
                                    <td className='table-td'>1221</td>
                                    <td className='table-td'>
                                        Топпинг MONOPOL Top 200 корундовый
                                    </td>
                                    <td className='table-td'>3000</td>
                                    <td className='table-td'>кг</td>
                                    <td className='table-td'>31,50</td>
                                    <td className='table-td'>94 500,00</td>
                                    <td className='table-td text-sm text-gray-600 italic'>
                                        расход 3-5 кг/м²
                                    </td>
                                </tr>
                                <tr className='hover:bg-gray-50'>
                                    <td className='table-td'>1601</td>
                                    <td className='table-td'>
                                        Пропитка MONOPOL Sealer 2
                                    </td>
                                    <td className='table-td'>90</td>
                                    <td className='table-td'>л</td>
                                    <td className='table-td'>464,40</td>
                                    <td className='table-td'>41 796,00</td>
                                    <td className='table-td text-sm text-gray-600 italic'>
                                        расход 0,09 л/м²
                                    </td>
                                </tr>
                                <tr className='bg-gray-50 hover:bg-gray-100'>
                                    <td className='table-td'>1404</td>
                                    <td className='table-td'>
                                        Герметик MONOPOL PU 40 серый 600мл
                                    </td>
                                    <td className='table-td'>56</td>
                                    <td className='table-td'>шт</td>
                                    <td className='table-td'>508,30</td>
                                    <td className='table-td'>28 464,80</td>
                                    <td className='table-td text-sm text-gray-600 italic'>
                                        80 мл/м = 0,08шт/м
                                    </td>
                                </tr>
                                <tr className='hover:bg-gray-50'>
                                    <td className='table-td'>9999</td>
                                    <td className='table-td'>
                                        Расходные и вспомогательные материалы
                                    </td>
                                    <td className='table-td'>1000</td>
                                    <td className='table-td'>м²</td>
                                    <td className='table-td'>45,00</td>
                                    <td className='table-td'>45 000,00</td>
                                    <td className='table-td text-sm text-gray-600 italic'>
                                        инструмент, ГСМ и пр.
                                    </td>
                                </tr>
                                <tr className='bg-[var(--light-primary)] font-bold'>
                                    <td colSpan={5} className='table-td'>
                                        <strong>Итого по разделу</strong>
                                    </td>
                                    <td className='table-td'>
                                        <strong>1 229 774,70</strong>
                                    </td>
                                    <td className='table-td'></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Раздел 3. Эксплуатация машин и механизмов */}
                <div className='mb-8'>
                    <div className='bg-slate-700 text-white px-4 py-3 font-bold rounded-t-sm'>
                        Раздел 3. Эксплуатация машин и механизмов
                    </div>
                    <div className='overflow-x-auto'>
                        <table className='w-full border-collapse border border-gray-300'>
                            <thead>
                                <tr className='bg-[var(--color-primary)] text-white'>
                                    <th className='table-td text-left font-bold'>
                                        Арт.
                                    </th>
                                    <th className='table-td text-left font-bold'>
                                        Наименование
                                    </th>
                                    <th className='table-td text-left font-bold'>
                                        Объем
                                    </th>
                                    <th className='table-td text-left font-bold'>
                                        изм.
                                    </th>
                                    <th className='table-td text-left font-bold'>
                                        Стоимость, руб.
                                    </th>
                                    <th className='table-td text-left font-bold'>
                                        Всего
                                    </th>
                                    <th className='table-td text-left font-bold'>
                                        Примечание
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className='hover:bg-gray-50'>
                                    <td className='table-td'>0162</td>
                                    <td className='table-td'>
                                        Эксплуатация машин и механизмов
                                    </td>
                                    <td className='table-td'>1000</td>
                                    <td className='table-td'>м²</td>
                                    <td className='table-td'>30,00</td>
                                    <td className='table-td'>30 000,00</td>
                                    <td className='table-td text-sm text-gray-600 italic'>
                                        амортизация
                                    </td>
                                </tr>
                                <tr className='bg-[var(--light-primary)] font-bold'>
                                    <td colSpan={5} className='table-td'>
                                        <strong>Итого по разделу</strong>
                                    </td>
                                    <td className='table-td'>
                                        <strong>30 000,00</strong>
                                    </td>
                                    <td className='table-td'></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className='bg-[var(--dark-primary)] text-white p-4 text-center text-xl font-bold rounded-sm'>
                    <strong>ОБЩАЯ СТОИМОСТЬ: 1 975 224,70 руб.</strong>
                </div>
                <div className='flex justify-center'>
                    <a href='/pdf-offer'>hhh</a>
                    <PDFDownloadLink
                        document={<PDF />}
                        fileName='smeta_Profix_NN.pdf'>
                        <Button
                            className='mt-8 mb-8 w-full sm:w-80'
                            size={52}
                            variant={'primary'}
                            type={'button'}
                            children={'Скачать смету в формате PDF'}
                            backgroundSecondary={false}
                        />
                    </PDFDownloadLink>
                </div>
            </div>
        );
    }
);

export default PreOffer;
