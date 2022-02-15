export default interface IStaticDataProvider {
    getStaticData(objectType: string): Promise<any>;
}