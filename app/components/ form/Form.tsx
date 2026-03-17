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

const REINFORCEMENTS = [
    { id: 'reinforcement_single', name: 'Одинарное', value: 'single' },
    { id: 'reinforcement_double', name: 'Двойное', value: 'double' },
    { id: 'reinforcement_grid', name: 'Сварная сетка', value: 'grid' },
    { id: 'reinforcement_fiber', name: 'Фибра полимерная', value: 'fiber' },
    { id: 'reinforcement_auto', name: 'Не знаю', value: 'doNotKnow' },
];

const CONCRETE_GRADES = [
    { value: '1', label: 'М250 (В20)' },
    { value: '2', label: 'М300 (В22,5)' },
    { value: '3', label: 'М350 (В25)' },
];

const MICROFIBER_OPTIONS = ['0.5', '0.6', '0.7', '0.8', '0.9', '1.0'];

const Form = ({ settings, loading }: FormProps) => {
    const router = useRouter();

    const [isOpen, setIsOpen] = React.useState(false);
    const [base, setBase] = React.useState<string>('base_concrete');
    const [reinforcement, setReinforcement] =
        React.useState<string>('doNotKnow');
    const [reinforcementSingleFitting, setReinforcementSingleFitting] =
        React.useState<string>('8');
    const [reinforcementSingleCell, setReinforcementSingleCell] =
        React.useState<string>('200');
    const [reinforcementDoubleFitting, setReinforcementDoubleFitting] =
        React.useState<string>('8');
    const [reinforcementDoubleFitting2, setReinforcementDoubleFitting2] =
        React.useState<string>('8');
    const [reinforcementDoubleCell, setReinforcementDoubleCell] =
        React.useState<string>('200');
    const [reinforcementGridFitting, setReinforcementGridFitting] =
        React.useState<string>('3');
    const [reinforcementGridCell, setReinforcementGridCell] =
        React.useState<string>('150');
    const [reinforcementFiber, setReinforcementFiber] =
        React.useState<string>('1');
    const [concreteGrade, setConcreteGrade] = React.useState<string>('1');
    const [microfiber, setMicrofiber] = React.useState<string>('no');
    const [microfiberAmount, setMicrofiberAmount] =
        React.useState<string>('0.5');
    const [topping, setTopping] = React.useState<string>('yes');
    const [toppingAmount, setToppingAmount] = React.useState<string>('3');
    const [pump, setPump] = React.useState<string>('no');
    const [thickness, setThickness] = React.useState<string>('auto');
    const [preparation, setPreparation] = React.useState<string>('no');
    const [area, setArea] = React.useState('');
    const [formErrors, setFormErrors] = React.useState<string[]>([]);
    const [validArea, setValidArea] = React.useState(true);
    const [validThickness, setValidThickness] = React.useState(true);
    const handleClickRadio = (value: string) => {
        setBase(value);
    };

    const handleChangeThickness = (value: string) => {
        setThickness(value === 'doNotKnow' ? 'auto' : value);
    };

    const handleChangePreparation = (value: string) => {
        setPreparation(value === 'no' ? 'no' : value);
    };

    const handleChangeReinforcement = (value: string) => {
        setReinforcement(value);
    };

    const handleChangeMicrofiber = (value: string) => {
        setMicrofiber(value);
    };

    const handleChangeTopping = (value: string) => {
        setTopping(value);
    };

    const handleChangePump = (value: string) => {
        setPump(value);
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
    const validateBeforeCalculate = (): string[] => {
        const errors: string[] = [];

        const areaValue = Number(area);
        if (!Number.isFinite(areaValue) || areaValue < 100 || areaValue > 20000) {
            errors.push('Площадь пола должна быть от 100 до 20000 м².');
        }

        if (thickness !== 'auto') {
            const thicknessValue = Number(thickness);
            if (
                !Number.isFinite(thicknessValue) ||
                thicknessValue < 70 ||
                thicknessValue > 250
            ) {
                errors.push('Толщина бетона должна быть от 70 до 250 мм или "Не знаю".');
            }
        }

        if (preparation !== 'no') {
            const preparationValue = Number(preparation);
            if (
                !Number.isFinite(preparationValue) ||
                preparationValue < 50 ||
                preparationValue > 100
            ) {
                errors.push('Бетонная подготовка должна быть от 50 до 100 мм или "Нет".');
            }
        }

        switch (reinforcement) {
            case 'single': {
                const diam = Number(reinforcementSingleFitting);
                const cell = Number(reinforcementSingleCell);
                if (![8, 10, 12, 14].includes(diam)) {
                    errors.push('Для одинарного армирования выбран недопустимый диаметр.');
                }
                if (![150, 200].includes(cell)) {
                    errors.push('Для одинарного армирования выбран недопустимый размер ячейки.');
                }
                if (cell === 150 && ![8, 10].includes(diam)) {
                    errors.push('Для ячейки 150 допустим диаметр только 8 или 10.');
                }
                break;
            }
            case 'double': {
                const diam1 = Number(reinforcementDoubleFitting);
                const diam2 = Number(reinforcementDoubleFitting2);
                const cell = Number(reinforcementDoubleCell);
                if (
                    ![8, 10, 12, 14].includes(diam1) ||
                    ![8, 10, 12, 14].includes(diam2)
                ) {
                    errors.push('Для двойного армирования выбран недопустимый диаметр.');
                }
                if (![150, 200].includes(cell)) {
                    errors.push('Для двойного армирования выбран недопустимый размер ячейки.');
                }
                if (cell === 150 && (![8, 10].includes(diam1) || ![8, 10].includes(diam2))) {
                    errors.push('Для двойного армирования с ячейкой 150 допустимы диаметры только 8 или 10.');
                }
                break;
            }
            case 'grid': {
                const diam = Number(reinforcementGridFitting);
                const cell = Number(reinforcementGridCell);
                if (![3, 4, 5].includes(diam)) {
                    errors.push('Для сварной сетки выбран недопустимый диаметр.');
                }
                if (![100, 150, 200].includes(cell)) {
                    errors.push('Для сварной сетки выбран недопустимый размер ячейки.');
                }
                break;
            }
            case 'fiber': {
                const qty = Number(reinforcementFiber);
                if (![1, 2, 3].includes(qty)) {
                    errors.push('Для фибры полимерной допустимо значение 1, 2 или 3 кг/м³.');
                }
                break;
            }
            case 'doNotKnow':
                break;
            default:
                errors.push('Не выбрано армирование.');
        }

        if (microfiber !== 'no') {
            const microValue = Number(microfiber);
            if (!Number.isFinite(microValue) || microValue < 0.5 || microValue > 1.0) {
                errors.push('Микрофибра должна быть в диапазоне от 0.5 до 1.0 кг/м³.');
            }
        }

        if (topping === 'yes') {
            const topValue = Number(toppingAmount);
            if (!Number.isFinite(topValue) || topValue < 3 || topValue > 5) {
                errors.push('Упрочнение топпингом должно быть в диапазоне от 3 до 5 кг/м².');
            }
        }

        return errors;
    };

    const handleClickCalc = () => {
        const errors = validateBeforeCalculate();
        setFormErrors(errors);

        if (errors.length > 0) {
            setIsOpen(false);
            return;
        }

        setIsOpen(true);
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
                                                groupName='base'
                                                name={item.name}
                                                value={item.value}
                                                id={item.id}
                                                onChange={(event) =>
                                                    handleClickRadio(
                                                        event.target.value
                                                    )
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
                                            min={0}
                                            value={
                                                thickness === 'auto'
                                                    ? ''
                                                    : thickness
                                            }
                                            placeholder='*от 70 до 250 мм'
                                            onChange={handleChangeThickness}
                                            // onBlur={handleOnBlurArea}
                                            // backgroundSecondary={false}
                                        />
                                    </label>
                                </div>
                                <Radio
                                    checked={thickness}
                                    groupName='thickness'
                                    name={'Не знаю'}
                                    value={'auto'}
                                    id={'doNotKnow'}
                                    onChange={(event) =>
                                        handleChangeThickness(
                                            event.target.value
                                        )
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
                        <div>
                            <div className='bg-linear-to-r from-[#54b0bf] to-white py-1 px-5 font-Exo2Medium text-xl text-white leading-9'>
                                Бетонная подготовка
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
                                                preparation === 'no'
                                                    ? ''
                                                    : preparation
                                            }
                                            placeholder='*от 50 до 100 мм'
                                            onChange={handleChangePreparation}
                                        />
                                    </label>
                                </div>
                                <Radio
                                    checked={preparation}
                                    groupName='preparation'
                                    name={'Нет'}
                                    value={'no'}
                                    id={'preparation_no'}
                                    onChange={(event) =>
                                        handleChangePreparation(
                                            event.target.value
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div>
                            <div className='bg-linear-to-r from-[#54b0bf] to-white py-1 px-5 font-Exo2Medium text-xl text-white leading-9'>
                                Армирование
                            </div>
                            <div className='py-2.5 px-5 flex flex-wrap font-Exo2Medium'>
                                {REINFORCEMENTS.map((item) => (
                                    <Radio
                                        key={item.id}
                                        checked={reinforcement}
                                        groupName='reinforcement'
                                        name={item.name}
                                        value={item.value}
                                        id={item.id}
                                        onChange={(event) =>
                                            handleChangeReinforcement(
                                                event.target.value
                                            )
                                        }
                                    />
                                ))}
                            </div>
                            <div className='px-5 pb-2.5 flex flex-wrap items-center gap-3'>
                                {reinforcement === 'single' && (
                                    <>
                                        <div className='flex items-center gap-2'>
                                            <label htmlFor='reinforcement_single_fitting'>
                                                Диаметр арматуры
                                            </label>
                                            <select
                                                id='reinforcement_single_fitting'
                                                className='border-2 border-[#54b0bf] bg-white h-[37px] px-2'
                                                value={reinforcementSingleFitting}
                                                onChange={(event) =>
                                                    setReinforcementSingleFitting(
                                                        event.target.value
                                                    )
                                                }>
                                                <option value='8'>8</option>
                                                <option value='10'>10</option>
                                                <option value='12'>12</option>
                                                <option value='14'>14</option>
                                            </select>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <label htmlFor='reinforcement_single_cell'>
                                                Ячейка
                                            </label>
                                            <select
                                                id='reinforcement_single_cell'
                                                className='border-2 border-[#54b0bf] bg-white h-[37px] px-2'
                                                value={reinforcementSingleCell}
                                                onChange={(event) =>
                                                    setReinforcementSingleCell(
                                                        event.target.value
                                                    )
                                                }>
                                                <option value='200'>200</option>
                                                <option value='150'>150</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                {reinforcement === 'double' && (
                                    <>
                                        <div className='flex items-center gap-2'>
                                            <label htmlFor='reinforcement_double_fitting'>
                                                Диаметр 1 слоя
                                            </label>
                                            <select
                                                id='reinforcement_double_fitting'
                                                className='border-2 border-[#54b0bf] bg-white h-[37px] px-2'
                                                value={reinforcementDoubleFitting}
                                                onChange={(event) =>
                                                    setReinforcementDoubleFitting(
                                                        event.target.value
                                                    )
                                                }>
                                                <option value='8'>8</option>
                                                <option value='10'>10</option>
                                                <option value='12'>12</option>
                                                <option value='14'>14</option>
                                            </select>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <label htmlFor='reinforcement_double_fitting2'>
                                                Диаметр 2 слоя
                                            </label>
                                            <select
                                                id='reinforcement_double_fitting2'
                                                className='border-2 border-[#54b0bf] bg-white h-[37px] px-2'
                                                value={reinforcementDoubleFitting2}
                                                onChange={(event) =>
                                                    setReinforcementDoubleFitting2(
                                                        event.target.value
                                                    )
                                                }>
                                                <option value='8'>8</option>
                                                <option value='10'>10</option>
                                                <option value='12'>12</option>
                                                <option value='14'>14</option>
                                            </select>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <label htmlFor='reinforcement_double_cell'>
                                                Ячейка
                                            </label>
                                            <select
                                                id='reinforcement_double_cell'
                                                className='border-2 border-[#54b0bf] bg-white h-[37px] px-2'
                                                value={reinforcementDoubleCell}
                                                onChange={(event) =>
                                                    setReinforcementDoubleCell(
                                                        event.target.value
                                                    )
                                                }>
                                                <option value='200'>200</option>
                                                <option value='150'>150</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                {reinforcement === 'grid' && (
                                    <>
                                        <div className='flex items-center gap-2'>
                                            <label htmlFor='reinforcement_grid_fitting'>
                                                Диаметр арматуры
                                            </label>
                                            <select
                                                id='reinforcement_grid_fitting'
                                                className='border-2 border-[#54b0bf] bg-white h-[37px] px-2'
                                                value={reinforcementGridFitting}
                                                onChange={(event) =>
                                                    setReinforcementGridFitting(
                                                        event.target.value
                                                    )
                                                }>
                                                <option value='3'>3</option>
                                                <option value='4'>4</option>
                                                <option value='5'>5</option>
                                            </select>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <label htmlFor='reinforcement_grid_cell'>
                                                Ячейка
                                            </label>
                                            <select
                                                id='reinforcement_grid_cell'
                                                className='border-2 border-[#54b0bf] bg-white h-[37px] px-2'
                                                value={reinforcementGridCell}
                                                onChange={(event) =>
                                                    setReinforcementGridCell(
                                                        event.target.value
                                                    )
                                                }>
                                                <option value='150'>150</option>
                                                <option value='200'>200</option>
                                            </select>
                                        </div>
                                    </>
                                )}
                                {reinforcement === 'fiber' && (
                                    <div className='flex items-center gap-2'>
                                        <label htmlFor='reinforcement_fiber'>
                                            Кол-во на 1 м³
                                        </label>
                                        <select
                                            id='reinforcement_fiber'
                                            className='border-2 border-[#54b0bf] bg-white h-[37px] px-2'
                                            value={reinforcementFiber}
                                            onChange={(event) =>
                                                setReinforcementFiber(
                                                    event.target.value
                                                )
                                            }>
                                            <option value='1'>1</option>
                                            <option value='2'>2</option>
                                            <option value='3'>3</option>
                                        </select>
                                    </div>
                                )}
                                {reinforcement === 'doNotKnow' && (
                                    <div className='text-neutral-600'>
                                        Рекомендованное минимальное
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className='bg-linear-to-r from-[#54b0bf] to-white py-1 px-5 font-Exo2Medium text-xl text-white leading-9'>
                                Марка бетона (микрофибра)
                            </div>
                            <div className='py-2.5 px-5 flex flex-wrap items-center gap-4'>
                                <div className='flex items-center gap-2'>
                                    <label htmlFor='concrete_grade'>
                                        Бетон
                                    </label>
                                    <select
                                        id='concrete_grade'
                                        name='concrete_grade'
                                        className='border-2 border-[#54b0bf] bg-white h-[37px] px-2'
                                        value={concreteGrade}
                                        onChange={(event) =>
                                            setConcreteGrade(event.target.value)
                                        }>
                                        {CONCRETE_GRADES.map((item) => (
                                            <option
                                                key={item.value}
                                                value={item.value}>
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className='text-neutral-600'>
                                    С микрофиброй
                                </div>
                                <Radio
                                    checked={microfiber}
                                    groupName='microfiber'
                                    name='Нет'
                                    value='no'
                                    id='microfiber_no'
                                    onChange={(event) =>
                                        handleChangeMicrofiber(
                                            event.target.value
                                        )
                                    }
                                />
                                <Radio
                                    checked={microfiber}
                                    groupName='microfiber'
                                    name='Да'
                                    value='yes'
                                    id='microfiber_yes'
                                    onChange={(event) =>
                                        handleChangeMicrofiber(
                                            event.target.value
                                        )
                                    }
                                />
                                {microfiber === 'yes' && (
                                    <select
                                        id='fiber_amount'
                                        name='fiber'
                                        className='border-2 border-[#54b0bf] bg-white h-[37px] px-2'
                                        value={microfiberAmount}
                                        onChange={(event) =>
                                            setMicrofiberAmount(
                                                event.target.value
                                            )
                                        }>
                                        {MICROFIBER_OPTIONS.map((option) => (
                                            <option
                                                key={option}
                                                value={option}>
                                                {option}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className='bg-linear-to-r from-[#54b0bf] to-white py-1 px-5 font-Exo2Medium text-xl text-white leading-9'>
                                Упрочнение топпингом
                            </div>
                            <div className='py-2.5 px-5 flex flex-wrap items-center gap-4'>
                                <Radio
                                    checked={topping}
                                    groupName='topping'
                                    name='Нет'
                                    value='no'
                                    id='topping_no'
                                    onChange={(event) =>
                                        handleChangeTopping(event.target.value)
                                    }
                                />
                                <Radio
                                    checked={topping}
                                    groupName='topping'
                                    name='Да'
                                    value='yes'
                                    id='topping_yes'
                                    onChange={(event) =>
                                        handleChangeTopping(event.target.value)
                                    }
                                />
                                {topping === 'yes' && (
                                    <div className='flex items-center gap-2'>
                                        <select
                                            id='topping_amount'
                                            name='topping_amount'
                                            className='border-2 border-[#54b0bf] bg-white h-[37px] px-2'
                                            value={toppingAmount}
                                            onChange={(event) =>
                                                setToppingAmount(
                                                    event.target.value
                                                )
                                            }>
                                            <option value='3'>3</option>
                                            <option value='4'>4</option>
                                            <option value='5'>5</option>
                                        </select>
                                        <span className='text-neutral-600'>
                                            кг/м²
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div>
                            <div className='bg-linear-to-r from-[#54b0bf] to-white py-1 px-5 font-Exo2Medium text-xl text-white leading-9'>
                                Необходимость бетононасоса
                            </div>
                            <div className='py-2.5 px-5 flex flex-wrap items-center gap-4'>
                                <Radio
                                    checked={pump}
                                    groupName='pump'
                                    name='Нет'
                                    value='no'
                                    id='pump_no'
                                    onChange={(event) =>
                                        handleChangePump(event.target.value)
                                    }
                                />
                                <Radio
                                    checked={pump}
                                    groupName='pump'
                                    name='Да'
                                    value='yes'
                                    id='pump_yes'
                                    onChange={(event) =>
                                        handleChangePump(event.target.value)
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <Info
                    area={area}
                    reinforcement={
                        REINFORCEMENTS.find(
                            (item) => item.value === reinforcement
                        )?.name || reinforcement
                    }
                    base={base}
                    concreteGrade={concreteGrade}
                    microfiber={
                        microfiber === 'yes' ? microfiberAmount : microfiber
                    }
                    topping={topping}
                    toppingAmount={toppingAmount}
                    pump={pump}
                    thickness={thickness}
                    preparation={preparation}
                />
                <Button
                    className='mt-8 w-full sm:w-80'
                    size={52}
                    variant={'primary'}
                    type={'button'}
                    children={'Расчет'}
                    onClick={handleClickCalc}
                    backgroundSecondary={false}></Button>
                {formErrors.length > 0 && (
                    <div className='mt-4 bg-white border border-red-300 text-red-600 p-3'>
                        {formErrors.map((error, index) => (
                            <p key={`${error}-${index}`}>{error}</p>
                        ))}
                    </div>
                )}
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
                        reinforcement={reinforcement}
                        reinforcementSingleFitting={reinforcementSingleFitting}
                        reinforcementSingleCell={reinforcementSingleCell}
                        reinforcementDoubleFitting={reinforcementDoubleFitting}
                        reinforcementDoubleFitting2={reinforcementDoubleFitting2}
                        reinforcementDoubleCell={reinforcementDoubleCell}
                        reinforcementGridFitting={reinforcementGridFitting}
                        reinforcementGridCell={reinforcementGridCell}
                        reinforcementFiber={reinforcementFiber}
                        concreteGrade={concreteGrade}
                        microfiber={
                            microfiber === 'yes' ? microfiberAmount : microfiber
                        }
                        topping={topping}
                        toppingAmount={toppingAmount}
                        pump={pump}
                        thickness={thickness}
                        preparation={preparation}
                        settings={settings}
                        loading={loading}
                    />
                </Modal>
            )}
        </>
    );
};

export default Form;
