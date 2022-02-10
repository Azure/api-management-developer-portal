export interface IStaticDataProvider {
    getStaticData(objectType: string): Promise<any>;
}