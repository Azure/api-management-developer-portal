import * as Constants from "../constants";
import { IApiClient } from "../clients";
import { Page } from "../models/page";
import { ReportRecordByGeo } from "../contracts/reportRecordByGeo";
import { ReportRecordByTime } from "../contracts/reportRecordByTime";
import { ReportRecordByProduct } from "../contracts/reportRecordByProduct";
import { ReportRecordBySubscription } from "../contracts/reportRecordBySubscription";
import { ReportRecordByApi } from "../contracts/reportRecordByApi";
import { ReportRecordByOperation } from "../contracts/reportRecordByOperation";
import { ReportQuery } from "./reportQuery";
import { UsersService } from "./usersService";


/**
 * A service providing analytic reports.
 */
export class AnalyticsService {
    constructor(
        private readonly apiClient: IApiClient,
        private readonly usersService: UsersService
    ) { }

    /**
     * Returns metrics aggregated over a period of time.
     * @param startTime Start time.
     * @param endTime End time.
     * @param interval Interval in minutes (must be multiple of 15 minutes and may not be zero).
     * @returns Page of report records.
     */
    public async getReportsByTime(startTime: Date, endTime: Date, interval: number): Promise<Page<ReportRecordByTime>> {
        const userId = await this.usersService.getCurrentUserId();
        const query = `${userId}/reports/ByTime?$filter=timestamp ge ${startTime.toISOString()} and timestamp le ${endTime.toISOString()}&interval=PT${interval}M`;
        const pageOfRecords = await this.apiClient.get<Page<ReportRecordByTime>>(query, [await this.apiClient.getPortalHeader("getReportsByTime")]);

        return pageOfRecords;
    }

    /**
     * Returns metrics aggregated by geographical region.
     * @param startTime Start time.
     * @param endTime End time.
     * @returns Page of report records.
     */
    public async getReportsByGeo(startTime: Date, endTime: Date): Promise<Page<ReportRecordByGeo>> {
        const userId = await this.usersService.getCurrentUserId();
        const query = `${userId}/reports/ByRegion?$filter=timestamp ge ${startTime.toISOString()} and timestamp le ${endTime.toISOString()}`;
        const pageOfRecords = await this.apiClient.get<Page<ReportRecordByGeo>>(query, [await this.apiClient.getPortalHeader("getReportsByGeo")]);

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
        const orderDirection = reportQuery.orderDirection || Constants.Direction.desc;
        const skip = reportQuery.skip || 0;
        const take = reportQuery.take || Constants.defaultPageSize;
        const startTime = reportQuery.startTime.toISOString();
        const endTime = reportQuery.endTime.toISOString();

        const userId = await this.usersService.getCurrentUserId();
        const query = `${userId}/reports/ByProduct?$filter=timestamp ge ${startTime} and timestamp le ${endTime}&$top=${take}&$skip=${skip}&$orderby=${orderBy} ${orderDirection}`;
        const pageOfRecords = await this.apiClient.get<Page<ReportRecordByProduct>>(query, [await this.apiClient.getPortalHeader("getReportsByProduct")]);

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
        const orderDirection = reportQuery.orderDirection || Constants.Direction.desc;
        const skip = reportQuery.skip || 0;
        const take = reportQuery.take || Constants.defaultPageSize;
        const startTime = reportQuery.startTime.toISOString();
        const endTime = reportQuery.endTime.toISOString();

        const userId = await this.usersService.getCurrentUserId();
        const query = `${userId}/reports/BySubscription?$filter=timestamp ge ${startTime} and timestamp le ${endTime}&$top=${take}&$skip=${skip}&$orderby=${orderBy} ${orderDirection}`;
        const pageOfRecords = await this.apiClient.get<Page<ReportRecordBySubscription>>(query, [await this.apiClient.getPortalHeader("getReportsBySubscription")]);

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
        const orderDirection = reportQuery.orderDirection || Constants.Direction.desc;
        const skip = reportQuery.skip || 0;
        const take = reportQuery.take || Constants.defaultPageSize;
        const startTime = reportQuery.startTime.toISOString();
        const endTime = reportQuery.endTime.toISOString();

        const userId = await this.usersService.getCurrentUserId();
        const query = `${userId}/reports/ByEndpoint?$filter=timestamp ge ${startTime} and timestamp le ${endTime}&$top=${take}&$skip=${skip}&$orderby=${orderBy} ${orderDirection}`;
        const pageOfRecords = await this.apiClient.get<Page<ReportRecordByApi>>(query, [await this.apiClient.getPortalHeader("getReportsByApi")]);

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
        const orderDirection = reportQuery.orderDirection || Constants.Direction.desc;
        const skip = reportQuery.skip || 0;
        const take = reportQuery.take || Constants.defaultPageSize;
        const startTime = reportQuery.startTime.toISOString();
        const endTime = reportQuery.endTime.toISOString();

        const userId = await this.usersService.getCurrentUserId();
        const query = `${userId}/reports/ByOperation?$filter=timestamp ge ${startTime} and timestamp le ${endTime}&$top=${take}&$skip=${skip}&$orderby=${orderBy} ${orderDirection}`;
        const pageOfRecords = await this.apiClient.get<Page<ReportRecordByOperation>>(query, [await this.apiClient.getPortalHeader("getReportsByOperation")]);

        return pageOfRecords;
    }
}