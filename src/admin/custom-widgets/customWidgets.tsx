import * as React from 'react';
import { Resolve } from '@paperbits/react/decorators';
import { ViewManager } from '@paperbits/common/ui';
import { MapiBlobStorage } from '../../persistence';
import { TCustomWidgetConfig } from '../../components/custom-widget';
import { listConfigBlobs, loadCustomWidgetConfigs } from '../../components/custom-widget-list/loadCustomWidgetConfigs';
import { CommandBarButton, FontIcon, IIconProps, Spinner, Stack, Text } from '@fluentui/react';
import { BackButton } from '../utils/components/backButton';
import { CustomWidgetDetailsModal } from './customWidgetDetailsModal';
import { lightTheme } from '../utils/themes';

interface CustomWidgetsState {
    customWidgets: TCustomWidgetConfig[],
    showCustomWidgetModal: boolean,
    selectedCustomWidget: TCustomWidgetConfig,
    isLoading: boolean
}

interface CustomWidgetsProps {
    onBackButtonClick: () => void
}

const addIcon: IIconProps = { iconName: 'Add' };
const widgetIcon: IIconProps = { iconName: 'Puzzle' };

const iconStyles = { width: '16px', color: lightTheme.palette.themePrimary };

export class CustomWidgets extends React.Component<CustomWidgetsProps, CustomWidgetsState> {
    @Resolve('viewManager')
    public viewManager: ViewManager;

    @Resolve('blobStorage')
    public blobStorage: MapiBlobStorage;

    constructor(props: CustomWidgetsProps) {
        super(props);

        this.state = {
            customWidgets: [],
            showCustomWidgetModal: false,
            selectedCustomWidget: null,
            isLoading: false
        }
    }

    componentDidMount(): void {
        this.setState({ isLoading: true });
        this.searchCustomWidgets();
    }

    handleCustomWidgetModalClose = (): void => {
        this.setState({ showCustomWidgetModal: false, selectedCustomWidget: null, isLoading: true });
        this.searchCustomWidgets();
    }

    searchCustomWidgets = async (): Promise<void> => {
        const configsPromise = loadCustomWidgetConfigs(this.blobStorage, this.viewManager);
        const refreshConfigs = listConfigBlobs(this.blobStorage); // in case some configs on the blob storage got deleted/updated/added

        Promise.all([refreshConfigs, configsPromise]).then(([configBlobs, configsAll]) => {
            const configs: Record<string, TCustomWidgetConfig> = {};
            configBlobs.forEach(config => configs[config.name] = config);
            configsAll.forEach(config => {
                if (config.override) configs[config.name] = config;
            });
            
            this.setState({ customWidgets: Object.values(configs)});
        }).finally(() => this.setState({ isLoading: false }));
    }

    renderCustomWidgetContent = (customWidget: TCustomWidgetConfig): JSX.Element => (
        <Stack
            horizontal
            horizontalAlign="space-between"
            verticalAlign="center"
            className="nav-item-outer-stack"
        >
            <Text>{customWidget.displayName}</Text>
            <FontIcon
                iconName="Settings"
                title="Edit"
                style={iconStyles}
                className="nav-item-inner"
                tabIndex={0}
                onClick={(event) => {
                    this.setState({ showCustomWidgetModal: true, selectedCustomWidget: customWidget });
                    event.stopPropagation();
                }}
                // Required for accessibility
                onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                        this.setState({ showCustomWidgetModal: true, selectedCustomWidget: customWidget });
                        event.preventDefault();
                    }
                }}
            />
        </Stack>
    )

    render(): JSX.Element {
        return <>
            {this.state.showCustomWidgetModal &&
                <CustomWidgetDetailsModal
                    customWidget={this.state.selectedCustomWidget}
                    customWidgets={this.state.customWidgets}
                    onDismiss={this.handleCustomWidgetModalClose.bind(this)}
                />
            }
            <BackButton onClick={this.props.onBackButtonClick} />
            <Stack className="nav-item-description-container">
                <Text className="description-text">
                    Custom widgets let you extend the developer portal's functionality in a modular way. For example, you can implement an integration 
                    with a support system, reuse it on several pages, and source-control the code in a git repository.
                </Text>
            </Stack>
            <CommandBarButton
                iconProps={addIcon}
                text="Add new custom widget"
                className="nav-item-list-button"
                onClick={() => this.setState({ showCustomWidgetModal: true, selectedCustomWidget: null })}
            />
            <div className="objects-list">
                {this.state.isLoading && <Spinner />}
                {this.state.customWidgets.length === 0 && !this.state.isLoading
                    ? <Text block className="nav-item-description-container">It seems that you don't have custom widgets yet. Would you like to create one?</Text>
                    : this.state.customWidgets.map(customWidget =>
                        <CommandBarButton
                            iconProps={widgetIcon}
                            text={customWidget.displayName}
                            key={customWidget.name}
                            className="nav-item-list-button"
                            onRenderText={() => this.renderCustomWidgetContent(customWidget)}
                        />
                )}
            </div>
        </>
    }
}