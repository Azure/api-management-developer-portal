import * as ko from "knockout";
import * as moment from "moment";
import * as Constants from "../../../../constants";
import template from "./reports.html";
import { Utils } from "../../../../utils";
import { ReportQuery } from "../../../../services/reportQuery";
import { Component, RuntimeComponent, OnMounted } from "@paperbits/common/ko/decorators";
import { AnalyticsService } from "../../../../services/analyticsService";
import { ReportRecordByProductViewModel } from "./reportRecordByProductViewModel";
import { ReportRecordBySubscriptionViewModel } from "./reportRecordBySubscriptionViewModel";
import { ReportRecordByApiViewModel } from "./reportRecordByApiViewModel";
import { ReportRecordByOperationViewModel } from "./reportRecordByOperationViewModel";
import { MinMaxAvgChartConfig } from "../../minMaxAvgChart/minMaxAvgChartConfig";
import { MinMaxAvgChartRecord } from "../../minMaxAvgChart/minMaxAvgChartRecord";
import { BarChartConfig, BarChartRecord } from "../../barChart/barChartConfig";
import { MapChartConfig } from "../../mapChart/mapChartConfig";

@RuntimeComponent({
    selector: "reports-runtime"
})
@Component({
    selector: "reports-runtime",
    template: template
})
export class Reports {
    private chartUpdateTimeout: number;
    public readonly startTime: ko.Observable<Date>;
    public readonly endTime: ko.Observable<Date>;
    public readonly selectedPeriod: ko.Observable<string>;

    public readonly reportByCalls: ko.Observable<BarChartConfig>;
    public readonly reportByCallsGeo: ko.Observable<MapChartConfig>;
    public readonly reportByBandwidth: ko.Observable<BarChartConfig>;
    public readonly reportByBandwidthGeo: ko.Observable<MapChartConfig>;
    public readonly reportByLatency: ko.Observable<MinMaxAvgChartConfig>;
    public readonly reportByLatencyGeo: ko.Observable<MapChartConfig>;

    public readonly reportByProduct: ko.Observable<ReportRecordByProductViewModel[]>;
    public readonly reportByProductOrder: ko.Observable<string>;
    public readonly reportByProductPage: ko.Observable<number>;
    public readonly reportByProductHasPager: ko.Computed<boolean>;
    public readonly reportByProductHasPrevPage: ko.Observable<boolean>;
    public readonly reportByProductHasNextPage: ko.Observable<boolean>;
    public readonly reportByProductWorking: ko.Observable<boolean>;
    public readonly reportByProductHasData: ko.Computed<boolean>;

    public readonly reportBySubscription: ko.Observable<ReportRecordBySubscriptionViewModel[]>;
    public readonly reportBySubscriptionOrder: ko.Observable<string>;
    public readonly reportBySubscriptionPage: ko.Observable<number>;
    public readonly reportBySubscriptionHasPager: ko.Computed<boolean>;
    public readonly reportBySubscriptionHasPrevPage: ko.Observable<boolean>;
    public readonly reportBySubscriptionHasNextPage: ko.Observable<boolean>;
    public readonly reportBySubscriptionWorking: ko.Observable<boolean>;
    public readonly reportBySubscriptionHasData: ko.Computed<boolean>;

    public readonly reportByApi: ko.Observable<ReportRecordByApiViewModel[]>;
    public readonly reportByApiOrder: ko.Observable<string>;
    public readonly reportByApiPage: ko.Observable<number>;
    public readonly reportByApiHasPager: ko.Computed<boolean>;
    public readonly reportByApiHasPrevPage: ko.Observable<boolean>;
    public readonly reportByApiHasNextPage: ko.Observable<boolean>;
    public readonly reportByApiWorking: ko.Observable<boolean>;
    public readonly reportByApiHasData: ko.Computed<boolean>;

    public readonly reportByOperation: ko.Observable<ReportRecordByOperationViewModel[]>;
    public readonly reportByOperationOrder: ko.Observable<string>;
    public readonly reportByOperationPage: ko.Observable<number>;
    public readonly reportByOperationHasPager: ko.Computed<boolean>;
    public readonly reportByOperationHasPrevPage: ko.Observable<boolean>;
    public readonly reportByOperationHasNextPage: ko.Observable<boolean>;
    public readonly reportByOperationWorking: ko.Observable<boolean>;
    public readonly reportByOperationHasData: ko.Computed<boolean>;

    constructor(private readonly analyticsService: AnalyticsService) {
        this.startTime = ko.observable();
        this.endTime = ko.observable();
        this.selectedPeriod = ko.observable();

        this.reportByCalls = ko.observable();
        this.reportByCallsGeo = ko.observable();
        this.reportByBandwidth = ko.observable();
        this.reportByBandwidthGeo = ko.observable();
        this.reportByLatency = ko.observable();
        this.reportByLatencyGeo = ko.observable();

        this.reportByProduct = ko.observable([]);
        this.reportByProductOrder = ko.observable("callCountSuccess");
        this.reportByProductPage = ko.observable(1);
        this.reportByProductHasPrevPage = ko.observable(false);
        this.reportByProductHasNextPage = ko.observable(false);
        this.reportByProductHasPager = ko.computed(() => this.reportByProductHasPrevPage() || this.reportByProductHasNextPage());
        this.reportByProductWorking = ko.observable(false);
        this.reportByProductHasData = ko.computed(() => this.reportByProduct().length !== 0);

        this.reportBySubscription = ko.observable([]);
        this.reportBySubscriptionOrder = ko.observable("callCountSuccess");
        this.reportBySubscriptionPage = ko.observable(1);
        this.reportBySubscriptionHasPrevPage = ko.observable(false);
        this.reportBySubscriptionHasNextPage = ko.observable(false);
        this.reportBySubscriptionHasPager = ko.computed(() => this.reportBySubscriptionHasPrevPage() || this.reportBySubscriptionHasNextPage());
        this.reportBySubscriptionWorking = ko.observable(false);
        this.reportBySubscriptionHasData = ko.computed(() => this.reportBySubscription().length !== 0);

        this.reportByApi = ko.observable([]);
        this.reportByApiOrder = ko.observable("callCountSuccess");
        this.reportByApiPage = ko.observable(1);
        this.reportByApiHasPrevPage = ko.observable(false);
        this.reportByApiHasNextPage = ko.observable(false);
        this.reportByApiHasPager = ko.computed(() => this.reportByApiHasPrevPage() || this.reportByApiHasNextPage());
        this.reportByApiWorking = ko.observable(false);
        this.reportByApiHasData = ko.computed(() => this.reportByApi().length !== 0);

        this.reportByOperation = ko.observable([]);
        this.reportByOperationOrder = ko.observable("callCountSuccess");
        this.reportByOperationPage = ko.observable(1);
        this.reportByOperationHasPrevPage = ko.observable(false);
        this.reportByOperationHasNextPage = ko.observable(false);
        this.reportByOperationHasPager = ko.computed(() => this.reportByOperationHasPrevPage() || this.reportByOperationHasNextPage());
        this.reportByOperationWorking = ko.observable(false);
        this.reportByOperationHasData = ko.computed(() => this.reportByOperation().length !== 0);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.setTimeRange7Days();

        await this.buildCharts();

        this.startTime.subscribe(this.scheduleChartsUpdate);
        this.endTime.subscribe(this.scheduleChartsUpdate);
    }

    private scheduleChartsUpdate(): void {
        clearTimeout(this.chartUpdateTimeout);
        this.chartUpdateTimeout = window.setTimeout(() => this.buildCharts(), 500);
    }

    private async buildCharts(): Promise<void> {
        const timePromise = this.getReportsByTime();
        const productPromise = this.getReportsByProduct();
        const subscriptionPromise = this.getReportsBySubscription();
        const apiPromise = this.getReportsByApi();
        const operationPromise = this.getReportsByOperation();

        Promise.all([
            timePromise,
            productPromise,
            subscriptionPromise,
            apiPromise,
            operationPromise
        ]);
    }

    /**
     * Creates a view model for metrics aggregated by product.
     */
    private async getReportsByProduct(): Promise<void> {
        const startTime = this.startTime();
        const endTime = this.endTime();
        const pageNumber = this.reportByProductPage() - 1;
        const orderBy = this.reportByProductOrder();
        const query: ReportQuery = {
            startTime: startTime,
            endTime: endTime, skip: pageNumber * Constants.defaultPageSize,
            take: Constants.defaultPageSize,
            orderBy: orderBy
        };

        this.reportByProductWorking(true);

        const pageOfRecords = await this.analyticsService.getReportsByProduct(query);
        const records = pageOfRecords.value;

        this.reportByProductHasPrevPage(pageNumber > 0);
        this.reportByProductHasNextPage(!!pageOfRecords.nextLink);

        const viewModels: ReportRecordByProductViewModel[] = records.map(contract => {
            const viewModel = new ReportRecordByProductViewModel();
            viewModel.productName(contract.name);
            viewModel.productLink("#");

            viewModel.callCountSuccess(Utils.formatNumber(contract.callCountSuccess));
            viewModel.callCountBlocked(Utils.formatNumber(contract.callCountBlocked));
            viewModel.callCountFailed(Utils.formatNumber(contract.callCountFailed));
            viewModel.callCountOther(Utils.formatNumber(contract.callCountOther));
            viewModel.callCountTotal(Utils.formatNumber(contract.callCountTotal));
            viewModel.apiTimeAvg(Utils.formatTimespan(contract.apiTimeAvg));
            viewModel.bandwidth(Utils.formatBytes(contract.bandwidth));

            return viewModel;
        });

        this.reportByProduct(viewModels);
        this.reportByProductWorking(false);
    }

    public reportByProductPrevPage(): void {
        this.reportByProductPage(this.reportByProductPage() - 1);
        this.getReportsByProduct();
    }

    public reportByProductNextPage(): void {
        this.reportByProductPage(this.reportByProductPage() + 1);
        this.getReportsByProduct();
    }

    public reportByProductOrderBy(fieldName: string): void {
        this.reportByProductOrder(fieldName);
        this.getReportsByProduct();
    }

    /**
     * Creates a view model for metrics aggregated by subscription.
     */
    private async getReportsBySubscription(): Promise<void> {
        const startTime = this.startTime();
        const endTime = this.endTime();
        const pageNumber = this.reportBySubscriptionPage() - 1;
        const orderBy = this.reportBySubscriptionOrder();
        const query: ReportQuery = {
            startTime: startTime,
            endTime: endTime, skip: pageNumber * Constants.defaultPageSize,
            take: Constants.defaultPageSize,
            orderBy: orderBy
        };

        this.reportBySubscriptionWorking(true);

        const pageOfRecords = await this.analyticsService.getReportsBySubscription(query);
        const records = pageOfRecords.value;

        this.reportBySubscriptionHasPrevPage(pageNumber > 0);
        this.reportBySubscriptionHasNextPage(!!pageOfRecords.nextLink);


        const viewModels: ReportRecordBySubscriptionViewModel[] = records.map(contract => {
            const viewModel = new ReportRecordBySubscriptionViewModel();
            viewModel.subscriptionName(contract.name || "< Unnamed >");
            viewModel.productId("");
            viewModel.subscriptionId("");
            viewModel.userId("");

            viewModel.callCountSuccess(Utils.formatNumber(contract.callCountSuccess));
            viewModel.callCountBlocked(Utils.formatNumber(contract.callCountBlocked));
            viewModel.callCountFailed(Utils.formatNumber(contract.callCountFailed));
            viewModel.callCountOther(Utils.formatNumber(contract.callCountOther));
            viewModel.callCountTotal(Utils.formatNumber(contract.callCountTotal));
            viewModel.apiTimeAvg(Utils.formatTimespan(contract.apiTimeAvg));
            viewModel.bandwidth(Utils.formatBytes(contract.bandwidth));

            return viewModel;
        });

        this.reportBySubscription(viewModels);
        this.reportBySubscriptionWorking(false);
    }

    public reportBySubscriptionPrevPage(): void {
        this.reportBySubscriptionPage(this.reportBySubscriptionPage() - 1);
        this.getReportsBySubscription();
    }

    public reportBySubscriptionNextPage(): void {
        this.reportBySubscriptionPage(this.reportBySubscriptionPage() + 1);
        this.getReportsBySubscription();
    }

    public reportBySubscriptionOrderBy(fieldName: string): void {
        this.reportBySubscriptionOrder(fieldName);
        this.getReportsBySubscription();
    }

    /**
     * Creates a view model for metrics aggregated by API.
     */
    private async getReportsByApi(): Promise<void> {
        const startTime = this.startTime();
        const endTime = this.endTime();
        const pageNumber = this.reportByApiPage() - 1;
        const orderBy = this.reportByApiOrder();
        const query: ReportQuery = {
            startTime: startTime,
            endTime: endTime, skip: pageNumber * Constants.defaultPageSize,
            take: Constants.defaultPageSize,
            orderBy: orderBy
        };

        this.reportByApiWorking(true);

        const pageOfRecords = await this.analyticsService.getReportsByApi(query);
        const records = pageOfRecords.value;

        this.reportByApiHasPrevPage(pageNumber > 0);
        this.reportByApiHasNextPage(!!pageOfRecords.nextLink);

        const viewModels: ReportRecordByApiViewModel[] = records.map(contract => {
            const viewModel = new ReportRecordByApiViewModel();
            viewModel.apiId("");
            viewModel.apiName(contract.name);

            viewModel.callCountSuccess(Utils.formatNumber(contract.callCountSuccess));
            viewModel.callCountBlocked(Utils.formatNumber(contract.callCountBlocked));
            viewModel.callCountFailed(Utils.formatNumber(contract.callCountFailed));
            viewModel.callCountOther(Utils.formatNumber(contract.callCountOther));
            viewModel.callCountTotal(Utils.formatNumber(contract.callCountTotal));
            viewModel.apiTimeAvg(Utils.formatTimespan(contract.apiTimeAvg));
            viewModel.bandwidth(Utils.formatBytes(contract.bandwidth));

            return viewModel;
        });

        this.reportByApi(viewModels);
        this.reportByApiWorking(false);
    }

    public reportByApiPrevPage(): void {
        this.reportByApiPage(this.reportByApiPage() - 1);
        this.getReportsByApi();
    }

    public reportByApiNextPage(): void {
        this.reportByApiPage(this.reportByApiPage() + 1);
        this.getReportsByApi();
    }

    public reportByApiOrderBy(fieldName: string): void {
        this.reportByApiOrder(fieldName);
        this.getReportsByApi();
    }

    /**
     * Creates a view model for metrics aggregated by operation.
     */
    private async getReportsByOperation(): Promise<void> {
        const startTime = this.startTime();
        const endTime = this.endTime();
        const pageNumber = this.reportByOperationPage() - 1;
        const orderBy = this.reportByOperationOrder();
        const query: ReportQuery = {
            startTime: startTime,
            endTime: endTime, skip: pageNumber * Constants.defaultPageSize,
            take: Constants.defaultPageSize,
            orderBy: orderBy
        };

        this.reportByOperationWorking(true);
        const pageOfRecords = await this.analyticsService.getReportsByOperation(query);
        const records = pageOfRecords.value;

        this.reportByOperationHasPrevPage(pageNumber > 0);
        this.reportByOperationHasNextPage(!!pageOfRecords.nextLink);

        const viewModels: ReportRecordByOperationViewModel[] = records.map(contract => {
            const viewModel = new ReportRecordByOperationViewModel();
            viewModel.operationId("");
            viewModel.operationName(contract.name);

            viewModel.callCountSuccess(Utils.formatNumber(contract.callCountSuccess));
            viewModel.callCountBlocked(Utils.formatNumber(contract.callCountBlocked));
            viewModel.callCountFailed(Utils.formatNumber(contract.callCountFailed));
            viewModel.callCountOther(Utils.formatNumber(contract.callCountOther));
            viewModel.callCountTotal(Utils.formatNumber(contract.callCountTotal));
            viewModel.apiTimeAvg(Utils.formatTimespan(contract.apiTimeAvg));
            viewModel.bandwidth(Utils.formatBytes(contract.bandwidth));

            return viewModel;
        });

        this.reportByOperation(viewModels);
        this.reportByOperationWorking(false);
    }

    public reportByOperationPrevPage(): void {
        this.reportByOperationPage(this.reportByOperationPage() - 1);
        this.getReportsByOperation();
    }

    public reportByOperationNextPage(): void {
        this.reportByOperationPage(this.reportByOperationPage() + 1);
        this.getReportsByOperation();
    }

    public reportByOperationOrderBy(fieldName: string): void {
        this.reportByOperationOrder(fieldName);
        this.getReportsByOperation();
    }

    private async getReportsByTime(): Promise<void> {
        const startTime = this.startTime();
        const endTime = this.endTime();
        const differenceTime = endTime.getTime() - startTime.getTime();
        const differenceMinutes = Math.floor(differenceTime / (1000 * 60));
        const differenceHours = Math.floor(differenceTime / (1000 * 60 * 60));
        const differenceDays = Math.floor(differenceTime / (1000 * 3600 * 24));

        const maxRecordsToDisplay = 50;
        const intervalMultiplier = 15;
        const intervalInMin = (Math.floor(differenceMinutes / intervalMultiplier / maxRecordsToDisplay) * intervalMultiplier) || intervalMultiplier;

        let dateFormattingFunc: (timestamp: Date) => string;
        let dateFormattingDetailedFunc: (timestamp: Date) => string;

        if (differenceDays > 30) {
            dateFormattingFunc = (date: Date) => moment(date).format("MMM");
            dateFormattingDetailedFunc = dateFormattingFunc;
        }
        else if (differenceDays > 7) {
            dateFormattingFunc = (date: Date) => moment(date).format("M/D");
            dateFormattingDetailedFunc = dateFormattingFunc;
        }
        else if (differenceHours > 24) {
            dateFormattingFunc = (date: Date) => moment(date).format("M/D");
            dateFormattingDetailedFunc = (date: Date) => moment(date).format("M/D LT");
        }
        else {
            dateFormattingFunc = (date: Date) => moment(date).format("HH:mm");
        }

        const reportsByTime = await this.analyticsService.getReportsByTime(startTime, endTime, intervalInMin);
        const reportsByGeo = await this.analyticsService.getReportsByGeo(startTime, endTime);

        /* API calls */
        const recordsApiCalls: BarChartRecord[] = reportsByTime.value.map(x => {
            return {
                timestamp: new Date(x.timestamp),
                value: {
                    callCountTotal: x.callCountTotal,
                    callCountSuccess: x.callCountSuccess,
                    callCountFailed: x.callCountFailed,
                    callCountBlocked: x.callCountBlocked,
                }
            };
        });

        const chartConfigApiCalls: BarChartConfig = {
            startTime: startTime,
            endTime: endTime,
            records: recordsApiCalls,
            formatX: dateFormattingFunc,
            formatXDetailed: dateFormattingDetailedFunc,
            dimensions: [{
                displayName: "Total requests",
                key: "callCountTotal",
                color: "#a0cef5"
            },
            {
                displayName: "Successfull requests",
                key: "callCountSuccess",
                color: "#7fba00"
            },
            {
                displayName: "Failed requests",
                key: "callCountFailed",
                color: "#e81123"
            },
            {
                displayName: "Blocked requests",
                key: "callCountBlocked",
                color: "#ff9800"
            }]
        };

        this.reportByCalls(chartConfigApiCalls);

        const chartConfigCallsGeo: MapChartConfig = {
            formatHeat: (calls: number) => Utils.formatNumber(calls),
            records: reportsByGeo.value.map(x => {
                return {
                    countryCode: x.country,
                    heat: x.callCountTotal
                };
            })
        };

        this.reportByCallsGeo(chartConfigCallsGeo);


        /* Bandwith */
        const recordsBandwidth: BarChartRecord[] = reportsByTime.value.map(x => {
            return {
                timestamp: new Date(x.timestamp),
                value: {
                    bandwidth: x.bandwidth
                }
            };
        });

        const chartConfigBandiwidth: BarChartConfig = {
            startTime: startTime,
            endTime: endTime,
            records: recordsBandwidth,
            formatX: dateFormattingFunc,
            formatXDetailed: dateFormattingDetailedFunc,
            formatY: (bytes: number) => Utils.formatBytes(bytes),
            dimensions: [{
                displayName: "Bandwidth",
                key: "bandwidth",
                color: "#a0cef5"
            }]
        };

        this.reportByBandwidth(chartConfigBandiwidth);

        const chartConfigBandwidthGeo: MapChartConfig = {
            formatHeat: (bytes: number) => Utils.formatBytes(bytes),
            records: reportsByGeo.value.map(x => {
                return {
                    countryCode: x.country,
                    heat: x.bandwidth
                };
            })
        };

        this.reportByBandwidthGeo(chartConfigBandwidthGeo);


        /* Latency */
        const recordsLatency: MinMaxAvgChartRecord[] = reportsByTime.value.map(x => {
            return {
                timestamp: new Date(x.timestamp),
                min: x.apiTimeMin,
                avg: x.apiTimeAvg,
                max: x.apiTimeMax,
            };
        });

        const chartConfigLatency: MinMaxAvgChartConfig = {
            startTime: startTime,
            endTime: endTime,
            records: recordsLatency,
            formatX: dateFormattingFunc,
            formatXDetailed: dateFormattingDetailedFunc,
            formatY: (milliseconds: number) => Utils.formatTimespan(milliseconds)
        };

        this.reportByLatency(chartConfigLatency);

        const chartConfigLatencyGeo: MapChartConfig = {
            formatHeat: (milliseconds: number) => Utils.formatTimespan(milliseconds),
            records: reportsByGeo.value.map(x => {
                return {
                    countryCode: x.country,
                    heat: x.apiTimeAvg
                };
            })
        };

        this.reportByLatencyGeo(chartConfigLatencyGeo);
    }

    public setTimeRange1Hour(): void {
        this.startTime(moment().subtract(1, "hours").toDate());
        this.endTime(moment().toDate());
        this.selectedPeriod("1hour");
    }

    public setTimeRange1Day(): void {
        this.startTime(moment().subtract(1, "days").toDate());
        this.endTime(moment().toDate());
        this.selectedPeriod("1day");
    }

    public setTimeRange7Days(): void {
        this.startTime(moment().subtract(7, "days").toDate());
        this.endTime(moment().toDate());
        this.selectedPeriod("7days");
    }

    public setTimeRange30Days(): void {
        this.startTime(moment().subtract(30, "days").toDate());
        this.endTime(moment().toDate());
        this.selectedPeriod("30days");
    }

    public setTimeRange90Days(): void {
        this.startTime(moment().subtract(90, "days").toDate());
        this.endTime(moment().toDate());
        this.selectedPeriod("90days");
    }
}