export interface Validator {
    name: string;
    validator: any;
    message: string;
}

export interface Field {
    name?: string;
    label?: string;
    inputType?: string;
    type: string;
    value?: any;
    options?: string[];
    validations?: Validator[];
}