import { expect } from 'chai';
import * as mock from 'sinon';4
import { MediaContract } from "@paperbits/common/media";
import { ApimMediaService } from './apimMediaService';
import { ConsoleLogger } from '@paperbits/common/logging';
import { fail } from 'assert';
import { ISettingsProvider } from '@paperbits/common/configuration/ISettingsProvider';

const sandbox = mock.createSandbox();

describe('ApimMediaService', () => {
  let service: ApimMediaService;

  let httpClientMock: any;
  let viewManagerMock: any;
  let authenticatorMock: any;
  let armServiceMock: any;
  let settingsProviderMock: any;
  const logger = new ConsoleLogger();

  beforeEach(() => {
    global.location = <any>{ href: "https://contoso.com" };

    httpClientMock = {
      send: () => Promise.resolve({ statusCode: 200, toObject: () => [{}] })
    };

    authenticatorMock = {
      getAccessToken: () => Promise.resolve("test_token")
    };

    armServiceMock = {
      getTenantArmUriAsync: (uri: any) => Promise.resolve("test_uri")
    };

    viewManagerMock = {
        notifyError: () => {}
    };

    settingsProviderMock = {
        // Implement the necessary methods for the settings provider
        getSetting: async (settingName: string) => null // Return null for all settings to simulate missing parameters
    };

    service = new ApimMediaService(
        viewManagerMock,
        armServiceMock,
        authenticatorMock,
        httpClientMock,
        armServiceMock,
        settingsProviderMock,
        logger
    );
  });

  afterEach(() => {
    sandbox.restore();
 });

  it('Create media - should send upload request.', async () => {
    const resultBlobKey = "test_blob_key";
    sandbox.stub(httpClientMock, "send").resolves({ statusCode: 200, toObject: () => [ <MediaContract>{ blobKey: resultBlobKey }] });

    const mediaContract: MediaContract = await service.createMedia('test_name', new Uint8Array(), 'test_type');

    expect(mediaContract).to.not.be.null;
    expect(mediaContract.blobKey).to.equal(resultBlobKey);
  });

  it('Create media - should show error messages. ', async () => {
    const viewManagerStub = sandbox.stub(viewManagerMock, "notifyError")
        .returns(Promise.resolve());

    sandbox.stub(httpClientMock, "send").resolves({ statusCode: 400, body: new TextEncoder().encode(JSON.stringify({ message: "Test error message" })) });

    try {
        await service.createMedia('test_name', new Uint8Array(), 'test_type');
        fail("Error was expected");
    } catch (error) {
        expect(error).to.not.be.null;
        expect(viewManagerStub.calledOnce).to.be.true;
    }
  });
});