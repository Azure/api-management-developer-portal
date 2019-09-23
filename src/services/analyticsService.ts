import * as Constants from "../constants";
import { MapiClient } from "./mapiClient";
import { Page } from "../models/page";
import { ReportRecordByGeo } from "../contracts/reportRecordByGeo";
import { ReportRecordByTime } from "../contracts/reportRecordByTime";
import { ReportRecordByProduct } from "../contracts/reportRecordByProduct";
import { ReportRecordBySubscription } from "../contracts/reportRecordBySubscription";
import { ReportRecordByApi } from "../contracts/reportRecordByApi";
import { ReportRecordByOperation } from "../contracts/reportRecordByOperation";
import { ReportQuery } from "./reportQuery";


/**
 * A service providing analytic reports.
 */
export class AnalyticsService {
    constructor(private readonly mapiClient: MapiClient) { }

    /**
     * Returns metrics aggregated over a period of time.
     * @param startTime Start time.
     * @param endTime End time.
     * @param interval Interval in minutes (must be multiple of 15 minutes and may not be zero).
     * @returns Page of report records.
     */
    public async getReportsByTime(startTime: Date, endTime: Date, interval: number): Promise<Page<ReportRecordByTime>> {
        const query = `/reports/byTime?$filter=timestamp ge ${startTime.toISOString()} and timestamp le ${endTime.toISOString()}&interval=PT${interval}M`;
        const pageOfRecords = await this.mapiClient.get<Page<ReportRecordByTime>>(query);

        return pageOfRecords;
    }

    /**
     * Returns metrics aggregated by geographical region.
     * @param startTime Start time.
     * @param endTime End time.
     * @returns Page of report records.
     */
    public async getReportsByGeo(startTime: Date, endTime: Date): Promise<Page<ReportRecordByGeo>> {
        const query = `/reports/byGeo?$filter=timestamp ge ${startTime.toISOString()} and timestamp le ${endTime.toISOString()}`;
        const pageOfRecords = await this.mapiClient.get<Page<ReportRecordByGeo>>(query);

        return pageOfRecords;
    }

    /**
     * Returns metrics aggregated by product.
     * @param startTime Start time.
     * @param endTime End time.
     * @returns Page of report records.
     */
    public async getReportsByProduct(reportQuery: ReportQuery): Promise<Page<ReportRecordByProduct>> {
        const orderBy = reportQuery.orderBy || "callCountSuccess";
        const skip = reportQuery.skip || 0;
        const take = reportQuery.take || Constants.defaultPageSize;
        const startTime = reportQuery.startTime.toISOString();
        const endTime = reportQuery.endTime.toISOString();

        const query = `/reports/byProduct?$filter=timestamp ge ${startTime} and timestamp le ${endTime}&$top=${take}&$skip=${skip}&$orderby=${orderBy} desc`;
        const pageOfRecords = await this.mapiClient.get<Page<ReportRecordByProduct>>(query);

        return pageOfRecords;
    }

    /**
     * Returns metrics aggregated by subscription.
     * @param startTime Start time.
     * @param endTime End time.
     * @returns Page of report records.
     */
    public async getReportsBySubscription(reportQuery: ReportQuery): Promise<Page<ReportRecordBySubscription>> {
        const orderBy = reportQuery.orderBy || "callCountTotal";
        const skip = reportQuery.skip || 0;
        const take = reportQuery.take || Constants.defaultPageSize;
        const startTime = reportQuery.startTime.toISOString();
        const endTime = reportQuery.endTime.toISOString();

        const query = `/reports/bySubscription?$filter=timestamp ge ${startTime} and timestamp le ${endTime}&$top=${take}&$skip=${skip}&$orderby=${orderBy} desc`;
        const pageOfRecords = await this.mapiClient.get<Page<ReportRecordBySubscription>>(query);

        return pageOfRecords;
    }

    /**
     * Returns metrics aggregated by API.
     * @param startTime Start time.
     * @param endTime End time.
     * @returns Page of report records.
     */
    public async getReportsByApi(reportQuery: ReportQuery): Promise<Page<ReportRecordByApi>> {
        const orderBy = reportQuery.orderBy || "callCountTotal";
        const skip = reportQuery.skip || 0;
        const take = reportQuery.take || Constants.defaultPageSize;
        const startTime = reportQuery.startTime.toISOString();
        const endTime = reportQuery.endTime.toISOString();

        const query = `/reports/byApi?$filter=timestamp ge ${startTime} and timestamp le ${endTime}&$top=${take}&$skip=${skip}&$orderby=${orderBy} desc`;
        const pageOfRecords = await this.mapiClient.get<Page<ReportRecordByApi>>(query);

        return pageOfRecords;
    }

    /**
     * Returns metrics aggregated by operation.
     * @param startTime Start time.
     * @param endTime End time.
     * @returns Page of report records.
     */
    public async getReportsByOperation(reportQuery: ReportQuery): Promise<Page<ReportRecordByOperation>> {
        const orderBy = reportQuery.orderBy || "callCountTotal";
        const skip = reportQuery.skip || 0;
        const take = reportQuery.take || Constants.defaultPageSize;
        const startTime = reportQuery.startTime.toISOString();
        const endTime = reportQuery.endTime.toISOString();

        const query = `/reports/byOperation?$filter=timestamp ge ${startTime} and timestamp le ${endTime}&$top=${take}&$skip=${skip}&$orderby=${orderBy} desc`;
        const pageOfRecords = await this.mapiClient.get<Page<ReportRecordByOperation>>(query);

        return pageOfRecords;
    }
}