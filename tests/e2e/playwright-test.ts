import { test as base } from '@playwright/test';
import { Utils } from '../utils';
import { ApiService } from '../services/apiService';
import { UserService } from '../services/userService';
import { ProductService } from '../services/productService';
import { ITestRunner } from '../services/ITestRunner';
import { TestRunnerMock } from '../services/testRunnerMock';
import { TestRunner } from '../services/testRunner';

let configurationTest = base.extend<{}, { configuration: Object, cleanUp: Array<Function>, apiService: ApiService, userService: UserService, productService: ProductService, testRunner: ITestRunner }>({
  configuration: [async ({}, use) => {
    let configuration = {};
    configuration = await Utils.getConfigAsync();
    await use(configuration);
  }, { scope: 'worker' }],
  
  testRunner: [async ({}, use) => {
    let testRunner: ITestRunner;
    if (!(await Utils.IsLocalEnv())){
        testRunner = new TestRunner();
    }else{
        testRunner = new TestRunnerMock();
    }
    await use(testRunner);
  }, { scope: 'worker' }],

  apiService: [async ({}, use) => {
    let apiService = new ApiService();
    await use(apiService);
  }, { scope: 'worker' }],

  productService: [async ({}, use) => {
    let productService = new ProductService();
    await use(productService);
  }, { scope: 'worker' }],

  userService: [async ({}, use) => {
    let userService = new UserService();
    await use(userService);
  }, { scope: 'worker' }],

  cleanUp: [async ({}, use) => {
    let cleanUp: Array<Function> = [];
    await use(cleanUp);
  }, { scope: 'worker' }],

  page: async ({ page }, use) => {
    page.on("console", (message) => {
        if(message.type() === "error"){
            console.error(message.text());
        }
    });
    await use(page);
  },
});


export const test = configurationTest.extend({
    mockedData: async ({ }, use, testInfo) => {
        let testTitle = `${testInfo.titlePath[1]}-${testInfo.titlePath[2]}`;
        var dataToUse = Utils.getTestData(testTitle);
        let mockedData = {};
        mockedData["data"] = dataToUse;
        mockedData["testName"] = testTitle;
        await use(mockedData);
    },
});

test.beforeEach(async ( { cleanUp } ) => {
    console.log("initializing clean up functions");
    cleanUp =  [];
});

test.afterEach(async ( { cleanUp } ) => {
    console.log("amount of clean up functions: " + cleanUp.length);
    for (const cleanUpFunction of cleanUp) {
        await cleanUpFunction();
    }
});


export { expect } from '@playwright/test';