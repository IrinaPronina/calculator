export interface radioTypes {
    size?: 32;
    value: string;
    checked: string;
    id: string;
    name?: string;
    groupName?: string;
    disabled?: boolean;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}
