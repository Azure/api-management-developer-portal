import { ArmResource } from "./armResource";

export interface ChangeLogPropertyContract {
    createdDateTime?: string;
    updatedDateTime?: string;
    notes?: string;
}

export interface ChangeLogContract extends ArmResource {
    properties: ChangeLogPropertyContract;
}