const moment = require('moment')

/* Component */
const { 
	SignatureValue,
	CERTICATE_DIGITAL,
    firmaxml
}                 = require('./signature')


function random (){
    return Math.floor(Math.random() * 999000) + 990;
}

const SignedInfo = (SignedProperties,X509,id_comprobante,idsRandom) =>{
    return `<ds:SignedInfo Id="Signature-SignedInfo${idsRandom.SignedInfo_number}">
                <ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"></ds:CanonicalizationMethod>
                <ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"></ds:SignatureMethod>
                <ds:Reference Id="SignedPropertiesID${idsRandom.SignedPropertiesID_number}" Type="http://uri.etsi.org/01903#SignedProperties" URI="#Signature${idsRandom.Signature_number}-SignedProperties${idsRandom.SignedProperties_number}">
                    <ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></ds:DigestMethod>
                    <ds:DigestValue>${SignedProperties}</ds:DigestValue>
                </ds:Reference>
                <ds:Reference URI="#Certificate${idsRandom.Certificate_number}">
                    <ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></ds:DigestMethod>
                    <ds:DigestValue>${X509}</ds:DigestValue>
                </ds:Reference>
                <ds:Reference Id="Reference-ID-${idsRandom.Reference_ID_number}" URI="#comprobante">
                    <ds:Transforms>
                        <ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature">
                    </ds:Transform>
                    <ds:DigestMethod Algorithm=”http://www.w3.org/2000/09/xmldsig#sha1”></ds:DigestMethod>
                    <ds:DigestValue>${id_comprobante}</ds:DigestValue>
                </ds:Reference>
            </ds:SignedInfo>`
}

const KeyInfo = (X509,modulus,Certificate_number) =>{

    return `<ds:KeyInfo Id="Certificate${Certificate_number}
                <ds:X509Data>
                    <ds:X509Certificate>
                    ${X509}
                    </ds:X509Certificate>
                </ds:X509Data>
                <ds:KeyValue>
                    <ds:RSAKeyValue>
                        <ds:Modulus>
                        ${modulus}
                        </ds:Modulus>
                        <ds:Exponent>AQAB</ds:Exponent>
                    </ds:RSAKeyValue>
                </ds:KeyValue>
            </ds:KeyInfo>`

}

const SignedSignatureProperties = (hash,serial, idsRandom) =>{
    let xml = ''
    xml = `<etsi:SignedProperties Id="Signature${idsRandom.Signature_number}-SignedProperties${idsRandom.SignedProperties_number}">`
        xml +=`<etsi:SignedSignatureProperties>`
            xml +=`<etsi:SigningTime>${moment().format('YYYY-MM-DD\THH:mm:ssZ')}</etsi:SigningTime>`
            xml +=`<etsi:SigningCertificate>`
                xml += `<etsi:Cert>`    
                xml +=     `<etsi:CertDigest>`
                xml +=        `<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></ds:DigestMethod>`
                xml +=        `<ds:DigestValue>${hash}</ds:DigestValue>`
                xml +=      `</etsi:CertDigest>`
                xml +=      `<etsi:IssuerSerial>`
                xml +=         `<ds:X509IssuerName>`
                xml +=         `CN=AC BANCO CENTRAL DEL ECUADOR,L=QUITO,OU=ENTIDAD DE CERTIFICACION DE INFORMACION-ECIBCE,O=BANCO CENTRAL DEL ECUADOR,C=EC`
                xml +=         `</ds:X509IssuerName>`
                xml +=         `<ds:X509SerialNumber>${serial}</ds:X509SerialNumber>`
                xml +=       `</etsi:IssuerSerial>`
                xml += `</etsi:Cert>`
            xml += `</etsi:SigningCertificate>`
        xml +=`</etsi:SignedSignatureProperties>`
        xml +=`<etsi:SignedDataObjectProperties>
                    <etsi:DataObjectFormat ObjectReference="#Reference-ID-${idsRandom.Reference_ID_number}">
                        <etsi:Description>contenido comprobante</etsi:Description>
                        <etsi:MimeType>text/xml</etsi:MimeType>
                    </etsi:DataObjectFormat>
                </etsi:SignedDataObjectProperties>`
    xml +=`</etsi:SignedProperties>`
    
    return xml
}

function singXml(bill){

    const idsRandom = {
        Certificate_number          : random(),
        Signature_number            : random(),
        SignedProperties_number     : random(),
        SignedInfo_number           : random(),
        SignedPropertiesID_number   : random(),
        Reference_ID_number         : random(),
        SignatureValue_number       : random(),
        Object_number               : random()
    }

}