import * as forge from "node-forge";
import * as crypto from "crypto";

/**
 * Certificate chain and private key in PEM format.
 * May include the full certificate chain or the leaf certificate only.
 */
export interface PemCertificateAndPrivateKey {
    /**
     * Certificates will be in the following order if multiple certificates are included:
     * leaf -> intermediate -> root
     */
    certificateChain: string[];
    privateKey: string;
}

export interface CertificateElements {
    pfxCertificateAndKey: string;
    pemCertificate: string;
    pemPrivateKey: string;
    thumbprint: string;
}

export class CertificateUtils {
    public static getFullPemCertificate(pfxCertificate: string): string {
        const certElements = this.parseCertificate(pfxCertificate);
        return certElements.pemPrivateKey + certElements.pemCertificate;
    }

    private static parseCertificate(pfxCertificate: string): CertificateElements {
        const certificateAndKey = this.pfxCertificateToPem(pfxCertificate, null, 'rsa');
        const certificateThumbprint = this.computeCertificateThumbprint(certificateAndKey.certificateChain[0]);

        if (certificateAndKey.certificateChain.length <= 1) {
            throw new Error('Full certificate chain required, but is not available');
        }

        const certificate = certificateAndKey.certificateChain.join('');


        return {
            pfxCertificateAndKey: pfxCertificate,
            pemCertificate: certificate,
            pemPrivateKey: certificateAndKey.privateKey,
            thumbprint: certificateThumbprint,
        };
    }

    public static pfxCertificateToPem(pfx: string, password = null, keyType: 'rsa' | 'pkcs8' = 'rsa'): PemCertificateAndPrivateKey {
        const p12Asn1 = forge.asn1.fromDer(forge.util.decode64(pfx));
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, true, password);

        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
        const certBagArray = certBags[forge.pki.oids.certBag];
        // If the pfx includes the full certificate chain, order the certificates
        // as follows: leaf -> intermediate -> root
        const certificates = certBagArray.map(certBag => certBag.cert).reverse();

        // Make sure the leaf cert is now the first cert in the chain
        const leafCertificate = this.findLeafCertificate(certificates);
        const leafCertificateSubject = this.getCertificateSubject(leafCertificate);
        if (this.getCertificateSubject(certificates[0]) !== leafCertificateSubject) {
            throw new Error(`pfxCertificateToPem: Failed to reorder certificate chain`);
        }

        let pemCertificates = certificates.map(certificate => forge.pki.certificateToPem(certificate));

        // Remove any meta data before the actual certificate and remove any '\r' characters.
        pemCertificates = pemCertificates.map(c => c.substring(c.indexOf('-----BEGIN CERTIFICATE-----')).replace(/\r/g, ''));

        const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        const keyBagArray = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag];
        let key = keyType === 'rsa'
            ? forge.pki.privateKeyToPem(keyBagArray[0].key)
            : forge.pki.privateKeyInfoToPem(forge.pki.wrapRsaPrivateKey(forge.pki.privateKeyToAsn1(keyBagArray[0].key)));

        // remove any metadata before the actual key and trim out unwanted carriage returns
        key = key.substring(
            key.indexOf(
                keyType === 'rsa'
                    ? '-----BEGIN RSA PRIVATE KEY-----'
                    : '-----BEGIN PRIVATE KEY-----'
            )
        ).replace(/\r/g, '');

        return {
            certificateChain: pemCertificates,
            privateKey: key,
        };
    }

    private static computeCertificateThumbprint(certificate: string): string {
        const encodedCertificate = certificate.match(/-----BEGIN CERTIFICATE-----\s*([\s\S]+?)\s*-----END CERTIFICATE-----/i);
        const decodedCertificate = Buffer.from(encodedCertificate[1], 'base64');
        return crypto.createHash('sha1').update(decodedCertificate).digest('hex').toUpperCase();
    }

    private static findLeafCertificate(certificateChain: forge.pki.Certificate[]): forge.pki.Certificate {
        // parse out the subjects, issuers
        const subjects: string[] = certificateChain.map(cert => this.getCertificateSubject(cert));
        const issuers: string[] = certificateChain.map(cert => this.getCertificateIssuer(cert));

        // find subjects that have not issued any certificates
        const leafCertSubjects = subjects.filter(subject => issuers.indexOf(subject) < 0);
        if (leafCertSubjects.length !== 1) {
            throw new Error('findLeafCertificate: unable to determine leaf certificate');
        }

        return certificateChain[subjects.indexOf(leafCertSubjects[0])];
    }

    private static getCertificateSubject(certificate: forge.pki.Certificate): string {
        return certificate.subject.getField("CN").value;
    }

    private static getCertificateIssuer(certificate: forge.pki.Certificate): string {
        return certificate.issuer.getField("CN").value;
    }
}