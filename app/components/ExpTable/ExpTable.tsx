import React from 'react';
import InputNumber from '../Simple/Input/InputNumber';
import { SettingsType } from '@/app/models/adminDataTypes';
import TableItem from '../tableItem/TableItem';

interface ExpTableProps {
    settings: SettingsType;
}

const ExpTable = (props: ExpTableProps) => {
    return (
        <div className='w-full max-w-776 overflow-auto'>
            <table className='border-collapse w-full border-spacing-0 table-auto'>
                <thead>
                    <tr>
                        <th>Артикул</th>
                        <th>Название</th>
                        <th>Надбавка</th>
                        <th>Расценка</th>
                    </tr>
                </thead>
                <tbody>
                    {props.settings.exp.map((item) => (
                        <TableItem
                            key={item.id}
                            id={item.id}
                            name={item.name}
                            price={item.price}
                            increase={item.increase}
                        />
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ExpTable;
