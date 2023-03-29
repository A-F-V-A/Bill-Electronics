const moment = require('moment')


function random (){
    return Math.floor(Math.random() * 999000) + 990;
}

const SignedInfo = () =>{

    return `
    
    
    `
}

const SignedSignatureProperties = (hash,serial) =>{
    let xml = ''
    const Signature_number        = random()
    const SignedProperties_number = random()
    const Reference_ID_number     = random()
    xml = `<etsi:SignedProperties Id="Signature${Signature_number}-SignedProperties${SignedProperties_number}">`
        xml +=`<etsi:SignedSignatureProperties>`
            xml +=`<etsi:SigningTime>${moment().format('YYYY-MM-DD\THH:mm:ssZ')}</etsi:SigningTime>`
            xml +=`<etsi:SigningCertificate>
                        <etsi:Cert>
                            <etsi:CertDigest>
                                <ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></ds:DigestMethod>
                                <ds:DigestValue>
                                ${hash}
                                </ds:DigestValue>
                            </etsi:CertDigest>
                            <etsi:IssuerSerial>
                                <ds:X509IssuerName>
                                CN=AC BANCO CENTRAL DEL ECUADOR,L=QUITO,OU=ENTIDAD DE CERTIFICACION DE INFORMACION-ECIBCE,O=BANCO CENTRAL DEL ECUADOR,C=EC
                                </ds:X509IssuerName>
                                <ds:X509SerialNumber>${serial}</ds:X509SerialNumber>
                            </etsi:IssuerSerial>
                        </etsi:Cert>
                    </etsi:SigningCertificate>`
        xml +=`</etsi:SignedSignatureProperties>`
        xml +=`<etsi:SignedDataObjectProperties>
                    <etsi:DataObjectFormat ObjectReference="#Reference-ID-${Reference_ID_number}">
                        <etsi:Description>contenido comprobante</etsi:Description>
                        <etsi:MimeType>text/xml</etsi:MimeType>
                    </etsi:DataObjectFormat>
                </etsi:SignedDataObjectProperties>`
    xml +=`</etsi:SignedProperties`
    
    
    
}