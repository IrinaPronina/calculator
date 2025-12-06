import { radioTypes } from './types';
import './radio.css';

const Radio = (props: radioTypes) => {
    return (
        <div className='radio'>
            <input
                className='radio__input'
                checked={props.checked === props.name}
                type='radio'
                name={props.name}
                value={props.value}
                id={props.id}
                onChange={props.onChange}
                // defaultChecked
            />
            <label htmlFor={props.id} className='radio__label'>
                {props.name}
            </label>
        </div>
    );
};

export default Radio;
