import City from '../city';
import { Storable } from '../store';

export default class Citizen implements Storable {
    constructor(public city: City, public creep: Creep) {
    }

    get name(): string { return this.creep.name; }

    tick() {
    }

    /* Storable */
    save() {
    }

    load() {
    }
}
