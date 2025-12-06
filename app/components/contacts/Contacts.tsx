import React from 'react';
import './Contacts.css';

const Contacts: React.FC = () => {
    return (
        <div className='contacts-container'>
            <div className='contacts-grid'>
                {/* Office Section */}
                <div className='contact-section office'>
                    <h3>Офис</h3>
                    <div className='contact-info'>
                        <div className='contact-item'>
                            <img src='images/iconNav.png' alt='iconNav' />
                            <h4>
                                г. Нижний Новгород, Московское шоссе, 52Е корпус
                                1, офис 28
                            </h4>
                        </div>
                        <div className='contact-item'>
                            <img src='images/iconPhone.png' alt='iconPhone' />
                            <p>Телефон: +7 (920) 065-05-05</p>
                        </div>
                        <div className='contact-item'>
                            <img src='images/iconMail.png' alt='iconMail' />
                            <p>
                                e-mail:{' '}
                                <a href='mailto:profixnn@yandex.ru'>
                                    profixnn@yandex.ru
                                </a>
                            </p>
                        </div>
                        <div className='contact-item'>
                            <img src='images/iconClock.png' alt='iconClock' />
                            <p>
                                Режим работы: Пн-Пт 9:00 - 18:00 Сб-Вс -
                                Выходной
                            </p>
                        </div>
                    </div>
                </div>

                {/* Warehouse Section */}
                <div className='contact-section warehouse'>
                    <h3>Склад</h3>
                    <div className='contact-info'>
                        <div className='contact-item'>
                            <img src='images/iconNav.png' alt='iconNav' />
                            <h4>
                                г. Нижний Новгород, просп. Героев, 37/19, тер.
                                Нижкартон
                            </h4>
                        </div>
                        <div className='contact-item'>
                            <img src='images/iconPhone.png' alt='iconPhone' />
                            <p>Телефон: +7 (910) 130-05-05</p>
                        </div>
                        <div className='contact-item'>
                            <img src='images/iconMail.png' alt='iconMail' />
                            <p>
                                e-mail:{' '}
                                <a href='mailto:office@profix-nn.ru'>
                                    office@profix-nn.ru
                                </a>
                            </p>
                        </div>
                        <div className='contact-item'>
                            <img src='images/iconClock.png' alt='iconClock' />
                            <p>
                                Режим работы: Пн-Пт 9:00 - 17:00 Сб-Вс -
                                Выходной
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contacts;
