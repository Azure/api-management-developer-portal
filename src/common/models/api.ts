export class Api {
    /**
     * Unique API identifier.
     */
    public id: string;

    /**
     * Unique API identifier.
     */
    public name: string;

    /**
     * Display name of API, e.g. "HTTP Bin".
     */
    public displayName?: string;

    /**
     * Description of API.
     */
    public description?: string;

    /**
     * Determines type of API, e.g. "soap".
     */
    public type?: string;

    public typeName?: string;

    constructor(contract?: any) {
        if (!contract) {
            return;
        }

        this.id = contract.id;
        this.name = contract.name;
        this.displayName = contract.displayName;
        this.description = contract.description;
        this.type = contract.type;
    }
}