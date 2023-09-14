import { ArmResource } from "./armResource";

export interface WikiProperties{
    documents: WikiDocumentationContract[];
}

export interface WikiDocumentationContract {
    documentationId: string;
}

export interface WikiContract extends ArmResource {
    properties: WikiProperties;
}