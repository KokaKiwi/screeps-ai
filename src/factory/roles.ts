import Citizen from '../city/citizen';
import Role from './roles/base';
import HarvesterRole from './roles/harvester';

interface RoleConstructor {
    new(citizen: Citizen): Role;
}

const ROLES = {
    'harvester': HarvesterRole,
};

export { Role, ROLES }
