export class DevPortalEvent {
    /**
     * Event type.
     */
    public eventType: string;

    /**
     * Event message.
     */
    public message: string;

    /**
     * Payload of event data.
     */
    public eventData: string;

    /**
     * ISO representation of current time.
     */
    public timestamp: string;

    /**
     * uuidv4 value.
     */
    public activityId: string;

    public toJson(): object{
        return {
            "eventType": this.eventType,
            "message": this.message,
            "eventData": this.eventData,
            "timestamp": this.timestamp,
            "activityId": this.activityId
        }
    }
}