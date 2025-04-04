import * as _ from "lodash";
import * as Objects from "@paperbits/common/objects";
import { IObjectStorage, Query, Operator, OrderDirection, Page } from "@paperbits/common/persistence";

const pageSize = 50;

/**
 * Static object storage for demo purposes. It stores all the uploaded blobs in memory.
 */
export class StaticObjectStorage implements IObjectStorage {
    private splitter: string = "/";

    constructor(private readonly storageDataObject: Object) { }

    public async addObject(path: string, dataObject: Object): Promise<void> {
        if (path) {
            const pathParts = path.split(this.splitter);
            const mainNode = pathParts[0];

            if (pathParts.length === 1 || (pathParts.length === 2 && !pathParts[1])) {
                this.storageDataObject[mainNode] = dataObject;
            }
            else {
                if (!_.has(this.storageDataObject, mainNode)) {
                    this.storageDataObject[mainNode] = {};
                }
                this.storageDataObject[mainNode][pathParts[1]] = dataObject;
            }
        }
        else {
            Object.keys(dataObject).forEach(prop => {
                const obj = dataObject[prop];
                const pathParts = prop.split(this.splitter);
                const mainNode = pathParts[0];

                if (pathParts.length === 1 || (pathParts.length === 2 && !pathParts[1])) {
                    this.storageDataObject[mainNode] = obj;
                }
                else {
                    if (!_.has(this.storageDataObject, mainNode)) {
                        this.storageDataObject[mainNode] = {};
                    }
                    this.storageDataObject[mainNode][pathParts[1]] = obj;
                }
            });
        }
    }

    public async getObject<T>(path: string): Promise<T> {
        return Objects.getObjectAt(path, this.storageDataObject);
    }

    public async deleteObject(path: string): Promise<void> {
        throw new Error("Not supported.");
    }

    public async updateObject<T>(path: string, dataObject: T): Promise<void> {
        throw new Error("Not supported.");
    }

    public async searchObjects<T>(path: string, query: Query<T>): Promise<Page<T>> {
        const searchObj = Objects.getObjectAt(path, this.storageDataObject);

        if (!searchObj) {
            return { value: [] };
        }

        let collection: any[] = Object.values(searchObj);

        if (query?.filters.length > 0) {
            collection = collection.filter(x => {
                let meetsCriteria = true;

                for (const filter of query.filters) {
                    let left = Objects.getObjectAt<any>(filter.left, x);
                    let right = filter.right;

                    if (left === undefined) {
                        meetsCriteria = false;
                        continue;
                    }

                    if (typeof left === "string") {
                        left = left.toUpperCase();
                    }

                    if (typeof right === "string") {
                        right = right.toUpperCase();
                    }

                    const operator = filter.operator;

                    switch (operator) {
                        case Operator.contains:
                            if (left && !left.includes(right)) {
                                meetsCriteria = false;
                            }
                            break;

                        case Operator.equals:
                            if (left !== right) {
                                meetsCriteria = false;
                            }
                            break;

                        default:
                            throw new Error(`Operator not supported.`);
                    }
                }

                return meetsCriteria;
            });
        }

        if (query?.orderingBy) {
            const property = query.orderingBy;

            collection = collection.sort((x, y) => {
                const a = Objects.getObjectAt<any>(property, x);
                const b = Objects.getObjectAt<any>(property, y);
                const modifier = query.orderDirection === OrderDirection.accending ? 1 : -1;

                if (a > b) {
                    return modifier;
                }

                if (a < b) {
                    return -modifier;
                }

                return 0;
            });
        }

        const value = collection.slice(0, pageSize);

        return new StaticPage(value, collection, pageSize);
    }

    public async saveChanges(delta: Object): Promise<void> {
        throw new Error("Not supported.");
    }

    public async loadData(): Promise<object> {
        throw new Error("Not supported.");
    }
}

class StaticPage<T> implements Page<T> {
    constructor(
        public readonly value: T[],
        private readonly collection: any,
        private readonly skip: number,
    ) {
        if (skip > this.collection.length) {
            this.takeNext = null;
        }
    }

    public async takePrev?(): Promise<Page<T>> {
        throw new Error("Not implemented");
    }

    public async takeNext?(): Promise<Page<T>> {
        const value = this.collection.slice(this.skip, this.skip + pageSize);
        const skipNext = this.skip + pageSize;
        const nextPage = new StaticPage<T>(value, this.collection, skipNext);

        return nextPage;
    }
}