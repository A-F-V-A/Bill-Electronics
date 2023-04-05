const crypto            = require('crypto')
const forge             = require('node-forge')
const fs                = require('fs')
const cheerio 			= require('cheerio')
const path              = require('path')

const SHA1_BASE64 = value => {
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

}

module.exports = {
	CERTICATE_DIGITAL,
	SHA1_BASE64
}

