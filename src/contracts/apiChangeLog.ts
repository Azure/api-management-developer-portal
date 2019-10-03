import { ArmResource } from "./armResource";

/**
 *  Contract of API change log's property
 */
export interface ChangeLogPropertyContract {

    /**
     *  The date when this API change log is created
     */
    createdDateTime?: string;

    /**
     *  The date when this API change log is edited and updated
     */
    updatedDateTime?: string;

    /**
     *  The notes of this API change
     */
    notes?: string;
}

/**
 *  Contract of API change log
 */
export interface ChangeLogContract extends ArmResource {
    properties: ChangeLogPropertyContract;
}