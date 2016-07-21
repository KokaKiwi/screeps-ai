import Citizen from './city/citizen';
import CreepFactory from './factory';
import { Storable } from './store';

export default class City implements Storable {
    public factory: CreepFactory;
    public citizens: Citizen[];

    constructor(public spawn: StructureSpawn) {
        this.factory = new CreepFactory(this);
        this.citizens = [];
    }

    get name(): string { return this.spawn.name; }
    get room(): Room { return this.spawn.room; }
    get memory(): any { return this.spawn.memory; }

    get populationCount(): number { return this.citizens.length; }

    tick() {
        // Cleanup dead citizens
        let [deads, alives] = _.partition(this.citizens, (citizen) => citizen.isDead);
        this.citizens = alives;
        for (let dead of deads) {
            dead.cleanup();
        }

        // Tick factory
        this.factory.tick();

        // Tick citizens
        for (let citizen of this.citizens) {
            citizen.tick();
        }
    }

    createCitizen(name: string): Citizen {
        let citizen = new Citizen(this, name);
        this.citizens.push(citizen);
        return citizen;
    }

    /* Storable */
    save() {
        this.memory.citizens = _.map(this.citizens, (citizen) => citizen.name);
        for (let citizen of this.citizens) {
            citizen.save();
        }
        this.factory.save();
    }

    load() {
        let citizens = this.memory.citizens || [];
        for (let name of citizens) {
            let citizen = new Citizen(this, name);
            citizen.load();
            this.citizens.push(citizen);
        }

        this.factory.load();
    }

    /* Statics */
    static cities: City[];

    static init() {
        City.cities = [];

        for (let spawnName in Game.spawns) {
            let spawn = Game.spawns[spawnName];
            let city = new City(spawn);
            city.load();
            City.cities.push(city);
        }
    }

    static getByName(name: string): City {
        for (let city of City.cities) {
            if (city.name == name) {
                return city;
            }
        }

        return null;
    }
}
