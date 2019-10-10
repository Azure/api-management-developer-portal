export class TagGroup<TResource> {
    public tag: string;
    public items: TResource[];

    constructor() {
        this.items = [];
    }
}