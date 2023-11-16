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
    public readonly reportByProductOrderAscending: ko.Observable<boolean>;
    public readonly reportByProductPageNumber: ko.Observable<number>;
    public readonly reportByProductNextPage: ko.Observable<boolean>;
    public readonly reportByProductWorking: ko.Observable<boolean>;
    public readonly reportByProductHasData: ko.Computed<boolean>;

    public readonly reportBySubscription: ko.Observable<ReportRecordBySubscriptionViewModel[]>;
    public readonly reportBySubscriptionOrder: ko.Observable<string>;
    public readonly reportBySubscriptionOrderAscending: ko.Observable<boolean>;
    public readonly reportBySubscriptionPageNumber: ko.Observable<number>;
    public readonly reportBySubscriptionNextPage: ko.Observable<boolean>;
    public readonly reportBySubscriptionWorking: ko.Observable<boolean>;
    public readonly reportBySubscriptionHasData: ko.Computed<boolean>;

    public readonly reportByApi: ko.Observable<ReportRecordByApiViewModel[]>;
    public readonly reportByApiOrder: ko.Observable<string>;
    public readonly reportByApiOrderAscending: ko.Observable<boolean>;
    public readonly reportByApiPageNumber: ko.Observable<number>;
    public readonly reportByApiNextPage: ko.Observable<boolean>;
    public readonly reportByApiWorking: ko.Observable<boolean>;
    public readonly reportByApiHasData: ko.Computed<boolean>;

    public readonly reportByOperation: ko.Observable<ReportRecordByOperationViewModel[]>;
    public readonly reportByOperationOrder: ko.Observable<string>;
    public readonly reportByOperationOrderAscending: ko.Observable<boolean>;
    public readonly reportByOperationPageNumber: ko.Observable<number>;
    public readonly reportByOperationNextPage: ko.Observable<boolean>;
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
        this.reportByProductOrderAscending = ko.observable(false);
        this.reportByProductPageNumber = ko.observable(1);
        this.reportByProductNextPage = ko.observable();
        this.reportByProductWorking = ko.observable(false);
        this.reportByProductHasData = ko.computed(() => this.reportByProduct().length !== 0);

        this.reportBySubscription = ko.observable([]);
        this.reportBySubscriptionOrder = ko.observable("callCountSuccess");
        this.reportBySubscriptionOrderAscending = ko.observable(false);
        this.reportBySubscriptionPageNumber = ko.observable(1);
        this.reportBySubscriptionNextPage = ko.observable();
        this.reportBySubscriptionWorking = ko.observable(false);
        this.reportBySubscriptionHasData = ko.computed(() => this.reportBySubscription().length !== 0);

        this.reportByApi = ko.observable([]);
        this.reportByApiOrder = ko.observable("callCountSuccess");
        this.reportByApiOrderAscending = ko.observable(false);
        this.reportByApiPageNumber = ko.observable(1);
        this.reportByApiNextPage = ko.observable();
        this.reportByApiWorking = ko.observable(false);
        this.reportByApiHasData = ko.computed(() => this.reportByApi().length !== 0);

        this.reportByOperation = ko.observable([]);
        this.reportByOperationOrder = ko.observable("callCountSuccess");
        this.reportByOperationOrderAscending = ko.observable(false);
        this.reportByOperationPageNumber = ko.observable(1);
        this.reportByOperationNextPage = ko.observable();
        this.reportByOperationWorking = ko.observable(false);
        this.reportByOperationHasData = ko.computed(() => this.reportByOperation().length !== 0);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.setTimeRange7Days();

        await this.buildCharts();

        this.startTime.subscribe(this.scheduleChartsUpdate);
        this.endTime.subscribe(this.scheduleChartsUpdate);

        this.reportByProductPageNumber
            .subscribe(this.getReportsByProduct);

        this.reportBySubscriptionPageNumber
            .subscribe(this.getReportsBySubscription);

        this.reportByApiPageNumber
            .subscribe(this.getReportsByApi);

        this.reportByOperationPageNumber
            .subscribe(this.getReportsByOperation);
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
        const pageNumber = this.reportByProductPageNumber() - 1;
        const orderBy = this.reportByProductOrder();
        const orderAscending = this.reportByProductOrderAscending();
        const query: ReportQuery = {
            startTime: startTime,
            endTime: endTime, skip: pageNumber * Constants.defaultPageSize,
            take: Constants.defaultPageSize,
            orderBy: orderBy,
            orderDirection: orderAscending ? Constants.Direction.asc : Constants.Direction.desc
        };

        this.reportByProductWorking(true);

        const pageOfRecords = await this.analyticsService.getReportsByProduct(query);
        const records = pageOfRecords.value;

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
        this.reportByProductNextPage(!!pageOfRecords.nextLink);
        this.reportByProductWorking(false);
    }

    public reportByProductOrderBy(fieldName: string): void {
        if (fieldName === this.reportByProductOrder()) {
            this.reportByProductOrderAscending(!this.reportByProductOrderAscending());
        } else {
            this.reportByProductOrder(fieldName);
        }
        this.getReportsByProduct();
    }

    /**
     * Creates a view model for metrics aggregated by subscription.
     */
    private async getReportsBySubscription(): Promise<void> {
        const startTime = this.startTime();
        const endTime = this.endTime();
        const pageNumber = this.reportBySubscriptionPageNumber() - 1;
        const orderBy = this.reportBySubscriptionOrder();
        const orderAscending = this.reportBySubscriptionOrderAscending();
        const query: ReportQuery = {
            startTime: startTime,
            endTime: endTime, skip: pageNumber * Constants.defaultPageSize,
            take: Constants.defaultPageSize,
            orderBy: orderBy,
            orderDirection: orderAscending ? Constants.Direction.asc : Constants.Direction.desc
        };

        this.reportBySubscriptionWorking(true);

        const pageOfRecords = await this.analyticsService.getReportsBySubscription(query);
        const records = pageOfRecords.value;

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
        this.reportBySubscriptionNextPage(!!pageOfRecords.nextLink);
        this.reportBySubscriptionWorking(false);
    }

    public reportBySubscriptionOrderBy(fieldName: string): void {
        if (fieldName === this.reportBySubscriptionOrder()) {
            this.reportBySubscriptionOrderAscending(!this.reportBySubscriptionOrderAscending());
        } else {
            this.reportBySubscriptionOrder(fieldName);
        }
        this.getReportsBySubscription();
    }

    /**
     * Creates a view model for metrics aggregated by API.
     */
    private async getReportsByApi(): Promise<void> {
        const startTime = this.startTime();
        const endTime = this.endTime();
        const pageNumber = this.reportByApiPageNumber() - 1;
        const orderBy = this.reportByApiOrder();
        const orderAscending = this.reportByApiOrderAscending();
        const query: ReportQuery = {
            startTime: startTime,
            endTime: endTime, skip: pageNumber * Constants.defaultPageSize,
            take: Constants.defaultPageSize,
            orderBy: orderBy,
            orderDirection: orderAscending ? Constants.Direction.asc : Constants.Direction.desc
        };

        this.reportByApiWorking(true);

        const pageOfRecords = await this.analyticsService.getReportsByApi(query);
        const records = pageOfRecords.value;

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
        this.reportByApiNextPage(!!pageOfRecords.nextLink);
        this.reportByApiWorking(false);
    }

    public reportByApiOrderBy(fieldName: string): void {
        if (fieldName === this.reportByApiOrder()) {
            this.reportByApiOrderAscending(!this.reportByApiOrderAscending());
        } else {
            this.reportByApiOrder(fieldName);
        }
        this.getReportsByApi();
    }

    /**
     * Creates a view model for metrics aggregated by operation.
     */
    private async getReportsByOperation(): Promise<void> {
        const startTime = this.startTime();
        const endTime = this.endTime();
        const pageNumber = this.reportByOperationPageNumber() - 1;
        const orderBy = this.reportByOperationOrder();
        const orderAscending = this.reportByOperationOrderAscending();
        const query: ReportQuery = {
            startTime: startTime,
            endTime: endTime, skip: pageNumber * Constants.defaultPageSize,
            take: Constants.defaultPageSize,
            orderBy: orderBy,
            orderDirection: orderAscending ? Constants.Direction.asc : Constants.Direction.desc
        };

        this.reportByOperationWorking(true);
        const pageOfRecords = await this.analyticsService.getReportsByOperation(query);
        const records = pageOfRecords.value;

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
        this.reportByOperationNextPage(!!pageOfRecords.nextLink);
        this.reportByOperationWorking(false);
    }

    public reportByOperationOrderBy(fieldName: string): void {
        if (fieldName === this.reportByOperationOrder()) {
            this.reportByOperationOrderAscending(!this.reportByOperationOrderAscending());
        } else {
            this.reportByOperationOrder(fieldName);
        }
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
                displayName: "Successful requests",
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


        /* Bandwidth */
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
