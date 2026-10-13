import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Stack } from "@fluentui/react";
import { CaptchaData } from "../../../../../models/captchaData";
import { BackendService } from "../../../../../services/backendService";
import { TCaptchaProps } from "./LegacyCaptcha";

import "altcha";

type TPowCaptchaValueData = CaptchaData & {
    powChallenge?: { solution: string };
};

type TCaptchaObj = {
    powChallengeRequest?: object;
    captchaData?: TPowCaptchaValueData;
};

const getCaptchaChallenge = async (
    backendService: BackendService
): Promise<TCaptchaObj> => {
    const challengeData = await backendService.getPowCaptchaChallenge();
    if (challengeData) {
        return {
            powChallengeRequest: challengeData,
            captchaData: {
                challenge: undefined,
                solution: undefined,
                powChallenge: {
                    solution: undefined
                }
            }
        };
    } else {
        return {};
    }
};

export const PowCaptcha = ({ backendService, onInitComplete }: TCaptchaProps) => {
    const [{ powChallengeRequest, captchaData }, setCaptchaObj] = useState<TCaptchaObj>({});

    const updateChallengeInput = useCallback((solution: string) => setCaptchaObj(prev => {
        if (!prev?.captchaData?.powChallenge)
            return prev;

        const next = JSON.parse(JSON.stringify(prev));
        next.captchaData.powChallenge.solution = solution;
        return next;
    }), []);

    const generateCaptcha = useCallback(
        () => {
            updateChallengeInput("");
            return getCaptchaChallenge(backendService).then(setCaptchaObj);
        },
        [updateChallengeInput, backendService]
    );

    useEffect(() => {
        generateCaptcha();
    }, [generateCaptcha]);

    useEffect(() => {
        const captchaValidate = (): "valid" | null => {
            return captchaData?.powChallenge?.solution ? "valid" : null;
        };

        onInitComplete(captchaValidate(), generateCaptcha, captchaData);
    }, [onInitComplete, generateCaptcha, captchaData]);

    const widgetRef = useRef<AltchaWidget & AltchaWidgetMethods & HTMLElement>(null);

    useEffect(() => {
        const handleStateChange = (ev: Event | CustomEvent) => {
            if ("detail" in ev) {
                updateChallengeInput(ev.detail.payload || "");
            }
        };

        const { current } = widgetRef;

        if (current) {
            current.addEventListener("statechange", handleStateChange);
            return () => current.removeEventListener("statechange", handleStateChange);
        }
    }, [updateChallengeInput]);

    return (
        <>
            <Stack className="form-group">
                <altcha-widget
                    ref={widgetRef}
                    challengejson={JSON.stringify(powChallengeRequest)}
                    hidelogo={true}
                    hidefooter={true}
                    name="powPayload"
                ></altcha-widget>
            </Stack>
        </>
    );
};
