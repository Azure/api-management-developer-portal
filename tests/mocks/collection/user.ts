import { UserContract } from "../../../src/contracts/user";
import { UserContract as SmapiUserContract} from "../../models/userContract";
import { TestUtils } from "../../testUtils";
import { Resource } from "./resource";

export class User extends Resource{
    public email: string;
    public publicId: string;
    public firstName: string;
    public lastName: string;
    public password: string;

    public accessToken: string;
    public responseContract: any;
    
    public constructor(testId: string, email: string, publicId: string, firstName: string, lastName: string, password: string){
        super(testId);
        this.email = email;
        this.publicId = publicId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        this.accessToken = TestUtils.getSharedAccessToken(this.publicId, TestUtils.randomIdentifier(), 1);

        this.responseContract = this.getResponseContract();
    }

    public getRequestContract(): SmapiUserContract{
        return {
            properties: {
                email: this.email,
                firstName: this.firstName,
                lastName: this.lastName,
                state: "active",
                password: this.password,
                appType: "developerPortal"
            }
        };
    }

    public getResponseContract(): UserContract{
        return {
            id: this.publicId,
            email: this.email,
            firstName: this.firstName,
            lastName: this.lastName,
            state: "active",
            registrationDate : new Date(),
            note: "",
            identities: [
                {
                    provider: "Basic",
                    id: this.email
                }
            ]
        };
    }

    public static getRandomUser(testId: string){
        var email = `${TestUtils.randomIdentifier(4, false)}@${TestUtils.randomIdentifier(4, false)}.${TestUtils.randomIdentifier(4, false)}`;
        var publicId = `${TestUtils.randomIdentifier(3)}-${TestUtils.randomIdentifier(3)}-${TestUtils.randomIdentifier(3)}`;
        var firstName = TestUtils.randomIdentifier(3);
        var lastName = TestUtils.randomIdentifier(3);
        var password = TestUtils.randomIdentifier(10);
        return new User(testId, email, publicId, firstName, lastName, password);
    }
}
