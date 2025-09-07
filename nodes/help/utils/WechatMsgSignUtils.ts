import crypto from "crypto";
import xmlConvert from "xml-js";

class PKCS7 {
	/**
	 * Remove padding
	 */
	decode(text: Buffer) {
		let pad = text[text.length - 1]
		if (pad < 1 || pad > 32) {
			pad = 0
		}
		return text.slice(0, text.length - pad)
	}
	/**
	 * Add padding
	 */
	encode(text: string) {
		const blockSize = 32
		const textLength = text.length
		// Calculate the number of bits to pad
		const amountToPad = blockSize - (textLength % blockSize)
		const result = Buffer.alloc(amountToPad)
		result.fill(amountToPad)
		// @ts-ignore
		return Buffer.concat([text, result])
	}
}
class WechatMsgSignUtils {

	static checkSignature(token: string, signature: string, timestamp: string, nonce: string) {
		// Create an array of the token, timestamp, and nonce
		const tmpArr = [token, timestamp, nonce];

		// Sort the array in lexicographical order
		tmpArr.sort();

		// Concatenate the array into a string
		const tmpStr = tmpArr.join('');

		// Create a sha1 hash of the string
		const hash = crypto.createHash('sha1');
		hash.update(tmpStr);
		const tmpHash = hash.digest('hex');

		// Compare the calculated hash with the signature
		if (tmpHash === signature) {
			return true;
		} else {
			return false;
		}
	}

	static checkEncryptSignature(token: string, signature: string, timestamp: string, nonce: string, encrypt: string) {
		// Create an array of the token, timestamp (from URL parameters), nonce (from URL parameters), Encrypt (field in the body)
		const tmpArr = [token, timestamp, nonce, encrypt];

		// Sort the array in lexicographical order
		tmpArr.sort();

		// Concatenate the array into a string
		const tmpStr = tmpArr.join('');

		// Create a sha1 hash of the string
		const hash = crypto.createHash('sha1');
		hash.update(tmpStr);
		const tmpHash = hash.digest('hex');

		// Compare the calculated hash with the signature
		if (tmpHash === signature) {
			return true;
		} else {
			return false;
		}
	}

	static buildEncryptSignature(token: string, timestamp: string, nonce: string, encrypt: string) {
		// Create an array of the token, timestamp (from URL parameters), nonce (from URL parameters), Encrypt (field in the body)
		const tmpArr = [token, timestamp, nonce, encrypt];

		// Sort the array in lexicographical order
		tmpArr.sort();

		// Concatenate the array into a string
		const tmpStr = tmpArr.join('');

		// Create a sha1 hash of the string
		const hash = crypto.createHash('sha1');
		hash.update(tmpStr);
		return hash.digest('hex');
	}
	/**
	 * Decrypt ciphertext
	 * @param {String} text    Ciphertext to be decrypted
	 * @param encodingAESKey
	 */
	static decrypt(text: string, encodingAESKey: string) {
		let AESKey = Buffer.from(encodingAESKey + '=', 'base64')
		if (AESKey.length !== 32) {
			throw new Error('encodingAESKey invalid')
		}
		const key = AESKey
		const iv = AESKey.slice(0, 16)
		const pkcs7 = new PKCS7();
		// Create decryption object, AES uses CBC mode, data uses PKCS#7 padding; IV initial vector size is 16 bytes, take the first 16 bytes of AESKey
		const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv)
		decipher.setAutoPadding(false)

		let deciphered = Buffer.concat([decipher.update(text, 'base64'), decipher.final()])

		deciphered = pkcs7.decode(deciphered)
		// Algorithm: AES_Encrypt[random(16B) + msg_len(4B) + msg + $CorpID]
		// Remove 16-bit random number
		const content = deciphered.slice(16)
		const length = content.slice(0, 4).readUInt32BE(0)
		const message = content.slice(4, length + 4).toString()

		const xmlObject: any = xmlConvert.xml2js(message, {
			compact: true,
			instructionHasAttributes: true
		})
		const result: any = {};
		for (const key in xmlObject.xml) {
			if (xmlObject.xml[key]._cdata) {
				result[key.toLowerCase()] = xmlObject.xml[key]._cdata;
			} else if (xmlObject.xml[key]._text) {
				result[key.toLowerCase()] = xmlObject.xml[key]._text;
			}
		}

		return {
			xml: result,
			appId: content.slice(length + 4).toString()
		}
	}
	/**
	 * Encrypt plaintext
	 * Algorithm: Base64_Encode(AES_Encrypt[random(16B) + msg_len(4B) + msg + $appId])
	 * @param {String} text    Plaintext to be encrypted
	 */

	static encrypt(text: string, encodingAESKey: string, appId: string) {
		let AESKey = Buffer.from(encodingAESKey + '=', 'base64')
		if (AESKey.length !== 32) {
			throw new Error('encodingAESKey invalid')
		}
		const key = AESKey
		const iv = AESKey.slice(0, 16)
		const pkcs7 = new PKCS7();

		// 16B random string
		const randomString = crypto.pseudoRandomBytes(16)

		const msg = Buffer.from(text)
		// Get 4B content length in network byte order
		const msgLength = Buffer.alloc(4)
		msgLength.writeUInt32BE(msg.length, 0)

		const id = Buffer.from(appId)

		const bufMsg = Buffer.concat([randomString, msgLength, msg, id])

		// Perform padding operation on plaintext
		// @ts-ignore
		const encoded = pkcs7.encode(bufMsg)

		// Create encryption object, AES uses CBC mode, data uses PKCS#7 padding; IV initial vector size is 16 bytes, take the first 16 bytes of AESKey
		const cipher = crypto.createCipheriv('aes-256-cbc', key, iv)
		cipher.setAutoPadding(false)

		const cipheredMsg = Buffer.concat([cipher.update(encoded), cipher.final()])

		return cipheredMsg.toString('base64')
	}


	static encryptResponse(text: string, encodingAESKey: string, token: string,appId: string) : object{
		const encrypt = this.encrypt(text, encodingAESKey, appId)

		const timestamp = parseInt(String(Date.now() / 1000))
		const nonce = Math.random().toString().slice(2, 10)
		const msgSignature = this.buildEncryptSignature(token, timestamp.toString(), nonce, encrypt)

		return {
			Encrypt: encrypt,
			MsgSignature: msgSignature,
			TimeStamp: timestamp,
			Nonce: nonce
		}
	}
}


export default WechatMsgSignUtils;
