'use client';
import React from 'react';
import InputNumber from '../Simple/Input/InputNumber';
import { SettingsType } from '@/app/models/adminDataTypes';
import { numberInputValue } from '@/app/utils/functions';

interface GeneralTableProps {
    settings: SettingsType;
    onChange: (
        patch: Partial<{ rate: number; overheads: number; profit: number }>,
    ) => void;
}

const GeneralTable = (props: GeneralTableProps) => {
    const handleChangeRate = (value: string) => {
        props.onChange({
            rate: Number(numberInputValue(value.toString()) || '0'),
        });
    };

    const handleChangeOverheads = (value: string) => {
        props.onChange({
            overheads: Number(numberInputValue(value.toString()) || '0'),
        });
    };

    const handleChangeProfit = (value: string) => {
        props.onChange({
            profit: Number(numberInputValue(value.toString()) || '0'),
        });
    };

    return (
        <div className='w-full md:w-xl'>
            <table className='border-collapse w-full border-spacing-0 table-auto'>
                <tbody>
                    <tr>
                        <td>Коэффициент</td>
                        <td>
                            <InputNumber
                                type={'number'}
                                size={32}
                                value={props.settings.general.rate.toString()}
                                onChange={handleChangeRate}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Накладные расходы</td>
                        <td>
                            <InputNumber
                                type={'number'}
                                size={32}
                                value={props.settings.general.overheads.toString()}
                                onChange={handleChangeOverheads}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>Сметная прибыль</td>
                        <td>
                            <InputNumber
                                type={'number'}
                                size={32}
                                value={props.settings.general.profit.toString()}
                                onChange={handleChangeProfit}
                            />
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default GeneralTable;
