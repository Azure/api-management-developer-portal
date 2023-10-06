import * as React from 'react';
import { CommandBarButton, IIconProps } from '@fluentui/react';

const backIcon: IIconProps = { iconName: 'ChevronLeftMed' };

interface BackButtonProps {
    onClick: () => void
}

export class BackButton extends React.Component<BackButtonProps, {}> {
    render(): JSX.Element {
        return <>
            <CommandBarButton
                iconProps={backIcon}
                text="Back"
                className="nav-item-list-button"
                onClick={this.props.onClick}
            />
        </>
    };
}