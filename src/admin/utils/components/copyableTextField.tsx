import * as React from 'react';
import { IconButton, TextField, TooltipDelay, TooltipHost } from '@fluentui/react';

interface CopyableTextFieldState {
    valueCopied: boolean
}

interface CopyableTextFieldProps {
    fieldLabel: string,
    showLabel: boolean,
    copyableValue: string
}

export class CopyableTextField extends React.Component<CopyableTextFieldProps, CopyableTextFieldState> {
    constructor(props: CopyableTextFieldProps) {
        super(props);

        this.state = {
            valueCopied: false
        }
    }

    renderCopyButton = (): JSX.Element => (
        <TooltipHost
            content={this.state.valueCopied ? 'Copied to clipboard!' : `Copy ${this.props.fieldLabel}`}
            id='copytooltip'
            delay={TooltipDelay.zero}
            onTooltipToggle={(isTooltipVisible: boolean) => !isTooltipVisible && this.setState({ valueCopied: false }) }
        >
            <IconButton
                iconProps={{ iconName: 'Copy', styles: { root: { color: '#000' } } }}
                onClick={() => {
                    navigator.clipboard.writeText(this.props.copyableValue);
                    this.setState({ valueCopied: true });
                }}
                styles={{ rootHovered: { backgroundColor: 'transparent' }, rootPressed: { backgroundColor: 'transparent' } }}
                aria-describedby='copytooltip'
            />   
        </TooltipHost>
    )

    render(): JSX.Element {
        return <>
            <TextField
                label={this.props.showLabel && this.props.fieldLabel}
                ariaLabel={this.props.fieldLabel}
                value={this.props.copyableValue}
                onRenderSuffix={() => this.renderCopyButton()}
                styles={{ root: { paddingBottom: 15 } }}
                readOnly
            />
        </>
    };
}