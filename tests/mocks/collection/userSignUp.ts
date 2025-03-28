import { TestUtils } from "../../testUtils";
import { User } from "./user";

export class UserSignUp extends User {
    public confirmPassword: string;

    public constructor(testId: string, email: string, publicId: string, firstName: string, lastName: string, password: string, confirmPassword: string) {
        super(testId, email, publicId, firstName, lastName, password);
        this.confirmPassword = confirmPassword;
    }

    public static getRandomUser(testId: string): UserSignUp {
        var email = `${TestUtils.randomIdentifier(4, false)}@${TestUtils.randomIdentifier(4, false)}.${TestUtils.randomIdentifier(4, false)}`;
        var publicId = `${TestUtils.randomIdentifier(3)}-${TestUtils.randomIdentifier(3)}-${TestUtils.randomIdentifier(3)}`;
        var firstName = TestUtils.randomIdentifier(3);
        var lastName = TestUtils.randomIdentifier(3);
        var password = TestUtils.randomIdentifier(10);
        return new UserSignUp(testId, email, publicId, firstName, lastName, password, password);
    }
}