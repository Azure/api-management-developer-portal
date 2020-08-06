import { ArmResource } from "./armResource";

export interface Hostname extends ArmResource {
    properties: HostnameProperties;
}

export interface HostnameProperties {
    value: string;
}