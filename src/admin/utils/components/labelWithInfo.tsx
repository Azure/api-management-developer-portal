import * as React from 'react';
import { DirectionalHint, IconButton, Stack, Text, TooltipDelay, TooltipHost } from '@fluentui/react';
import { lightTheme } from '../themes';

interface LabelWithInfoProps {
    label: string,
    info: string,
    required?: boolean
}

export class LabelWithInfo extends React.Component<LabelWithInfoProps, {}> {
    render(): JSX.Element {
        return <>
            <Stack horizontal verticalAlign="center" styles={{ root: { padding: '5px 0' } }}>
                <Text styles={{ root: { fontWeight: 600 } }}>{this.props.label}</Text>
                {this.props.required && <Text styles={{ root: { color: lightTheme.semanticColors.errorText, fontWeight: 600, paddingLeft: 4 } }}>*</Text>}
                <TooltipHost
                    id={this.props.label}
                    content={this.props.info}
                    directionalHint={DirectionalHint.rightCenter}
                    delay={TooltipDelay.zero}
                    styles={{ root: { display: 'flex', marginLeft: 5 } }}
                >
                    <IconButton
                        iconProps={{ iconName: 'Info' }}
                        aria-describedby={this.props.label}
                        styles={{ root: { color: 'grey', width: 16, height: 16 }, icon: { fontSize: 14, height: 14 } }}
                    />
                </TooltipHost>
            </Stack>
        </>
    };
}