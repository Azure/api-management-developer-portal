import { TestUtils } from "../testUtils";
import { ITestRunner } from "./ITestRunner";

export class TestRunnerMock implements ITestRunner {
    public  runTest(validate: () => Promise<void>, populateData: () => Promise<void>, data: object ): Promise<void> {
        return new Promise(async (resolve, reject) => {
            
            let server = TestUtils.createMockServer(data);
            let error = undefined;
            server.on("ready", () => {
                validate().then(() => {
                    console.log("validation done");
                    resolve();
                }).catch((err) => {
                    error = err;
                    reject(err);
                    console.log("server error");
                }).finally(() => {
                    server.close();
                    console.log("server closed");
                });
            });

            server.on("close", () => {
                if (error != undefined){
                    reject(error);
                } else {
                    resolve();
                }
            });

            server.listen(8181,"127.0.0.1", function(){
                console.log("server started");
                server.emit("ready");
            });
       });
    }
}