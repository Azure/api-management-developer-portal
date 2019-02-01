import { TagContract } from "./tag";

export interface ApiTagDescriptionContract {
    /**
     * Example: /apiTagDescriptions/DCD501300701F346BA206320
     */
    id: string;

    /**
     * Example: /apis/echo-api
     */
    apiId: string;

    /**
     * Example: /tags/34CB3A8E1F77FB46BFD268E9
     */
    tagId: string;

    description: string;

    externalDocsDescription: string;

    externalDocsUrl: string;

    tag: TagContract;
}

