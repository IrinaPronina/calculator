import React from 'react';
import InputNumber from './InputNumber';
import { inputTypes } from './types';
import InputText from './InputText';

const Input = (props: inputTypes) => {
  const { type } = props;
  switch (type) {
    case 'text':
      return <InputText {...props} />;
    case 'number':
      return <InputNumber {...props} />;
    default:
      return <p>Кажется вы забыли передать обязательные параметры</p>;
  }
};
export default Input;
