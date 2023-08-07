import { Resource } from "./mocks/collection/resource";

export class Templating {
    public static updateTemplate(templateData: string, ...resources: Resource[]): object{
        for(let i = 0; i < resources.length; i++){
            let objectKeys = Object.keys(resources[i]);

            let testId = resources[i].testId;
            
            for (const key of objectKeys) {
                let regex = new RegExp(`"object{{${testId}.${key}}}"`, "g");
                templateData = templateData.replace(regex, JSON.stringify(resources[i][key]));

                let regexString = new RegExp(`{{${testId}.${key}}}`, "g");
                templateData = templateData.replace(regexString, resources[i][key]);
            }
        }
        return JSON.parse(templateData);
    }
}