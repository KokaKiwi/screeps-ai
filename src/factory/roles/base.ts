import { Storable } from '../../store';

interface Role extends Storable {
    name: string;

    run();
}

export default Role
