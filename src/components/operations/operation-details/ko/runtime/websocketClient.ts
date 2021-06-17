export enum LogItemType {
    Connection = "Connection",
    SendData = "SendData",
    GetData = "GetData",
    Error = "Error"
};

export interface LogItem {
    logTime: string;
    logData: string;
    logType: LogItemType;
}

export class WebsocketClient {
    private websocket: WebSocket;
    private logs: LogItem[];

    constructor(private websocketUrl?: string) { 
        this.onOpenConnection = this.onOpenConnection.bind(this);
        this.onCloseConnection = this.onCloseConnection.bind(this);
        this.onErrorConnection = this.onErrorConnection.bind(this);
        this.onMessageConnection = this.onMessageConnection.bind(this);
        this.logs = [];
    }
    
    public isConnected: boolean;

    public onOpen: (message: string) => void;
    public onClose: (event: CloseEvent) => void;
    public onError: (error: string) => void;
    public onMessage: (data: MessageEvent<any>) => void;
    public onLogItem: (data: LogItem) => void;

    public get logItems() {
        return this.logs;
    }

    public connect(websocketUrl?: string) {
        this.websocketUrl = websocketUrl || this.websocketUrl;
        this.logDataItem(`Connecting to ${this.websocketUrl}`, LogItemType.Connection);

        this.websocket = new WebSocket(this.websocketUrl);
        this.websocket.onopen = this.onOpenConnection;
        this.websocket.onclose = this.onCloseConnection;
        this.websocket.onerror = this.onErrorConnection;
        this.websocket.onmessage = this.onMessageConnection;
    }

    public disconnect(): void {
        this.logDataItem(`Disconnecting from ${this.websocketUrl}`, LogItemType.Connection);
        if (this.websocket) {
            this.websocket.close();
        }
    }
    
    public clearLogs(): void {
        this.logs = [];
        if (this.onLogItem) {
            this.onLogItem(null);
        }
    }

    public send(data: string | ArrayBufferLike | Blob | ArrayBufferView): void {
        this.logDataItem(data.toString(), LogItemType.SendData);
        if (this.websocket) {
            this.websocket.send(data);
        }
    }

    private onOpenConnection(event: Event): void {
        this.logDataItem("Connected", LogItemType.Connection);
        this.isConnected = true;
        if (this.onOpen) {
            this.onOpen("Connected");
        }
    }

    private onCloseConnection(event: CloseEvent): void {
        this.logDataItem("Disconnected", LogItemType.Connection);
        this.isConnected = false;
        if (this.onClose) {
            this.onClose(event);
        }
    }

    private onErrorConnection(event: MessageEvent<any>): void {
        this.logDataItem(event.data || "Error", LogItemType.Error);
        if (this.onError) {
            this.onError(event.data);
        }
    }

    private logDataItem(data: string, logType: LogItemType): void {
        const item: LogItem = {
            logTime: this.getTime(),
            logData: data,
            logType: logType
        };

        this.logs.unshift(item);

        if (this.onLogItem) {
            this.onLogItem(item);
        }
    }

    private onMessageConnection(event: MessageEvent<any>): void {
        this.logDataItem(event.data, LogItemType.GetData);
        if (this.onMessage) {
            this.onMessage(event);
        }
    }

    private getTime() {
        const now     = new Date();
        let hour    = now.getHours().toString();
        let minute  = now.getMinutes().toString();
        let second  = now.getSeconds().toString(); 
        let mSecond  = now.getMilliseconds().toString(); 

        if(hour.length == 1) {
            hour = '0' + hour;
        }
        if(minute.length == 1) {
            minute = '0' + minute;
        }
        if(second.length == 1) {
            second = '0' + second;
        }  
        
        return `${hour}:${minute}:${second}.${mSecond}`;
    }
}