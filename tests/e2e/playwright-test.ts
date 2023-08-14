import { test as base } from '@playwright/test';
import { TestUtils } from '../testUtils';
import { TestApiService } from '../services/testApiService';
import { TestUserService } from '../services/testUserService';
import { TestProductService } from '../services/testProductService';
import { ITestRunner } from '../services/ITestRunner';
import { TestRunnerMock } from '../services/testRunnerMock';
import { TestRunner } from '../services/testRunner';

let configurationTest = base.extend<{}, { configuration: Object, cleanUp: Array<Function>, apiService: TestApiService, userService: TestUserService, productService: TestProductService, testRunner: ITestRunner }>({
  configuration: [async ({}, use) => {
    let configuration = {};
    configuration = await TestUtils.getConfigAsync();
    await use(configuration);
  }, { scope: 'worker' }],
  
  testRunner: [async ({}, use) => {
    let testRunner: ITestRunner;
    if (!(await TestUtils.IsLocalEnv())){
        testRunner = new TestRunner();
    }else{
        testRunner = new TestRunnerMock();
    }
    await use(testRunner);
  }, { scope: 'worker' }],

  apiService: [async ({}, use) => {
    let apiService = new TestApiService();
    await use(apiService);
  }, { scope: 'worker' }],

  productService: [async ({}, use) => {
    let productService = new TestProductService();
    await use(productService);
  }, { scope: 'worker' }],

  userService: [async ({}, use) => {
    let userService = new TestUserService();
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
        var dataToUse = TestUtils.getTestData(testTitle);
        let mockedData = {};
        mockedData["data"] = dataToUse;
        mockedData["testName"] = testTitle;
        await use(mockedData);
    },
});

test.beforeEach(async ( { cleanUp } ) => {
    cleanUp =  [];
});

test.afterEach(async ( { cleanUp } ) => {
    for (const cleanUpFunction of cleanUp) {
        await cleanUpFunction();
    }
});


export { expect } from '@playwright/test';