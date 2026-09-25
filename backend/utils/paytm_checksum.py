"""
Official PaytmChecksum Implementation backed by pycryptodome.
Eliminates obsolete pycrypto dependency to guarantee seamless Linux & Render deployments.
"""
import base64
import string
import random
import hashlib
import sys

from Crypto.Cipher import AES

iv = '@@@@&&&&####$$$$'
BLOCK_SIZE = 16

if (sys.version_info > (3, 0)):
    __pad__ = lambda s: bytes(s + (BLOCK_SIZE - len(s) % BLOCK_SIZE) * chr(BLOCK_SIZE - len(s) % BLOCK_SIZE), 'utf-8')
else:
    __pad__ = lambda s: s + (BLOCK_SIZE - len(s) % BLOCK_SIZE) * chr(BLOCK_SIZE - len(s) % BLOCK_SIZE)

__unpad__ = lambda s: s[0:-ord(s[-1])]    

class PaytmChecksum:
    @staticmethod
    def encrypt(input_text, key):
        padded = __pad__(input_text)
        c = AES.new(key.encode("utf8"), AES.MODE_CBC, iv.encode("utf8"))
        encrypted = c.encrypt(padded)
        return base64.b64encode(encrypted).decode("UTF-8")

    @staticmethod
    def decrypt(encrypted_text, key):
        decoded = base64.b64decode(encrypted_text)
        c = AES.new(key.encode("utf8"), AES.MODE_CBC, iv.encode("utf8"))
        param = c.decrypt(decoded)
        if isinstance(param, bytes):
            param = param.decode()
        return __unpad__(param)

    @classmethod
    def generateSignature(cls, params, key):
        if not isinstance(params, (dict, str)):
            raise Exception("string or dict expected, " + str(type(params)) + " given")
        if isinstance(params, dict):
            params = cls.getStringByParams(params)
        return cls.generateSignatureByString(params, key)

    @classmethod
    def verifySignature(cls, params, key, checksum):
        if not isinstance(params, (dict, str)):
            raise Exception("string or dict expected, " + str(type(params)) + " given")
        if isinstance(params, dict) and "CHECKSUMHASH" in params:
            del params["CHECKSUMHASH"]
            
        if isinstance(params, dict):
            params = cls.getStringByParams(params)
        return cls.verifySignatureByString(params, key, checksum)

    @classmethod
    def generateSignatureByString(cls, params, key):    
        salt = cls.generateRandomString(4)
        return cls.calculateChecksum(params, key, salt)

    @classmethod
    def verifySignatureByString(cls, params, key, checksum):
        paytm_hash = cls.decrypt(checksum, key)    
        salt = paytm_hash[-4:]
        return paytm_hash == cls.calculateHash(params, salt)

    @staticmethod
    def generateRandomString(length):
        chars = string.ascii_uppercase + string.digits + string.ascii_lowercase
        return ''.join(random.choice(chars) for _ in range(length))

    @staticmethod
    def getStringByParams(params):
        params_string = []
        for key in sorted(params.keys()):
            val = params[key]
            value = val if val is not None and str(val).lower() != "null" else ""
            params_string.append(str(value))
        return '|'.join(params_string)

    @staticmethod
    def calculateHash(params, salt):    
        final_str = f"{params}|{salt}"
        hasher = hashlib.sha256(final_str.encode())
        return hasher.hexdigest() + salt

    @classmethod
    def calculateChecksum(cls, params, key, salt): 
        hash_str = cls.calculateHash(params, salt)
        return cls.encrypt(hash_str, key)
