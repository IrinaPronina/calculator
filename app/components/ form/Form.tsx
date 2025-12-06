'use client';
import React from 'react';
import InputNumber from '../Simple/Input/InputNumber';
import Radio from '../Simple/Radio';
import Info from '../info/Info';
import Button from '../Simple/Button/Button';
import { BASES } from './base.date';
import Modal from '../Simple/Modal/Modal';
import PreOffer from '../preOffer/PreOffer';
import { useRouter } from 'next/navigation';
import { SettingsType } from '@/app/models/adminDataTypes';

interface FormProps {
    settings: SettingsType[];
    loading: boolean;
}

const Form = ({ settings, loading }: FormProps) => {
    const router = useRouter();

    const [isOpen, setIsOpen] = React.useState(false);
    const [base, setBase] = React.useState<string>('');
    const [thickness, setThickness] = React.useState<string>('');
    const [area, setArea] = React.useState('');
    const [validArea, setValidArea] = React.useState(true);
    const [validThickness, setValidThickness] = React.useState(true);
    const handleClickRadio = (value: string) => {
        setBase(value);
    };

    const handleChangeThickness = (value: string) => {
        setThickness(value === 'doNotKnow' ? 'Не знаю' : value);
    };

    const handleChangeArea = (value: string) => {
        value = value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
        setArea(value);
        validate(value);
    };

    function validate(v: string) {
        const firstIntgr = v.slice(0, 1);
        if ((+firstIntgr > 0 && +v > 100) || v.length === 0) {
            setValidArea(true);
        } else {
            setValidArea(false);
        }
    }
    function validateThickness(v: string) {
        const firstIntgr = v.slice(0, 1);
        if ((+firstIntgr > 70 && +v > 250) || v.length === 0) {
            setValidThickness(true);
        } else {
            setValidThickness(false);
        }
    }
    const handleClickCalc = () => {
        setIsOpen(true);
        // console.log(area, base, thickness);
    };

    return (
        <>
            <form id='com_calc' className='mb-10' onSubmit={handleClickCalc}>
                <div className='shadow-xl text-white'>
                    <div className='bg-primary py-2.5 px-5'>
                        <h3 className='text-2xl mb-2.5 font-Exo2Bold'>
                            Получите подробный расчет стоимости бетонного пола
                        </h3>
                        <div className='mb-1.5 '>
                            <p className='text-base'>
                                * Заполнив параметры и данные, вы получите
                                предварительный расчет бетонного пола с
                                обработанной поверхностью. Все дополнительные
                                работы и не учтенные параметры мы согласуем и
                                включим в стоимость, после выезда на Ваш объект
                                нашего специалиста.
                            </p>
                        </div>
                    </div>
                    <div className='py-2.5 text-neutral-600 font-Exo2Medium'>
                        <h3 className='mb-2.5 font-Exo2Bold text-2xl px-5'>
                            Введите Ваши данные:
                        </h3>
                        <div className=''>
                            <div className='flex flex-wrap py-2.5 px-5 text-base'>
                                <div className='flex w-auto justify-between items-center relative'>
                                    <label className='select-none relative'>
                                        <span className='mr-1'>
                                            Площадь пола (в м<sup>2</sup>)
                                        </span>
                                        <InputNumber
                                            className='w-32'
                                            type={'text'}
                                            size={32}
                                            minLength={3}
                                            maxLength={7}
                                            value={area}
                                            placeholder='от 100'
                                            onChange={handleChangeArea}
                                            // onBlur={handleOnBlurArea}
                                            // backgroundSecondary={false}
                                        />
                                        <div className=' w-60 h-full flex items-center sm:absolute left-80 top-0'>
                                            {!validArea && (
                                                <p className='bg-white text-red-400'>
                                                    Введите значение от 100м
                                                    <sup>2</sup>
                                                </p>
                                            )}
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div className='bg-linear-to-r from-[#54b0bf] to-white py-1 px-5 font-Exo2Medium text-xl text-white leading-9'>
                                Ваше основание
                            </div>
                            <div className='py-2.5 px-5 flex flex-wrap font-Exo2Medium'>
                                {BASES.map((item) => (
                                    <Radio
                                        key={item.id}
                                        checked={base}
                                        name={item.name}
                                        value={item.value}
                                        id={item.id}
                                        onChange={() =>
                                            handleClickRadio(item.name)
                                        }
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <div className='bg-linear-to-r from-[#54b0bf] to-white py-1 px-5 font-Exo2Medium text-xl text-white leading-9'>
                                Толщина бетона
                            </div>
                            <div className='flex items-center py-2.5 px-5 flex-wrap'>
                                <div className='mr-2.5'>
                                    <label className='select-none relative'>
                                        <InputNumber
                                            className='w-32'
                                            type={'text'}
                                            size={32}
                                            minLength={2}
                                            maxLength={3}
                                            value={
                                                thickness === 'doNotKnow'
                                                    ? ''
                                                    : thickness
                                            }
                                            onChange={handleChangeThickness}
                                            // onBlur={handleOnBlurArea}
                                            // backgroundSecondary={false}
                                        />
                                        <span className='ml-1'>
                                            *от 70 до 250 мм
                                        </span>
                                    </label>
                                </div>
                                <Radio
                                    checked={thickness}
                                    name={'Не знаю'}
                                    value={'doNotKnow'}
                                    id={'doNotKnow'}
                                    onChange={() =>
                                        handleChangeThickness('doNotKnow')
                                    }
                                />
                                {/* <div className=' w-60 h-full flex items-center sm:absolute left-80 top-0'>
                                    {!validThickness && (
                                        <p className='bg-white text-red-400'>
                                            Введите значение от 70 до 250 мм
                                        </p>
                                    )}
                                </div> */}
                            </div>
                        </div>
                    </div>
                </div>
                <Info
                    area={area}
                    reinforcement={base}
                    base={base}
                    thickness={thickness}
                    // preparation={preparation}
                />
                <Button
                    className='mt-8 w-full sm:w-80'
                    size={52}
                    variant={'primary'}
                    type={'button'}
                    children={'Расчет'}
                    onClick={handleClickCalc}
                    backgroundSecondary={false}></Button>
            </form>

            {isOpen && (
                <Modal
                    isOpen={isOpen}
                    showCloseButton={true}
                    onClose={() => setIsOpen(false)}
                    title='Расчет стоимости бетонного пола'
                    size='xl'>
                    <PreOffer
                        area={area}
                        base={base}
                        thickness={thickness}
                        settings={settings}
                        loading={loading}
                    />
                </Modal>
            )}
        </>
    );
};

export default Form;
