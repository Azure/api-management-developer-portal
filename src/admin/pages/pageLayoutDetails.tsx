import * as React from 'react';
import { ILayoutService, LayoutContract } from '@paperbits/common/layouts';
import { Resolve } from '@paperbits/react/decorators';
import { IIconProps, Stack } from '@fluentui/react';
import { TextField } from '@fluentui/react/lib/TextField';
import { CommandBarButton } from '@fluentui/react/lib/Button';
import { BackButton } from '../utils/components/backButton';
import { DeleteConfirmationOverlay } from '../utils/components/deleteConfirmationOverlay';

interface PageLayoutState {
    layout: LayoutContract,
    showDeleteConfirmation: boolean
}

interface PageLayoutProps {
    layout: LayoutContract,
    onBackButtonClick: () => void
}

const deleteIcon: IIconProps = { iconName: 'Delete' };
const copyIcon: IIconProps = { iconName: 'Copy' };

export class PageLayoutDetails extends React.Component<PageLayoutProps, PageLayoutState> {
    @Resolve('layoutService')
    public layoutService: ILayoutService;

    constructor(props: PageLayoutProps) {
        super(props);

        this.state = {
            layout: this.props.layout,
            showDeleteConfirmation: false
        }
    }

    onInputChange = async (field: string, newValue: string) => {
        this.setState({
            layout: {
                ...this.state.layout,
                [field]: newValue
            }
        }, async () => await this.layoutService.updateLayout(this.state.layout));
    }

    deleteLayout = async () => {
        await this.layoutService.deleteLayout(this.state.layout);

        // TODO: add success message!

        this.props.onBackButtonClick();
    }

    closeDeleteConfirmation = () => {
        this.setState({ showDeleteConfirmation: false });
    }

    copyLayout = async () => {
        const copiedLayout = await this.layoutService.copyLayout(this.state.layout.key);
        this.setState({ layout: copiedLayout });
    }

    render() {
        return <>
             {this.state.showDeleteConfirmation && 
                <DeleteConfirmationOverlay
                    deleteItemTitle={this.state.layout.title}
                    onConfirm={this.deleteLayout.bind(this)}
                    onDismiss={this.closeDeleteConfirmation.bind(this)} 
                />
            }
            <BackButton onClick={this.props.onBackButtonClick} />
            <Stack styles={{ root: { margin: '20px 0' } }}>
                <TextField label="Title"
                    value={this.state.layout.title}
                    onChange={(event, newValue) => this.onInputChange('title', newValue)}
                />
                <TextField label="Permalink template"
                    value={this.state.layout.permalinkTemplate}
                    onChange={(event, newValue) => this.onInputChange('permalinkTemplate', newValue)}
                />
                <TextField label="Description"
                    multiline
                    autoAdjustHeight
                    value={this.state.layout.description}
                    onChange={(event, newValue) => this.onInputChange('descriptiion', newValue)}
                />
            </Stack>
            {this.state.layout.permalinkTemplate !== '/' &&
                <Stack horizontal styles={{ root: { height: 44 } }}>
                    <CommandBarButton
                        iconProps={deleteIcon}
                        text="Delete layout"
                        onClick={() => this.setState({ showDeleteConfirmation: true })}
                    />
                    <CommandBarButton
                        iconProps={copyIcon}
                        text="Copy layout"
                        onClick={() => this.copyLayout()}
                    />
                </Stack>
            }
        </>
    }
}