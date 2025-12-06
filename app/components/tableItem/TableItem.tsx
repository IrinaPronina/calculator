'use client';
import React from 'react';
import InputNumber from '../Simple/Input/InputNumber';

interface TableItemProps {
    id: string;
    name: string;
    price: number;
    increase: number;
}

const TableItem = (props: TableItemProps) => {
    return (
        <tr>
            <td>{props.id}</td>
            <td>{props.name}</td>
            <td>
                <InputNumber
                    type={'number'}
                    size={32}
                    value={props.increase.toString()}
                    onChange={() => {}}
                />
            </td>
            <td>
                <InputNumber
                    type={'number'}
                    size={32}
                    value={props.price.toString()}
                    onChange={() => {}}
                />
            </td>
        </tr>
    );
};

export default TableItem;
