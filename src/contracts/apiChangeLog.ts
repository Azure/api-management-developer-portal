/**
 *  Contract of API change log
 */
export interface ChangeLogContract {

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