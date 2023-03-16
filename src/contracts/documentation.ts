import { ArmResource } from "./armResource";
export interface DocumentationProperties {
    title: string;
    content: string;
}

export interface DocumentationContract extends ArmResource {
    properties: DocumentationProperties;
}