export class MenuItem {
    public path?: string;
    public url?: string;

    public constructor(path?: string, url?: string) {
        this.path = path || '';
        this.url = url || '';
    }
}