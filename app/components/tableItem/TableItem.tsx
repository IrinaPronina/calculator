'use client';
import React from 'react';
import InputNumber from '../Simple/Input/InputNumber';
import { numberInputValue } from '@/app/utils/functions';

interface TableItemProps {
    id: string;
    name: string;
    price: number;
    increase: number;
    onChange: (id: string, patch: { price?: number; increase?: number }) => void;
}

const TableItem = (props: TableItemProps) => {
    const handleChangeIncrease = (value: string) => {
        const normalized = numberInputValue(value);
        props.onChange(props.id, {
            increase: normalized.length > 0 ? Number(normalized) : 0,
        });
    };

    const handleChangePrice = (value: string) => {
        const normalized = numberInputValue(value);
        props.onChange(props.id, {
            price: normalized.length > 0 ? Number(normalized) : 0,
        });
    };

    return (
        <tr>
            <td>{props.id}</td>
            <td>{props.name}</td>
            <td>
                <InputNumber
                    type={'number'}
                    size={32}
                    value={props.increase.toString()}
                    onChange={handleChangeIncrease}
                />
            </td>
            <td>
                <InputNumber
                    type={'number'}
                    size={32}
                    value={props.price.toString()}
                    onChange={handleChangePrice}
                />
            </td>
        </tr>
    );
};

export default TableItem;
