import Citizen from '../../city/citizen';
import { Role } from '../roles';

class HarvesterRole implements Role {
    name = 'harvester';

    constructor(private citizen: Citizen) {
    }

    run() {
        let needEnergy = this.citizen.creep.carry[RESOURCE_ENERGY] < this.citizen.creep.carryCapacity;
        if (needEnergy) {
            let source = this.citizen.creep.pos.findClosestByPath(FIND_SOURCES) as Source;
            if (this.citizen.creep.pos.inRangeTo(source.pos, 1)) {
                this.citizen.creep.harvest(source);
            } else {
                this.citizen.creep.moveTo(source);
            }
        } else {
            let spawn = this.citizen.city.spawn;
            if (this.citizen.creep.pos.inRangeTo(spawn.pos, 1)) {
                this.citizen.creep.transfer(spawn, RESOURCE_ENERGY);
            } else {
                this.citizen.creep.moveTo(spawn);
            }
        }
    }

    save() {
    }

    load() {
    }
}

export default HarvesterRole
