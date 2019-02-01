/**
 * Client certificate
 */
export interface CertificateContract {
    id: string;
    subject: string;
    thumbprint: string;
    expirationDate: string;
}