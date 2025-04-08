import * as fs from "fs";
import { test as base } from '@playwright/test';
import { TestUtils } from '../testUtils';
import { TestApiService } from '../services/testApiService';
import { TestUserService } from '../services/testUserService';
import { TestProductService } from '../services/testProductService';
import { ITestRunner } from '../services/ITestRunner';
import { TestRunnerMock } from '../services/testRunnerMock';
import { TestRunner } from '../services/testRunner';
import { TestProvisionService } from '../services/testProvisionService';

let configurationTest = base.extend<{}, { configuration: Object, cleanUp: Array<Function>, apiService: TestApiService, userService: TestUserService, productService: TestProductService, testRunner: ITestRunner, provisionService: TestProvisionService }>({
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

  provisionService: [async ({}, use) => {
    let provisionService = new TestProvisionService();
    await use(provisionService);
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
    mockedData: async ({ configuration }, use, testInfo) => {
        let mockedData = {};

        if (configuration['isLocalRun']) {
            const testTitle = `${testInfo.titlePath[1]}-${testInfo.titlePath[2]}`;
            const dataToUse = TestUtils.getTestData(testTitle);

            mockedData["data"] = dataToUse;
            mockedData["testName"] = testTitle;
        }

        await use(mockedData);
    },
});

let messages: string[] = [];

test.beforeEach(async ( { cleanUp, page } ) => {
    cleanUp =  [];
    messages = [];

    page.on("console", msg => messages.push(msg.text()));
});

test.afterEach(async ( { page, cleanUp }, testInfo ) => {
    for (const cleanUpFunction of cleanUp) {
        await cleanUpFunction();
    }

    if (testInfo.status === 'failed') {
        const outputPath = testInfo.outputPath(testInfo.title)
        await fs.promises.writeFile(outputPath + ".html", await page.content());
        await fs.promises.writeFile(outputPath + ".txt", messages.join("\n"));
    }
});


export { expect } from '@playwright/test';
