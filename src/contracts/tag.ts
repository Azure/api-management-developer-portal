import { ArmResource } from "./armResource";

export interface TagProperties {
    displayName: string;
}

export interface TagContract extends ArmResource {
    properties: TagProperties;
}