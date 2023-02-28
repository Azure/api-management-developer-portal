import * as React from 'react';
import { IIconProps } from '@fluentui/react';
import { ActionButton } from '@fluentui/react/lib/Button';

const backIcon: IIconProps = { iconName: 'ChevronLeftMed' };

interface BackButtonProps {
    onClick: () => void
}

export class BackButton extends React.Component<BackButtonProps, {}> {
    constructor(props: BackButtonProps) {
        super(props);
    }

    render() {
        return <>
            <ActionButton
                iconProps={backIcon}
                text="Back"
                styles={{ root: { height: 44 } }}
                onClick={this.props.onClick}
            />
        </>
    };
}