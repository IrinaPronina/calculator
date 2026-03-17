import React from 'react';

const Info = (props: {
    area: string;
    reinforcement: string;
    base: string;
    concreteGrade?: string;
    microfiber?: string;
    topping?: string;
    toppingAmount?: string;
    pump?: string;
    thickness: string;
    preparation?: string;
}) => {
    const {
        area,
        reinforcement,
        base,
        concreteGrade,
        microfiber,
        topping,
        toppingAmount,
        pump,
        thickness,
        preparation,
    } = props;
    const baseLabelMap: Record<string, string> = {
        base_concrete: 'Существующее бетонное',
        base_sand: 'Уплотненный песок',
        base_rubble: 'Уплотненный щебень',
    };
    const concreteGradeLabelMap: Record<string, string> = {
        '1': 'М250 (В20)',
        '2': 'М300 (В22,5)',
        '3': 'М350 (В25)',
    };
    return (
        <section className='mb-8'>
            <h2 className='py-4 mt-2.5 text-2xl font-Exo2Bold text-center text-primary md:text-3xl '>
                Информация о заказе
            </h2>
            <div className='relative'>
                <div className='grid grid-cols-2 border-b border-[#e4e4e4] sm:grid-cols-4'>
                    <div className='text-right p-2.5 text-base font-normal bg-[#ddd]'>
                        Площадь пола
                    </div>
                    <div className='text-left bg-white border-t border-r border-[#e4e4e4] p-2.5'>
                        {area.length > 0 ? `${area} м²` : area}
                    </div>
                    <div className='text-right p-2.5 text-base font-normal bg-[#ddd]'>
                        Армирование
                    </div>
                    <div className='text-left bg-white border-t border-r border-[#e4e4e4] p-2.5'>
                        {reinforcement}
                    </div>
                    <div className='text-right p-2.5 text-base font-normal bg-[#ddd]'>
                        Ваше основание
                    </div>
                    <div className='text-left bg-white border-t border-r border-[#e4e4e4] p-2.5'>
                        {baseLabelMap[base] || base}
                    </div>
                    <div className='text-right p-2.5 text-base font-normal bg-[#ddd]'>
                        Марка бетона
                    </div>
                    <div className='text-left bg-white border-t border-r border-[#e4e4e4] p-2.5'>
                        {concreteGradeLabelMap[concreteGrade || ''] || ''}
                        {microfiber === 'no'
                            ? ' / без микрофибры'
                            : microfiber
                            ? ` / микрофибра ${microfiber} кг/м³`
                            : ''}
                    </div>
                    <div className='text-right p-2.5 text-base font-normal bg-[#ddd]'>
                        Толщина бетона
                    </div>
                    <div className='text-left bg-white border-t border-r border-[#e4e4e4] p-2.5'>
                        {thickness === 'auto' ? 'Рекомендованная' : thickness}
                    </div>
                    <div className='text-right p-2.5 text-base font-normal bg-[#ddd]'>
                        Топпинг
                    </div>
                    <div className='text-left bg-white border-t border-r border-[#e4e4e4] p-2.5'>
                        {topping === 'no'
                            ? 'Нет'
                            : `Да${toppingAmount ? ` (${toppingAmount} кг/м²)` : ''}`}
                    </div>
                    <div className='text-right p-2.5 text-base font-normal bg-[#ddd]'>
                        Подбетонка
                    </div>
                    <div className='text-left bg-white border-t border-r border-[#e4e4e4] p-2.5'>
                        {preparation === 'no'
                            ? 'Нет'
                            : preparation
                            ? `${preparation} мм`
                            : ''}
                    </div>
                    <div className='text-right p-2.5 text-base font-normal bg-[#ddd]'>
                        Бетононасос
                    </div>
                    <div className='text-left bg-white border-t border-r border-[#e4e4e4] p-2.5'>
                        {pump === 'yes' ? 'Да' : 'Нет'}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Info;
