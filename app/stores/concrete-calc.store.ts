import { makeAutoObservable } from 'mobx';
import { fetchFunction } from '../utils/fetch';
import { SettingsType } from '../models/adminDataTypes';

class ConcreteCalcStore {
    settings: SettingsType[] = [];
    constructor() {
        makeAutoObservable(this);
    }

    fetchConcreteCalcSettings(data: SettingsType[]) {
        this.settings = data;
    }
}
export default new ConcreteCalcStore();
