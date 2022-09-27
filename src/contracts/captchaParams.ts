/**
 * Contract of HipCaptcha params 
 */

export interface CaptchaParams {
    HipUrl: string;
    EncryptedFlowId: string;
}

/**
 * Captcha settings
 */
export interface CaptchaSettings {
    /**
     * True if new captcha endpoint is set
     */
    captchaEnabled: boolean;
    
     /**
     * True if legacy captcha endpoint is set
     */
    legacyCaptchaEnabled: boolean;

    /**
     * True if captcha service by pass allowed
     */
    skipCaptcha: boolean;
}

export interface CaptchaChallenge {
    /** 
     * Challenge ID, e.g.  "0520f064-e1bd-4784-bd8e-17816b720859"
     */
    ChallengeId: string;

    /**
     * Azure region name, e.g. "EastUS2"
     */
    AzureRegion: string;

    /**
     * Challenge string in base64
     */
    ChallengeString: string;

    /**
     * Challenge type, can be "audio" or "visual"
     */
    ChallengeType: string;
}

export interface CaptchaChallengeRequest {
    testCaptchaRequest: {
        challengeId: string;
        inputSolution: string;
    };

    azureRegion: string;
    challengeType: string;
}
