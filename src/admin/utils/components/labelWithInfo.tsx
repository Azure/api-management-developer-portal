import * as React from 'react';
import { DirectionalHint, Icon, Stack, Text, TooltipDelay, TooltipHost } from '@fluentui/react';

interface LabelWithInfoProps {
    label: string,
    info: string
}

export class LabelWithInfo extends React.Component<LabelWithInfoProps, {}> {
    constructor(props: LabelWithInfoProps) {
        super(props);
    }

    render() {
        return <>
            <Stack horizontal verticalAlign="center" styles={{ root: { padding: '5px 0' } }}>
                <Text styles={{ root: { fontWeight: 600 } }}>{this.props.label}</Text>
                <TooltipHost
                    id={this.props.label}
                    content={this.props.info}
                    directionalHint={DirectionalHint.rightCenter}
                    delay={TooltipDelay.zero}
                    styles={{ root: { display: 'flex', marginLeft: 5 } }}
                >
                    <Icon
                        iconName="Info"
                        styles={{ root: { cursor: 'pointer' } }}
                        aria-describedby={this.props.label}
                    />
                </TooltipHost>
            </Stack>
        </>
    };
}