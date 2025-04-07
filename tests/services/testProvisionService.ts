import { MapiClient } from "../mapiClient";
import { PortalRevisionContract } from "../models/portalRevisionContract";
import { ITestProvisionService } from "./ITestProvisionService";

export class TestProvisionService implements ITestProvisionService{
    private readonly mapiClient: MapiClient;

    constructor() {
        this.mapiClient = MapiClient.Instance;
    }

    public async putPortalRevision(revisionId: string): Promise<any> {
        return await this.mapiClient.put<PortalRevisionContract>(`/portalRevisions/${revisionId}`, undefined, {
            properties: { description: "", isCurrent: true }
        });
    }

    public async getPortalRevision(revisionId: string): Promise<any> {
        return await this.mapiClient.get<PortalRevisionContract>(`/portalRevisions/${revisionId}`, undefined);
    }

    public async isRevisionPublished(revisionId: string): Promise<boolean>{
        let portalRevision = await this.getPortalRevision(revisionId);
        if (portalRevision.properties.status === 'failed') {
            throw new Error(`Portal revision: ${revisionId} failed to publish`);
        }
        return portalRevision.properties.status === 'completed';
    }
}