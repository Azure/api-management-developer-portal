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

        const settingKeys: IEditorSettings = {
            armEndpoint: "armEndpoint",
            tenantId: "tenantId",
            clientId: "clientId"
        };

        const objectProps = Object.keys(settingKeys);
        for (const prop of expectedConstantProperties) {
            if (!objectProps.includes(prop)) {
                assert.fail(`Required property "${prop}" is missing.`);
            }
        }

        for (const prop of objectProps) {
            if (!expectedConstantProperties.includes(prop as SettingNames)) {
                assert.fail(`Property "${prop}" is not expected.`);
            }
        }
    });
});