import City from '../city';
import { Storable } from '../store';
import { Role, ROLES } from '../factory/roles';
import HarvesterRole from '../factory/roles/harvester';

export default class Citizen implements Storable {
    role: Role = null;

    constructor(public city: City, public name: string) {
        this.role = new HarvesterRole(this);
    }

    get creep(): Creep { return Game.creeps[this.name]; }
    get isSpawning(): boolean {
        let spawning = this.city.spawn.spawning;
        if (spawning != null) {
            return spawning.name == this.name;
        }
        return false;
    }
    get isSpawned(): boolean { return this.name in Game.creeps; }
    get isDead(): boolean { return !this.isSpawned && !this.isSpawning; }
    get isAlive(): boolean { return !this.isDead && !this.isSpawning; }
    get memory(): any { return this.creep.memory; }

    say(message: string) { this.creep.say(message); }

    tick() {
        if (this.isDead) return;

        if (this.role) {
            this.role.run();
        }
    }

    /* Storable */
    save() {
        if (!this.isSpawned) return;

        if (this.role) {
            this.memory.role = {
                name: this.role.name,
                data: {},
            };

            this.role.save();
        }
    }

    load() {
        if (!this.isSpawned) return;

        if (this.memory.role) {
            let Role = ROLES[this.memory.role.name];
            let role = new Role(this);
            this.role.load();
        }
    }

    cleanup() {
        delete Memory.creeps[this.name];
    }
}
