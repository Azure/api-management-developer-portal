export class TagGroup<TResource> {
    public tag: string;
    public readonly items: TResource[];

    constructor() {
        this.items = [];
    }
}