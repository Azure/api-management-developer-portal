import { ViewModelBinder } from "@paperbits/common/widgets";
import { ProductSubscribeViewModel } from "./productSubscribeViewModel";
import { ProductSubscribeModel } from "../productSubscribeModel";
import { Bag } from "@paperbits/common";
import { EventManager } from "@paperbits/common/events";



export class ProductSubscribeViewModelBinder implements ViewModelBinder<ProductSubscribeModel, ProductSubscribeViewModel> {
	constructor(private readonly eventManager: EventManager) { }
		
    public async modelToViewModel(model: ProductSubscribeModel, viewModel?: ProductSubscribeViewModel, bindingContext?: Bag<any>): Promise<ProductSubscribeViewModel> {
        if (!viewModel) {
            viewModel = new ProductSubscribeViewModel();
        }
		
	   viewModel.runtimeConfig(JSON.stringify({
            showTermsByDefault: model.showTermsByDefault
        }));
		
		


        viewModel["widgetBinding"] = {
            displayName: "Product: Subscribe form",
            model: model,
            flow: "block",
			editor: "product-subscribe-editor",
            applyChanges: async (updatedModel: ProductSubscribeModel) => {
                this.modelToViewModel(updatedModel, viewModel, bindingContext);
			    this.eventManager.dispatchEvent("onContentUpdate");
            }
        };

        return viewModel;
    }

    public canHandleModel(model: ProductSubscribeModel): boolean {
        return model instanceof ProductSubscribeModel;
    }
}