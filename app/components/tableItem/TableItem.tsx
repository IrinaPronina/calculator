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

const toDisplayValue = (value: number): string => String(value).replace('.', ',');

const sanitizeDecimalInput = (value: string): string =>
    value.replace(/[^0-9.,]/g, '').replace(/([.,].*)[.,]/g, '$1');

const TableItem = (props: TableItemProps) => {
    const [increaseInput, setIncreaseInput] = React.useState<string>(
        toDisplayValue(props.increase),
    );
    const [priceInput, setPriceInput] = React.useState<string>(
        toDisplayValue(props.price),
    );

    React.useEffect(() => {
        setIncreaseInput(toDisplayValue(props.increase));
    }, [props.increase]);

    React.useEffect(() => {
        setPriceInput(toDisplayValue(props.price));
    }, [props.price]);

    const commitIncrease = (value: string) => {
        const normalized = numberInputValue(value);
        props.onChange(props.id, {
            increase: normalized.length > 0 ? Number(normalized) : 0,
        });
    };

    const commitPrice = (value: string) => {
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
                    type={'text'}
                    size={32}
                    value={increaseInput}
                    onChange={(value) => setIncreaseInput(sanitizeDecimalInput(value))}
                    onBlur={(value) => commitIncrease(value)}
                />
            </td>
            <td>
                <InputNumber
                    type={'text'}
                    size={32}
                    value={priceInput}
                    onChange={(value) => setPriceInput(sanitizeDecimalInput(value))}
                    onBlur={(value) => commitPrice(value)}
                />
            </td>
        </tr>
    );
};

export default TableItem;
