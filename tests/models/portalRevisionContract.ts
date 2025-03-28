export interface PortalRevisionContract {
    properties: PortalRevisionProperties;
}

export interface PortalRevisionProperties{
    /**
        * Portal revision description.
        */
    description?: string;

    /**
    * Status of the revision.
    */
    status?: string;

    /**
     * Is current published reviosion of the portal.
     */
    isCurrent?: boolean;
}