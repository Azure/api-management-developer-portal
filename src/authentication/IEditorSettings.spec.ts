import { assert } from 'chai';
import { SettingNames } from '../constants';
import { IEditorSettings } from './IEditorSettings';

describe("IEditorSetting", () => {
    it("Property names should be consistent with constants", () => {
        const expectedConstantProperties = [
            SettingNames.armEndpoint,
            SettingNames.aadClientId,
            SettingNames.aadAuthority
        ];

        const expectedAdditionalProperties = [
            "isArmAuthEnabled"
        ];

        const tempObject: IEditorSettings = {
            isArmAuthEnabled: true,
            editorArmEndpoint: "editorArmEndpoint",
            editorAadAuthority: "editorArmEndpoint",
            editorAadClientId: "editorArmEndpoint"
        };

        const objectProps = Object.keys(tempObject);
        for (const prop of expectedConstantProperties) {
            if (!objectProps.includes(prop)) {
                assert.fail(`Required property "${prop}" is missing.`);
            }
        }

        for (const prop of objectProps) {
            if (!expectedConstantProperties.includes(prop as SettingNames) && !expectedAdditionalProperties.includes(prop)) {
                assert.fail(`Property "${prop}" is not expected.`);
            }
        }
    });
});