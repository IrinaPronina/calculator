'use client';
import React from 'react';
import InputNumber from '../Simple/Input/InputNumber';
import { SettingsType } from '@/app/models/adminDataTypes';
import { numberInputValue } from '@/app/utils/functions';

interface GeneralTableProps {
    settings: SettingsType;
}

const GeneralTable = (props: GeneralTableProps) => {
    const [rate, setRate] = React.useState(props.settings.general.rate || 0);
    const [overheads, setOverheads] = React.useState(
        props.settings.general.overheads || 0
    );
    const [profit, setProfit] = React.useState(
        props.settings.general.profit || 0
    );

    const handleChangeRate = (value: string) => {
        setRate(Number(numberInputValue(value.toString())));
    };

    const handleChangeOverheads = (value: string) => {
        setOverheads(Number(numberInputValue(value.toString())));
    };

    const handleChangeProfit = (value: string) => {
        setProfit(Number(numberInputValue(value.toString())));
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
                                value={rate.toString()}
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
                                value={overheads.toString()}
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
                                value={profit.toString()}
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
