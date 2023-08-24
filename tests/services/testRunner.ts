import { ITestRunner } from "./ITestRunner";
export class TestRunner implements ITestRunner {
    public runTest(validate: () => Promise<void>, populateData: () => Promise<void>, testName: string ): Promise<void> {
        return new Promise((resolve, reject) => {
            populateData().then(() => {    
                validate().then(() => {
                    resolve();
                }).catch((err) => {
                    reject(err);
                });
            }).catch((err) => {
                reject(err);
            });
       });
    }
}