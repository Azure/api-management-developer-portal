import { PortalRevisionContract } from "../models/portalRevisionContract";

export interface ITestProvisionService {
    putPortalRevision(revisionId: string): Promise<PortalRevisionContract>;
    getPortalRevision(revisionId: string): Promise<PortalRevisionContract>;
    isRevisionPublished(revisionId: string): Promise<boolean>;
}