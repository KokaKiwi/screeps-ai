export interface Storable {
    save();
    load();
    cleanup?();
}
