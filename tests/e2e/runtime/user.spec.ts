import { test, expect } from "../playwright-test";
import { SignInBasicWidget } from "../maps/signin-basic";
import { ProfileWidget } from "../maps/profile";
import { HomePageWidget } from "../maps/home";
import { SignupBasicWidget } from "../maps/signup-basic";
import { Templating } from "../../templating";
import { UserSignUp } from "../../mocks/collection/userSignUp";
import { ValidationWidget } from "../maps/validation";

test.describe("user-sign-in", async () => {
    test("user-can-sign-in-with-basic-credentials @main", async function ({ page, configuration, cleanUp, mockedData, userService, testRunner }) {
        const userInfo = UserSignUp.getRandomUser("user1");

        async function populateData(): Promise<any> {
            mockedData.data = Templating.updateTemplate(configuration['isLocalRun'], JSON.stringify(mockedData.data), userInfo);
            await userService.putUser("users/" + userInfo.publicId, userInfo.getRequestContract());
            cleanUp.push(async () => userService.deleteUser("users/" + userInfo.publicId, true));
        }

        async function validate() {
            const signInWidget = new SignInBasicWidget(page, configuration);
            const homePageWidget = new HomePageWidget(page);

            await signInWidget.signInWithBasic(userInfo);
            await homePageWidget.waitRuntimeInit();
            await page.close();
        }

        await testRunner.runTest(validate, populateData, mockedData.data);
    });


    test("user-can-visit-his-profile-page @main", async ({ page, configuration, cleanUp, mockedData, userService, testRunner }) => {
        const userInfo = UserSignUp.getRandomUser("user1");
        mockedData.data = Templating.updateTemplate(configuration['isLocalRun'], JSON.stringify(mockedData.data), userInfo);

        async function populateData(): Promise<any> {
            await userService.putUser("users/" + userInfo.publicId, userInfo.getRequestContract());
            cleanUp.push(async () => userService.deleteUser("users/" + userInfo.publicId, true));
        }

        async function validate() {
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

    test("user can close his account @test", async ({ page, configuration, cleanUp, mockedData, userService, testRunner }) => {
        const userInfo = UserSignUp.getRandomUser("user1");
        mockedData.data = Templating.updateTemplate(configuration['isLocalRun'], JSON.stringify(mockedData.data), userInfo);

        async function populateData(): Promise<any> {
            await userService.putUser("users/" + userInfo.publicId, userInfo.getRequestContract());
            cleanUp.push(async () => userService.deleteUser("users/" + userInfo.publicId, true));
        }

        async function validate() {
            const signInWidget = new SignInBasicWidget(page, configuration);
            const homePageWidget = new HomePageWidget(page);
            await signInWidget.signInWithBasic(userInfo);
            await homePageWidget.waitRuntimeInit();

            await page.goto(configuration['urls']['profile'], { waitUntil: 'domcontentloaded' });
            const profileWidget = new ProfileWidget(page);
            await profileWidget.waitRuntimeInit();

            page.on('dialog', dialog => {
                expect(dialog.message()).toBe(`Dear ${userInfo.firstName} ${userInfo.lastName}, \nYou are about to close your account associated with email address ${userInfo.email}.\nYou will not be able to sign in to or restore your closed account. Are you sure you want to close your account?`);
                dialog.accept();
            });

            await profileWidget.closeAccount();

            // after successful account deletion, user should be redirected to the home page
            await homePageWidget.waitRuntimeInit();

            // check that sign in fails with the same credentials
            await signInWidget.signInWithBasic(userInfo);
            const validationWidget = new ValidationWidget(page);
            await validationWidget.waitRuntimeInit();
            expect((await validationWidget.getValidationSummaryErrors()).length).toBe(1);
            expect((await validationWidget.getValidationSummaryErrors())[0]).toBe("Please provide a valid email and password.");
        }

        await testRunner.runTest(validate, populateData, mockedData.data);
    });

    test.skip("user-can-sign-up-with-basic-credentials @main", async ({ page, configuration, cleanUp, mockedData, userService, testRunner }) => {
        const userInfo = UserSignUp.getRandomUser("user1");

        async function populateData(): Promise<any> {
            cleanUp.push(async () => userService.deleteUser("users/" + userInfo.publicId, true));
        }

        async function validate() {
            await page.goto(configuration['urls']['signup']);

            await page.waitForTimeout(5000);
            const signUpWidget = new SignupBasicWidget(page);
            await signUpWidget.signUpWithBasic(userInfo);
            expect(await signUpWidget.getConfirmationMessageValue()).toBe("Follow the instructions from the email to verify your account.")
        }

        await testRunner.runTest(validate, populateData, mockedData.data);
    });

    test.skip("Visitor can validate the forgot password feature without enter captcha @main", async ({ page, configuration, cleanUp, mockedData, userService, testRunner }) => {
        const userInfo = UserSignUp.getRandomUser("user1");

        async function populateData(): Promise<any> {
            cleanUp.push(async () => userService.deleteUser("users/" + userInfo.publicId, true));
        }

        async function validate() {
            await page.goto(configuration['urls']['signin']);

            await page.waitForTimeout(5000);
            const signInWidget = new SignInBasicWidget(page, configuration);
            signInWidget.clickLinkOnForgotYourPassword();
            await signInWidget.requestForPasswordReset(userInfo);
            const validationsummary = await signInWidget.getValidationMessageValue();
            expect(validationsummary).toContain("Captcha is required.");
        }

        await testRunner.runTest(validate, populateData, mockedData.data);
    });

    test.skip("Visitor can validate the forgot password feature without enter email and captcha @main", async ({ page, configuration, mockedData, testRunner }) => {

        async function populateData(): Promise<any> {}

        async function validate() {
            await page.goto(configuration['urls']['signin']);

            await page.waitForTimeout(5000);
            const signInWidget = new SignInBasicWidget(page, configuration);
            signInWidget.clickLinkOnForgotYourPassword();
            await signInWidget.requestResetButton();
            const validationsummary = await signInWidget.getValidationMessageValue();
            expect(validationsummary).toContain("Email is required.");
            expect(validationsummary).toContain("Captcha is required.");
        }

        await testRunner.runTest(validate, populateData, mockedData.data);
    });
});