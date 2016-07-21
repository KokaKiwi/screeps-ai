import City from './city';
import Citizen from './city/citizen';
import CONSTANTS from './constants';
import { Storable } from './store';

const BODY = [WORK, CARRY, MOVE, MOVE];

export default class CreepFactory implements Storable {
    constructor(public city: City) {
    }

    get isSpawning(): boolean { return this.city.spawn.spawning != null; }
    get isWorking(): boolean { return this.isSpawning; }
    get needsToWork(): boolean {
        return this.city.populationCount < CONSTANTS.city.maxPopulation;
    }

    tick() {
        // Check if we need to work
        if (!this.isWorking && this.needsToWork) {
            if (this.city.spawn.canCreateCreep(BODY) == OK) {
                let name = this.city.spawn.createCreep(BODY);
                if (typeof name === 'string') {
                    this.city.createCitizen(name);
                }
            }
        }
    }

    /* Storable */
    save() {
    }

    load() {
    }
}
