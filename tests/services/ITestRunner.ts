export interface ITestRunner {
    runTest(...args: any): Promise<void>;
}