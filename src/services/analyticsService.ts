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
import { UsersService } from "./usersService";


/**
 * A service providing analytic reports.
 */
export class AnalyticsService {
    constructor(
        private readonly mapiClient: MapiClient,
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
        const query = `${userId}/reports/byTime?$filter=timestamp ge ${startTime.toISOString()} and timestamp le ${endTime.toISOString()}&interval=PT${interval}M`;
        const pageOfRecords = await this.mapiClient.get<Page<ReportRecordByTime>>(query, [MapiClient.getPortalHeader("getReportsByTime")]);

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
        const query = `${userId}/reports/byGeo?$filter=timestamp ge ${startTime.toISOString()} and timestamp le ${endTime.toISOString()}`;
        const pageOfRecords = await this.mapiClient.get<Page<ReportRecordByGeo>>(query, [MapiClient.getPortalHeader("getReportsByGeo")]);

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

        const userId = await this.usersService.getCurrentUserId();
        const query = `${userId}/reports/byProduct?$filter=timestamp ge ${startTime} and timestamp le ${endTime}&$top=${take}&$skip=${skip}&$orderby=${orderBy} desc`;
        const pageOfRecords = await this.mapiClient.get<Page<ReportRecordByProduct>>(query, [MapiClient.getPortalHeader("getReportsByProduct")]);

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

        const userId = await this.usersService.getCurrentUserId();
        const query = `${userId}/reports/bySubscription?$filter=timestamp ge ${startTime} and timestamp le ${endTime}&$top=${take}&$skip=${skip}&$orderby=${orderBy} desc`;
        const pageOfRecords = await this.mapiClient.get<Page<ReportRecordBySubscription>>(query, [MapiClient.getPortalHeader("getReportsBySubscription")]);

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

        const userId = await this.usersService.getCurrentUserId();
        const query = `${userId}/reports/byApi?$filter=timestamp ge ${startTime} and timestamp le ${endTime}&$top=${take}&$skip=${skip}&$orderby=${orderBy} desc`;
        const pageOfRecords = await this.mapiClient.get<Page<ReportRecordByApi>>(query, [MapiClient.getPortalHeader("getReportsByApi")]);

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

        const userId = await this.usersService.getCurrentUserId();
        const query = `${userId}/reports/byOperation?$filter=timestamp ge ${startTime} and timestamp le ${endTime}&$top=${take}&$skip=${skip}&$orderby=${orderBy} desc`;
        const pageOfRecords = await this.mapiClient.get<Page<ReportRecordByOperation>>(query, [MapiClient.getPortalHeader("getReportsByOperation")]);

        return pageOfRecords;
    }
}