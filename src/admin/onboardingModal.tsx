import * as React from 'react';
import { Carousel, SlideHandle } from 'nuka-carousel';
import { DefaultButton, IconButton, Image, ImageFit, Link, Modal, PrimaryButton, Stack, Text } from '@fluentui/react';

interface OnboardingModalState {
    currentSlide: number
}

interface OnboardingModalProps {
    onDismiss: () => void
}

const modalSlides = [
    {
        imagePath: '/assets/images/onboarding-1.png',
        header: 'Introducing the improved developer portal and API and product details pages!',
        body: <Text block>We redesigned the developer portal layout to help maximize your productivity. We also added a new API details page and product details page widget so that you can display custom documentation.</Text>
    },
    {
        imagePath: '/assets/images/onboarding-2.png',
        header: 'A new look and greater efficiency',
        body: <><Text block>The developer portal editor has a new layout that emphasizes site management. We reorganized the core elements that you interact with most, but all your favorite features are still here:</Text>
        <ul>
            <li><Text><Text className="bolder-text">Menu:</Text> Easily locate the features you need to manage and customize your site.</Text></li>
            <li><Text><Text className="bolder-text">Toolbar menu:</Text> Quickly save and publish changes or switch between editing options.</Text></li>
            <li><Text><Text className="bolder-text">Content area:</Text> Edit content in a more focused workspace.</Text></li>
        </ul></>
    },
    {
        imagePath: '/assets/images/onboarding-4.png',
        header: 'Access information and customer support',
        body: <><Text block>We grouped helpful resources to support your site management needs. Access them through the Help and resources section of the menu:</Text>
        <ul>
            <li><Text block><Text className="bolder-text">Documentation and tutorials:</Text> Access our library of <Link underline target="_blank" href="https://aka.ms/apimdocs/portal">documentation</Link> to gain a deeper understanding of our features and functionality.</Text></li>
            <li><Text block><Text className="bolder-text">Feedback:</Text> Share your experience or report a bug in our <Link underline target="_blank" href="https://aka.ms/apimdevportal">GitHub repository</Link>.</Text></li>
            <li><Text block><Text className="bolder-text">Support:</Text> Request assistance through your API Management service.</Text></li>
        </ul></>
    }
];

export class OnboardingModal extends React.Component<OnboardingModalProps, OnboardingModalState> {
    private readonly carouselRef = React.createRef<SlideHandle>();

    constructor(props: OnboardingModalProps) {
        super(props);

        this.state = {
            currentSlide: 0
        }
    }

    renderPrevButton = (): JSX.Element => (
        <DefaultButton
            text="Previous"
            onClick={() => this.carouselRef.current?.goBack()}
            styles={{ root: { display: this.state.currentSlide === 0 ? 'none' : 'block' } }}
        />
    )
    
    renderNextButton = (): JSX.Element => (
        <PrimaryButton
            text={this.state.currentSlide === modalSlides.length - 1 ? 'Close' : 'Next' }
            onClick={() => this.state.currentSlide === modalSlides.length - 1 ? this.props.onDismiss() : this.carouselRef.current?.goForward()}
        />
    )

    render(): JSX.Element {
        return <>
            <Modal
                isOpen={true}
                containerClassName="admin-modal onboarding-modal"
            >
                <>
                    <IconButton
                        iconProps={{ iconName: 'Cancel', styles: { root: { color: '#ffffff' } } }}
                        aria-label="Close"
                        className="onboarding-modal-close"
                        onClick={this.props.onDismiss}
                    />
                    <Carousel
                        ref={this.carouselRef}
                        showArrows={false}
                        showDots
                        wrapMode="nowrap"
                        className="onboarding-carousel"
                        afterSlide={(index: number) => this.setState({ currentSlide: index })}
                    >
                        {modalSlides.map(slide => (
                            <div key={slide.header}>
                                <Image
                                    src={slide.imagePath}
                                    imageFit={ImageFit.centerCover}
                                    styles={{ root: { height: 360 } }}
                                    alt={slide.header}
                                />
                                <Stack className="carousel-text-container">
                                    <Text block className="carousel-header" role="heading" aria-level={2}>{slide.header}</Text>
                                    {slide.body}
                                </Stack>
                            </div>
                        ))}
                    </Carousel>
                    <Stack horizontal horizontalAlign="space-between" className="onboarding-modal-controls">
                        {this.renderPrevButton()}
                        {this.renderNextButton()}
                    </Stack>
                </>
            </Modal>
        </>
    }
}