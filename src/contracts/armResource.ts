export interface ArmResource {
    id?: string;
    type?: string;
    name?: string;
    properties: any;
    sku?: {name: string};
}