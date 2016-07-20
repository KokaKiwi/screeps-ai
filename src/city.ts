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

    tick() {
        // STEP 1: Tick factory
        this.factory.tick();

        // STEP 2: Tick citizens
        for (let citizen of this.citizens) {
            citizen.tick();
        }
    }

    /* Storable */
    save() {
        this.memory.citizens = _.map(this.citizens, (citizen) => {
            return citizen.name;
        });
    }

    load() {
        let citizens = this.memory.citizens || [];
        for (let name of citizens) {
            let creep = Game.creeps[name];
            let citizen = new Citizen(this, creep);
            citizen.load();
            this.citizens.push(citizen);
        }
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
