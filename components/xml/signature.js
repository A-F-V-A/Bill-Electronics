const crypto            = require('crypto');
const forge             = require('node-forge')
const fs                = require('fs')
const cheerio 			= require('cheerio');
const path              = require('path')
const {
	SignedXml,
	FileKeyInfo, 
	xpath:select 
	}                 = require('xml-crypto')


<<<<<<< HEAD
const sha1_base64 = value => {
	const sha1 = crypto.createHash('sha1'); //sha256
	sha1.update(value);
	const hash = sha1.digest('base64');
	return hash;
=======
const  SHA1_BASE64 = value => {
	const sha1 = crypto.createHash('sha1')
	sha1.update(value)
	const hash = sha1.digest('base64')
	return hash
}

const CERTICATE_DIGITAL = (password,sinature) =>{

	return new Promise ((resolve, reject) =>{
		try{
			const arrayUint8 = new Uint8Array(sinature)
			const p12B64     = forge.util.binary.base64.encode(arrayUint8)
			const p12Der     = forge.util.decode64(p12B64)
			const p12Asn1    = forge.asn1.fromDer(p12Der)
			const p12 	     = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password)

			const bags    = p12.getBags({ bagType: forge.pki.oids.certBag })
			const certBag = bags[forge.pki.oids.certBag][0]
			const cert 	  = certBag.cert

			const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })
			const keyBag  = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0]
			const key 	  = keyBag.key

			const certPem 		= forge.pki.certificateToPem(cert)
			const privateKeyPem = forge.pki.privateKeyToPem(key)
			const publicKeyPem  = forge.pki.publicKeyToPem(cert.publicKey)

			const X509DER  = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes()
			const X509HASH = SHA1_BASE64(X509DER)



			resolve({
				CERT_PEM 		: certPem,
				PRIVATE_KEY_PEM : privateKeyPem,
				PUBLIC_KEY_PEM	: publicKeyPem,
				CERT : cert,
				KEY  : key,
				X509DER,
				X509HASH
			})
		}catch(err){
			reject(err)
		}
	})

>>>>>>> 7c5fa3fe9a7f79412c5b6f869a7e44d5c06bab1d
}

const SignatureValue = (privateKey,publicKey,xml) => {

	return new Promise ((resolve,reject)=>{
		try{
			const signedXml = new SignedXml()
			signedXml.signingKey = privateKey

			signedXml.addReference("//*[local-name(.)='SignedInfo']", ["http://www.w3.org/2000/09/xmldsig#enveloped-signature"], "http://www.w3.org/2000/09/xmldsig#sha1", "", "", "", true)

			// Establecer el algoritmo de firma XAdES_BES y el esquema 1.3.2
			signedXml.signatureAlgorithm = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1'
			signedXml.canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
			signedXml.signatureNamespacePrefix = 'ds'
		
			// Establecer el certificado en el objeto SignedXml
			signedXml.keyInfoProvider = new FileKeyInfo(publicKey);
		
			// Establecer el método de transformación y canonicalización a utilizar
			signedXml.canonicalizationTransformations = ['http://www.w3.org/2000/09/xmldsig#enveloped-signature']

			signedXml.computeSignature(xml)

			const txt = signedXml.getSignedXml().toString()
			const $ = cheerio.load(txt, { xmlMode: true })
			

			resolve($('SignatureValue').text())

		}catch(err){
			reject(err)
		}
	})
}

<<<<<<< HEAD
const SignatureValueExample = (privateKey,publicKey) => {

	return new Promise ((resolve,reject)=>{
		try{
			const signedXml = new SignedXml()
			signedXml.signingKey = privateKey

			signedXml.addReference("//*[local-name(.)='SignedInfo']", ["http://www.w3.org/2000/09/xmldsig#enveloped-signature"], "http://www.w3.org/2000/09/xmldsig#sha1", "", "", "", true)

			// Establecer el algoritmo de firma XAdES_BES y el esquema 1.3.2
			signedXml.signatureAlgorithm = 'http://www.w3.org/2000/09/xmldsig#rsa-sha1'
			signedXml.canonicalizationAlgorithm = 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
			signedXml.signatureNamespacePrefix = 'ds'
		
			// Establecer el certificado en el objeto SignedXml
			signedXml.keyInfoProvider = new FileKeyInfo(publicKey);
		
			// Establecer el método de transformación y canonicalización a utilizar
			signedXml.canonicalizationTransformations = ['http://www.w3.org/2000/09/xmldsig#enveloped-signature']

			const xml = `<ds:SignedInfo Id="Signature-SignedInfo535208">
<ds:CanonicalizationMethod Algorithm="http://www.w3.org/TR/2001/REC-xml-c14n-20010315"></ds:CanonicalizationMethod>
<ds:SignatureMethod Algorithm="http://www.w3.org/2000/09/xmldsig#rsa-sha1"></ds:SignatureMethod>
<ds:Reference Id="SignedPropertiesID958530" Type="http://uri.etsi.org/01903#SignedProperties" URI="#Signature377306-SignedProperties961724">
<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></ds:DigestMethod>
<ds:DigestValue>EraiinGZfyX2PuPAFeLmm22MMo4=</ds:DigestValue>
</ds:Reference>
<ds:Reference URI="#Certificate1238044">
<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></ds:DigestMethod>
<ds:DigestValue>stH2jgSQDq/SUVHyAoPwmZFfnFc=</ds:DigestValue>
</ds:Reference>
<ds:Reference Id="Reference-ID-327616" URI="#comprobante">
<ds:Transforms>
<ds:Transform Algorithm="http://www.w3.org/2000/09/xmldsig#enveloped-signature"></ds:Transform>
</ds:Transforms>
<ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></ds:DigestMethod>
<ds:DigestValue>9wGz2AiNcYkmQNc2NvGcS+3CeTE=</ds:DigestValue>
</ds:Reference>
</ds:SignedInfo>`

console.log(xml)



			signedXml.computeSignature(xml)

			const txt = signedXml.getSignedXml().toString()
			const $ = cheerio.load(txt, { xmlMode: true })
			

			resolve($('SignatureValue').text())

		}catch(err){
			reject(err)
		}
	})
}

const password = '13061994'
const p12      = fs.readFileSync(path.join(__dirname, `../../ANDRES_PAUL_JARAMILLO_VACA_270622123005.p12`))

const CERTICATE_DIGITAL = (password,sinature) =>{

	return new Promise ((resolve, reject) =>{
		try{
			const arrayUint8 = new Uint8Array(sinature)
			const p12B64     = forge.util.binary.base64.encode(arrayUint8)
			const p12Der     = forge.util.decode64(p12B64)
			const p12Asn1    = forge.asn1.fromDer(p12Der)
			const p12 	     = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password)

			const bags    = p12.getBags({ bagType: forge.pki.oids.certBag })
			const certBag = bags[forge.pki.oids.certBag][0]
			const cert 	  = certBag.cert

			const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag })
			const keyBag  = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0]
			const key 	  = keyBag.key

			const certPem 		= forge.pki.certificateToPem(cert)
			const privateKeyPem = forge.pki.privateKeyToPem(key)
			const publicKeyPem  = forge.pki.publicKeyToPem(cert.publicKey)

			const X509DER  = forge.asn1.toDer(forge.pki.certificateToAsn1(cert)).getBytes()
			const X509HASH = sha1_base64(X509DER)



			resolve({
				CERT_PEM 		: certPem,
				PRIVATE_KEY_PEM : privateKeyPem,
				PUBLIC_KEY_PEM	: publicKeyPem,
				CERT : cert,
				KEY  : key,
				X509DER,
				X509HASH
			})
		}catch(err){
			reject(err)
		}
	})

}

CERTICATE_DIGITAL(password,p12).then(({PRIVATE_KEY_PEM,PUBLIC_KEY_PEM}) =>{
	// Leemos la clave privada del archivo PEM
const privateKey = PRIVATE_KEY_PEM

// Creamos un objeto Signer con la clave privada
const signer = crypto.createSign('RSA-SHA256');
const txtt = `<etsi:SignedProperties Id="Signature377306-SignedProperties961724"><etsi:SignedSignatureProperties><etsi:SigningTime>2023-03-09T10:26:37-05:00</etsi:SigningTime><etsi:SigningCertificate><etsi:Cert><etsi:CertDigest><ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></ds:DigestMethod><ds:DigestValue>l8boO4xWx0heW0LB3/NqmFv25Nw=</ds:DigestValue></etsi:CertDigest><etsi:IssuerSerial><ds:X509IssuerName>CN=AUTORIDAD DE CERTIFICACION SUBCA-2 SECURITY DATA,OU=ENTIDAD DE CERTIFICACION DE INFORMACION,O=SECURITY DATA S.A. 2,C=EC</ds:X509IssuerName><ds:X509SerialNumber>1133589320</ds:X509SerialNumber></etsi:IssuerSerial></etsi:Cert></etsi:SigningCertificate></etsi:SignedSignatureProperties><etsi:SignedDataObjectProperties><etsi:DataObjectFormat ObjectReference="#Reference-ID-327616"><etsi:Description>Doc</etsi:Description><etsi:MimeType>text/xml</etsi:MimeType></etsi:DataObjectFormat></etsi:SignedDataObjectProperties></etsi:SignedProperties>`
signer.write(`<etsi:SignedProperties Id="Signature377306-SignedProperties961724"><etsi:SignedSignatureProperties><etsi:SigningTime>2023-03-09T10:26:37-05:00</etsi:SigningTime><etsi:SigningCertificate><etsi:Cert><etsi:CertDigest><ds:DigestMethod Algorithm="http://www.w3.org/2000/09/xmldsig#sha1"></ds:DigestMethod><ds:DigestValue>l8boO4xWx0heW0LB3/NqmFv25Nw=</ds:DigestValue></etsi:CertDigest><etsi:IssuerSerial><ds:X509IssuerName>CN=AUTORIDAD DE CERTIFICACION SUBCA-2 SECURITY DATA,OU=ENTIDAD DE CERTIFICACION DE INFORMACION,O=SECURITY DATA S.A. 2,C=EC</ds:X509IssuerName><ds:X509SerialNumber>1133589320</ds:X509SerialNumber></etsi:IssuerSerial></etsi:Cert></etsi:SigningCertificate></etsi:SignedSignatureProperties><etsi:SignedDataObjectProperties><etsi:DataObjectFormat ObjectReference="#Reference-ID-327616"><etsi:Description>Doc</etsi:Description><etsi:MimeType>text/xml</etsi:MimeType></etsi:DataObjectFormat></etsi:SignedDataObjectProperties></etsi:SignedProperties>`);
signer.end();

// Generamos la firma digital
const signature = signer.sign(privateKey, 'base64');
console.log(sha1_base64(txtt))
console.log('Firma digital:', signature);


}).catch(err => console.error(err))


const firmaxml = (xml,Key) =>{



	const privateKey = crypto.generateKeyPairSync('rsa', {
		modulusLength: 2048,
		privateKeyEncoding: {
			type: 'pkcs1',
			format: 'pem'
		}
	}).Key;
	
	// Creamos un mensaje de ejemplo
	const message = xml
	
	// Creamos un objeto 'Sign' para firmar el mensaje con la clave privada
	const sign = crypto.createSign('RSA-SHA1');
	sign.write(message);
	sign.end();
	
	// Generamos la firma digital del mensaje
	const signature = sign.sign(Key, 'base64');
	
	console.log('Mensaje original: ', message);
	console.log('signature: ', signature);
	return signature
}

module.exports = {
	SignatureValue,
	CERTICATE_DIGITAL,
	firmaxml
=======
module.exports = {
	SignatureValue,
	CERTICATE_DIGITAL
>>>>>>> 7c5fa3fe9a7f79412c5b6f869a7e44d5c06bab1d
}

