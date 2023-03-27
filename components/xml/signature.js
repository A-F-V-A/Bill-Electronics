const fs                = require('fs')
const forge             = require('node-forge')
const cheerio 			= require('cheerio');
const path              = require('path')
const {
		SignedXml,
	 	FileKeyInfo, 
	 	xpath:select 
	  }                 = require('xml-crypto')

const crypto            = require('crypto');

const sha1_base64 = value => {
	const sha1 = crypto.createHash('sha1');
	sha1.update(value);
	const hash = sha1.digest('base64');
	return hash;
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

module.exports = {
	SignatureValue,
	CERTICATE_DIGITAL
}

