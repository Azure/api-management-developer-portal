import * as React from 'react';
import { Icon, Stack, Text } from '@fluentui/react';
import { lightTheme } from '../themes';

interface ToastNotificationProps {
    title: string,
    description: string
}

export class ToastNotification extends React.Component<ToastNotificationProps, {}> {
    render(): JSX.Element {
        return <>
            <Stack horizontal verticalAlign="center">
                <Icon
                    iconName="SkypeCircleCheck"
                    styles={{ root: { color: lightTheme.callingPalette.green } }}
                />
                <Text styles={{ root: { fontWeight: 'bold', marginLeft: 8 } }}>{this.props.title}</Text>
            </Stack>
            <Text
                block
                styles={{ root: { color: lightTheme.palette.neutralSecondary, marginTop: 5 } }}
            >{this.props.description}</Text>
        </>
    };
}