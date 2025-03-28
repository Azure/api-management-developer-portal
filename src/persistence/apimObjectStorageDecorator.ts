import { IObjectStorage, Query, Page } from "@paperbits/common/persistence";
import { IObjectContractVisitor } from "./contractVisitors/objectContractVisitor";

export class ApimObjectStorageDecorator implements IObjectStorage {
    constructor(
        private readonly objectStorage: IObjectStorage,
        private readonly objectContractVisitors: IObjectContractVisitor[]
    ) { }

    public addObject<T>(key: string, dataObject: T, changeDescription?: string): Promise<void> {
        return this.objectStorage.addObject(key, dataObject, changeDescription);
    }

    public async getObject<T>(key: string): Promise<T> {
        const result = await this.objectStorage.getObject<T>(key);
        for (const visitor of this.objectContractVisitors) {
            visitor.visit(result);
        }
        return result;
    }

    public deleteObject(key: string, changeDescription?: string): Promise<void> {
        return this.objectStorage.deleteObject(key, changeDescription);
    }

    public updateObject<T>(key: string, dataObject: T, changeDescription?: string): Promise<void> {
        for (const visitor of this.objectContractVisitors) {
            visitor.visit(dataObject);
        }
        return this.objectStorage.updateObject<T>(key, dataObject, changeDescription);
    }

    public async searchObjects<T>(key: string, query?: Query<T>): Promise<Page<T>> {
        const results = await this.objectStorage.searchObjects<T>(key, query);
        for (const result of results?.value ?? []) {
            for (const visitor of this.objectContractVisitors) {
                visitor.visit(result);
            }
        }
        return results;
    }

    public saveChanges?(delta: Object): Promise<void> {
        return this.objectStorage.saveChanges(delta);
    }

    public loadData?(): Promise<object> {
        return this.objectStorage.loadData();
    }
}