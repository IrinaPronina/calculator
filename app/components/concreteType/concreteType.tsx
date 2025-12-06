'use client';
import React from 'react';
import Button from '../Simple/Button/Button';
import GeneralTable from '../GeneralTable/GeneralTable';
import PayTable from '../PayTable/PayTable';
import MaterialTable from '../MaterialTable/MaterialTable';
import ExpTable from '../ExpTable/ExpTable';
import { SettingsType } from '@/app/models/adminDataTypes';
import { TABS } from './tabs.data';

interface TabButtonTypes {
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const TabButton = (props: TabButtonTypes) => (
    <div
        className={`relative p-2 text-base text-center w-56 border-solid border-1 hover:cursor-pointer ${
            props.isActive
                ? 'border-[#54b0bf] color-primary'
                : 'border-[#a3a3a3]'
        }`}
        onClick={props.onClick}>
        {props.label}
    </div>
);

interface ConcreteTypeProps {
    settings: SettingsType;
}

const ConcreteType = (props: ConcreteTypeProps) => {
    const [activeTab, setActiveTab] = React.useState('general');

    const handleClickTab = (value: string) => {
        setActiveTab(value);
    };
    console.log(props.settings);

    return (
        <div className='flex flex-col gap-6 w-full'>
            <div className='flex gap-3 flex-col items-center md:flex-row'>
                {TABS.map((tab) => (
                    <TabButton
                        key={tab.label}
                        label={tab.label}
                        isActive={activeTab === tab.title}
                        onClick={() => handleClickTab(tab.title)}
                    />
                ))}
            </div>
            <div className='concrete-type__btn'>
                <Button
                    size={32}
                    variant={'primary'}
                    type={'button'}
                    children={'Сохранить'}
                    backgroundSecondary={false}></Button>
            </div>
            {activeTab === 'general' && (
                <GeneralTable settings={props.settings} />
            )}
            {activeTab === 'material' && (
                <MaterialTable settings={props.settings} />
            )}
            {activeTab === 'pay' && <PayTable settings={props.settings} />}
            {activeTab === 'exp' && <ExpTable settings={props.settings} />}
        </div>
    );
};

export default ConcreteType;
