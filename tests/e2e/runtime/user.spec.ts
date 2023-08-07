import { test, expect } from "../playwright-test";
import { SignInBasicWidget } from "../maps/signin-basic";
import { ProfileWidget } from "../maps/profile";
import { HomePageWidget } from "../maps/home";
import { SignupBasicWidget } from "../maps/signup-basic";
import { User } from "../../mocks/collection/user";
import { Templating } from "../../templating";

test.describe("user-sign-in", async () => {
    test("user-can-sign-in-with-basic-credentials", async function ({page, configuration, cleanUp, mockedData, userService, testRunner})  {
        var userInfo = User.getRandomUser("user1");
        mockedData.data = Templating.updateTemplate(JSON.stringify(mockedData.data), userInfo);

        async function populateData(): Promise<any>{
            await userService.putUser("users/"+userInfo.publicId, userInfo.getRequestContract());
            cleanUp.push(async () => userService.deleteUser("users/"+userInfo.publicId, true));
        }
        
        async function validate(){
            const signInWidget = new SignInBasicWidget(page, configuration);
            const homePageWidget = new HomePageWidget(page);

            await signInWidget.signInWithBasic(userInfo);
            await homePageWidget.waitRuntimeInit();
            await page.close();
        }

        await testRunner.runTest(validate, populateData, mockedData.data);
    });


    test("user-can-visit-his-profile-page", async ({page, configuration, cleanUp, mockedData, userService, testRunner}) => {
        var userInfo = User.getRandomUser("user1");
        mockedData.data = Templating.updateTemplate(JSON.stringify(mockedData.data), userInfo);

        async function populateData(): Promise<any>{
            await userService.putUser("users/"+userInfo.publicId, userInfo.getRequestContract());
            cleanUp.push(async () => userService.deleteUser("users/"+userInfo.publicId, true));
        }
        
        async function validate(){
            const signInWidget = new SignInBasicWidget(page, configuration);
            const homePageWidget = new HomePageWidget(page);

            await signInWidget.signInWithBasic(userInfo);
            await homePageWidget.waitRuntimeInit();

            await page.goto(configuration['urls']['profile'], { waitUntil: 'domcontentloaded' });

            const profileWidget = new ProfileWidget(page);
            await profileWidget.waitRuntimeInit();

            expect(await profileWidget.getUserEmail()).toBe(userInfo.email);
        }

        await testRunner.runTest(validate, populateData, mockedData.data);
    });


    test.skip("user-can-sign-up-with-basic-credentials", async ({page, configuration, cleanUp, mockedData, userService, testRunner}) => {
        var userInfo = User.getRandomUser("user1");

        async function populateData(): Promise<any>{
            cleanUp.push(async () => userService.deleteUser("users/"+userInfo.publicId, true));
        }

        async function validate(){
            await page.goto(configuration['urls']['signup']);
            
            await page.waitForTimeout(5000);
            const signUpWidget = new SignupBasicWidget(page);
            await signUpWidget.signUpWithBasic(userInfo);
            expect(await signUpWidget.getConfirmationMessageValue()).toBe("Follow the instructions from the email to verify your account.")
        }

        await testRunner.runTest(validate, populateData, mockedData.data);
    });
});