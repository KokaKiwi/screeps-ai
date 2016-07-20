import City from './city';

City.init();

export function loop() {
    /* Tick */
    for (let city of City.cities) {
        city.tick();
    }

    /* Save changes */
    for (let city of City.cities) {
        city.save();
    }
}
