export interface ResetRequest {
    solution: string,
    token: string,
    type: string,
    flowId: string,
    email: string
}

export interface ResetPassword {
    userid: string,
    ticketid: string,
    ticket: string,
    password: string
}