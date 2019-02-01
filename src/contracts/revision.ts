export interface RevisionContract {
    apiId: string;

    /**
     * Example: "1"
     */
    apiRevision: string;

    /**
     * Example: "2016-12-01T19:30:35.763"
     */
    createdDateTime: string;

    /**
     * Example: "2016-12-01T19:30:35.763"
     */
    updatedDateTime: string;

    description: string;

    /**
     * Example: "/amazons3;rev=0"
     */
    privateUrl: string;

    isOnline: boolean;

    isCurrent: boolean;
}