export interface inputTypes {
  type: 'number' | 'text' | 'password';
  size?: 32;
  value: string;
  className?: string;
  id?: string;
  name?: string;
  required?: boolean;
  autoFocus?: boolean;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  minLength?: number;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  max?: number;
  min?: number;
  step?: number | 'any';
}
