import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import { Input, Label, Link, Spinner, Tab, TabList } from "@fluentui/react-components";
import { ImageRegular, Speaker2Regular } from "@fluentui/react-icons";
import { CaptchaData } from "../../../../../models/captchaData";
import { BackendService } from "../../../../../services/backendService";
import { TCaptchaProps } from "./LegacyCaptcha";

type TCaptchaObj = { captchaChallenge?: string; captchaData?: CaptchaData };

enum ECaptchaType {
    visual = "visual",
    audio = "audio",
}

const getCaptchaChallenge = async (
    challengeType: ECaptchaType,
    backendService: BackendService
): Promise<TCaptchaObj> => {
    const challengeData = await backendService.getCaptchaChallenge(challengeType);
    if (challengeData) {
        return {
            captchaChallenge: challengeData.ChallengeString,
            captchaData: {
                challenge: {
                    testCaptchaRequest: {
                        challengeId: challengeData.ChallengeId,
                        inputSolution: undefined,
                    },
                    azureRegion: challengeData.AzureRegion,
                    challengeType: challengeData.ChallengeType,
                },
                solution: undefined,
            },
        };
    } else {
        return {};
    }
};

export const NewCaptcha = ({ backendService, onInitComplete }: TCaptchaProps) => {
    const [working, setWorking] = useState(true);
    const [{ captchaChallenge, captchaData }, setCaptchaObj] = useState<TCaptchaObj>({});
    const [captchaType, setCaptchaType] = useState(ECaptchaType.visual);

    const updateChallengeInput = useCallback((solution: string) => setCaptchaObj(prev => {
        if (!prev?.captchaData?.challenge?.testCaptchaRequest) return prev;

        const next = JSON.parse(JSON.stringify(prev));
        next.captchaData.challenge.testCaptchaRequest.inputSolution = solution;
        return next;
    }), []);

    const generateCaptcha = useCallback(
        (captchaType: ECaptchaType) => {
            updateChallengeInput("");
            setWorking(true);
            return getCaptchaChallenge(captchaType, backendService)
                .then(setCaptchaObj)
                .finally(() => setWorking(false));
        },
        [updateChallengeInput, backendService]
    );

    useEffect(() => {
        generateCaptcha(captchaType);
    }, [generateCaptcha, captchaType]);

    useEffect(() => {
        const captchaValidate = (): "valid" | null => {
            return captchaData?.challenge?.testCaptchaRequest.inputSolution ? "valid" : null;
        }

        const refreshCaptcha = () => generateCaptcha(captchaType);

        onInitComplete(captchaValidate(), refreshCaptcha, captchaData);
    }, [onInitComplete, generateCaptcha, captchaData]);

    return (
        <Stack tokens={{ childrenGap: 20 }}>
            <TabList
                selectedValue={captchaType}
                onTabSelect={(_, { value }) =>
                    setCaptchaType(value as ECaptchaType)
                }
            >
                <Tab icon={<ImageRegular />} value={ECaptchaType.visual}>Visual</Tab>
                <Tab icon={<Speaker2Regular />} value={ECaptchaType.audio}>Audio</Tab>
            </TabList>

            {working ? (
                <Stack.Item style={{ padding: "13px 0" }}>
                    <Spinner label={"Loading captcha"} labelPosition="below" />
                </Stack.Item>
            ) : captchaType === ECaptchaType.visual ? (
                <Stack.Item>
                    <img
                        src={`data:image/png;base64,${captchaChallenge}`}
                        alt="visual challange"
                    />
                </Stack.Item>
            ) : (
                <audio controls>
                    <source
                        src={`data:audio/mp3;base64,${captchaChallenge}`}
                        type="audio/mp3"
                    />
                </audio>
            )}

            <Stack.Item>
                <Link onClick={() => generateCaptcha(captchaType)}>Generate new captcha</Link>
            </Stack.Item>

            <Stack>
                <Label required htmlFor="captchaValue">
                    Enter captcha
                </Label>
                <Input
                    id="captchaValue"
                    placeholder="Enter captcha"
                    type="text"
                    value={captchaData?.challenge?.testCaptchaRequest?.inputSolution ?? ""}
                    onChange={(event) => updateChallengeInput(event.target.value)}
                />
            </Stack>
        </Stack>
    );
};