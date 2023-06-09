'use strict';

/** @type {dw.util.Bytes} */
var Bytes = require('dw/util/Bytes');
/** @type {dw.util.Calendar} */
var Calendar = require('dw/util/Calendar');
/** @type {dw.crypto.Encoding} */
var Encoding = require('dw/crypto/Encoding');
/** @type {dw.io.File} */
var File = require('dw/io/File');
/** @type {dw.net.HTTPClient} */
var HTTPClient = require('dw/net/HTTPClient');
/** @type {dw.system.Logger} */
var logger = require('./libS3/logger').getLogger();
/** @type {dw.crypto.Mac} */
var Mac = require('dw/crypto/Mac');
/** @type {dw.crypto.MessageDigest} */
var MessageDigest = require('dw/crypto/MessageDigest');
/** @type {dw.io.RandomAccessFileReader} */
var RandomAccessFileReader = require('dw/io/RandomAccessFileReader');
/** @type {dw.util.StringUtils} */
var StringUtils = require('dw/util/StringUtils');
/** @type {S3FileInfo} */
var S3FileInfo = require('./libS3/S3FileInfo');
/** @type {Function} */
var parseUri = require('./libS3/libUrl.js').parseUri;

// S3 Transfer Client Settings
/**
 * @todo fix poor usage of not quite constants and also constants for things that should be instance variables.
 */
var ACCESSKEY;
var ALGORITHM = 'AWS4-HMAC-SHA256';
var AWSREGION;
var AWSSERVICE = 's3';
var BUCKETNAME;
var CANONICALQUERYSTRING = encodeURI('');
var CONTENTTYPE;
var CREDENTIALSCOPE = '';
var DELIMITER = '/';
var DATESTAMP = StringUtils.formatCalendar(new Calendar(), 'yyyyMMdd');
var ENDPOINT = 'https://{{bucket}}.s3.amazonaws.com/';
var HOST = '{{bucket}}.s3.amazonaws.com';
var PREFIX = '';
var REMOTEFOLDER; // This var doesn't even seem to be used!
var SECRETACCESSKEY;
var SIGNEDHEADERS = 'host;x-amz-content-sha256;x-amz-date';
var SIGNINGKEY = '';
var STRINGTOSIGN = '';
var TIMEOUT;

/**
 * S3TransferClient provides an interface for reading, writing and deleting files from Amazon's Simple Storage Service (S3)
 *
 * @class
 *
 * @param {String} bucketName
 * @param {String} accessKey
 * @param {String} secretAccessKey
 * @param {String} region
 * @param {String} contentType
 * @param {Number} timeout
 * @param {String} remoteFolder
 *
 * @todo fix use of private 'constants' as setting variables
 */
function S3TransferClient (bucketName, accessKey, secretAccessKey, region, contentType, timeout, remoteFolder) {
    ACCESSKEY = accessKey;
    AWSREGION = region;
    BUCKETNAME = bucketName;
    CONTENTTYPE = contentType;
    REMOTEFOLDER = remoteFolder;
    SECRETACCESSKEY = secretAccessKey;
    TIMEOUT = timeout;

    // Initialize the transfer client
    init(bucketName, secretAccessKey);
    this.urlObject = parseUri(ENDPOINT + REMOTEFOLDER); // this urlObject variable is _NEVER USED AGAIN!_
}

/**
 * Initializes the settings for the S3 transfer client
 *
 * @param {String} bucketName
 * @param {String} secretAccessKey
 * @todo fix use of private 'constants' as setting variables
 */
function init (bucketName, secretAccessKey) {
    CREDENTIALSCOPE = getCredentialScope(DATESTAMP, AWSREGION, AWSSERVICE);
    ENDPOINT = ENDPOINT.replace('{{bucket}}', bucketName);
    HOST = HOST.replace('{{bucket}}', bucketName);
    SIGNINGKEY = getSignatureKey(secretAccessKey, DATESTAMP, AWSREGION, AWSSERVICE);
};

/**
 * Retrieves the passed file/directory
 *
 * @param {String} fullFileName
 * @param {File} localFile (dw.io.File)
 */
S3TransferClient.prototype.getBinary = function (fullFileName, localFile) {
    var response = execute('GET', fullFileName, null, localFile);

    if (response.statusCode === 200) {
        return true;
    } else {
        logger.error('S3TransferClient.ds: Unable to download [{0}]. An error occurred with status code [{1}] and error text [{2}]', fullFileName, response.statusCode, response.errorText);
        return false;
    }
};

/**
 * Delivers the passed file/directory
 *
 * @param {String} fullFileName
 * @param {File} localFile
 * @returns {Boolean}
 */
S3TransferClient.prototype.putBinary = function (fullFileName, localFile) {
    var response = execute('PUT', fullFileName, localFile, null);

    if (response.statusCode === 200) {
        return true;
    } else {
        logger.error('S3TransferClient.ds: Unable to upload [{0}]. An error occurred with status code [{1}] and error text [{2}]', fullFileName, response.statusCode, response.errorText);
        return false;
    }
};

/**
 * Deletes the remote file
 *
 * @param {String} fullFileName
 * @returns {Boolean}
 */
S3TransferClient.prototype.del = function (fullFileName) {
    var response = execute('DELETE', fullFileName, null, null);

    if (response.statusCode === 200 || response.statusCode === 204) {
        return true;
    } else {
        logger.error('S3TransferClient.ds: Unable to delete [{0}]. An error occurred with status code [{1}] and error text [{2}]', fullFileName, response.statusCode, response.errorText);
        return false;
    }
};

/**
 * Retrieves the contents of the provided path on S3
 *
 * @param {String} path
 * @param {Boolean} fileBool True -> get files / False -> get directory
 * @param {String} marker optional (marker for next file after 1000 max keys)
 * @returns {S3FileInfo[]} Collection of {@link S3FileInfo} objects for each file in the path
 */
S3TransferClient.prototype.list = function (path, fileBool, marker) {
    var response;
    var xml;
    var contents;
    var fileInfo;
    var truncated;
    var nextMarker;
    var listDetail = [];
    var commonPrefixes;
    var prefix;
    var filename;
    var qName;
    var ns;
    var obj = {};

    // Make call
    response = execute('GET', path, null, null, marker);

    // Parse response
    if (response !== null && response.statusCode == 200) {
        xml = new XML(response.text);
        ns = xml.namespace();

        qName = function (name) {
            return new QName(ns, name);
        };

        contents = xml.child(qName('Contents'));
        commonPrefixes = xml.child(qName('CommonPrefixes'));
        truncated = xml.child(qName('IsTruncated')).toString();
        nextMarker = xml.child(qName('NextMarker')).toString();

        if (fileBool) {
            // Loop through content nodes in response
            for (var i = 0; i < contents.length(); i++) {
                fileInfo = new S3FileInfo();
                filename = contents[i].child(qName('Key'));
                if (!isKeyADirectory((filename).toString(), DELIMITER)) {
                    // Current directory is included in response, so we skip over it.
                    fileInfo.setDirectory(false);
                    fileInfo.setName((filename).toString());
                    fileInfo.setStandardizedFilename((filename).toString(), DELIMITER);
                    fileInfo.setTimestamp(new Date((contents[i].child(qName('LastModified'))).toString()));
                    fileInfo.setSize((contents[i].child(qName('Size'))).toString());

                    listDetail.push(fileInfo);
                }
            }
        } else {
            // Include 'sub-directories' listed within common prefixes node
            for (var j = 0; j < commonPrefixes.length(); j++) {
                fileInfo = new S3FileInfo();
                fileInfo.setDirectory(true);
                fileInfo.setName((commonPrefixes[j].child(qName('Prefix'))).toString());
                // fileInfo.setTimestamp(new Date((commonPrefixes[j].child(qName('LastModified'))).toString()));
                // fileInfo.setSize((commonPrefixes[j].child(qName('Size'))).toString());
                listDetail.push(fileInfo);
            }
        }

        obj.listDetail = listDetail;
        obj.truncated = JSON.parse(truncated);
        obj.nextMarker = nextMarker;

        return obj;
    } else {
        // Error handling
        logger.error('S3TransferClient.ds: Unable to list path [{0}]. An error occurred with status code [{1}] and error text [{2}]', path, response.statusCode, response.errorText);
        return null;
    }
};

/**
 * Perform the AWS call and return the HTTPClient used.
 *
 * @param {String} httpMethod
 * @param {String} fullPath
 * @param {File} outGoingFile
 * @param {File} incomingFile
 * @returns {HTTPClient} (dw.net.HTTPClient)
 *
 * @todo fix use of private 'constants' as setting variables
 */
function execute (httpMethod, fullPath, outGoingFile, incomingFile, marker) {
    /** @type {String} */
    var authorizationHeader = '';
    /** @type {String} */
    var canonicalHeaders = '';
    /** @type {String} */
    var canonicalRequest = '';
    /** @type {String} */
    var canonicalURI = '';
    /** @type {HTTPClient} */
    var httpClient = new HTTPClient();
    /** @type {String} */
    var payloadHash = '';
    /** @type {String} */
    var signature = '';
    /** @type {String} */
    var stringToSign = '';
    /** @type {String} */
    var methodEndpoint = '';
    /** @type {Mac} */
    var hmac = new Mac(Mac.HMAC_SHA_256);

    // Create payload hash
    if (outGoingFile !== null) {
        // Sending files requires a hash of the file to be submitted.
        payloadHash = getPayloadHash(outGoingFile);
    } else {
        // A standard GET request, with no payload, submits a hashed empty string
        payloadHash = getPayloadHash('');
    }

    var DATETIMESTAMP = StringUtils.formatCalendar(new Calendar(), "yyyyMMdd'T'HHmmss'Z'");

    // Create the canonical headers
    canonicalHeaders = getCanonicalHeaders(httpMethod, HOST, payloadHash, DATETIMESTAMP);

    // Set signed headers
    SIGNEDHEADERS = getSignedHeaders(httpMethod);

    // If we're requesting a path, the prefix needs to be set
    if (fullPath.lastIndexOf('.') !== fullPath.length - 4 && fullPath.lastIndexOf('.') !== fullPath.length - 5) {
        PREFIX = fullPath;
        canonicalURI = '/';
    } else {
        PREFIX = '';
        canonicalURI = '/' + fullPath;
    }

    // Set the canonicalQueryString
    setCanonicalQueryString(httpMethod, PREFIX, DELIMITER, marker);

    // Create the canonical request
    canonicalRequest = getCanonicalRequest(httpMethod, canonicalURI, CANONICALQUERYSTRING, canonicalHeaders, SIGNEDHEADERS, payloadHash);

    // Get the string to sign
    stringToSign = getStringToSign(ALGORITHM, DATETIMESTAMP, CREDENTIALSCOPE, canonicalRequest);

    // Generate Signature
    signature = Encoding.toHex(hmac.digest(stringToSign, SIGNINGKEY));

    // Create authorization header
    authorizationHeader = getAuthorizationHeader(ALGORITHM, ACCESSKEY, CREDENTIALSCOPE, SIGNEDHEADERS, signature);

    // Get the correct endpoint for the method/path/querystring
    methodEndpoint = createEndpoint(httpMethod, fullPath, CANONICALQUERYSTRING);

    // Setup connection
    httpClient.open(httpMethod, methodEndpoint);
    httpClient.setTimeout(TIMEOUT);
    httpClient.setRequestHeader('content-type', CONTENTTYPE);
    httpClient.setRequestHeader('x-amz-content-sha256', payloadHash);
    httpClient.setRequestHeader('x-amz-date', DATETIMESTAMP);
    httpClient.setRequestHeader('Authorization', authorizationHeader);

    // Sending files requires the content-length header to be set
    if (outGoingFile !== null) {
        httpClient.setRequestHeader('Content-Length', outGoingFile.length());
    }

    // Make the request
    if (httpMethod === 'PUT') {
        httpClient.send(outGoingFile);
    } else {
        if (empty(incomingFile)) {
            // GET/DELETE requests (e.g. directory listing/delete a file)
            httpClient.send();
        } else {
            // GET request & receive file (e.g. request a file)
            httpClient.sendAndReceiveToFile(null, incomingFile);
        }
    }

    return httpClient;
}

/**
 * Creates the AWS signing key
 *
 * @param {String} key
 * @param {String} dateStamp
 * @param {String} regionName
 * @param {String} serviceName
 * @returns {String} The Signing Key to use for authorization.
 */
function getSignatureKey (key, dateStamp, regionName, serviceName) {
    /** @type {Bytes} */
    var signedDate;
    /** @type {Bytes} */
    var signedRegion;
    /** @type {Bytes} */
    var signedService;
    /** @type {Bytes} */
    var signingKey;
    /** @type {String} */
    var awsKey = 'AWS4' + key;

    signedDate = sign(awsKey, dateStamp);
    signedRegion = sign(signedDate, regionName);
    signedService = sign(signedRegion, serviceName);
    signingKey = sign(signedService, 'aws4_request');

    return signingKey;
};

/**
 * Signs the passed message using the passed key. key can be either {String} or {Bytes}
 *
 * @param {(String|Bytes)} key
 * @param {String} msg
 * @returns {String} The SHA256 Key for the given key & message.
 */
function sign (key, msg) {
    var hmac = new Mac(Mac.HMAC_SHA_256);

    return hmac.digest(msg, key);
};

function getPayloadHash (payload) {
    /* @type {MessageDigest} */
    var messageDigest = new MessageDigest(MessageDigest.DIGEST_SHA_256);
    /* @type {Bytes} */
    var payloadHash;
    /* @type {RandomAccessFileReader} */
    var fileReader;
    /* @type {Bytes} */
    var currentByte;

    // GET requests will pass an instance of string, PUT requests will send File
    if (typeof payload === 'string') {
        payloadHash = messageDigest.digestBytes(new Bytes(payload));

        return Encoding.toHex(payloadHash);
    } else if (payload instanceof File) {
        fileReader = new RandomAccessFileReader(payload);

        while ((currentByte = fileReader.readBytes(1)) !== null) {
            messageDigest.updateBytes(currentByte);
        };
        fileReader.close();
        return Encoding.toHex(messageDigest.digest());
    }
};

/**
 * Returns the aws formatted canonical headers
 *
 * @param {String} httpMethod
 * @param {String} host
 * @param {String} payloadHash
 * @param {String} date
 * @returns {String} Multi-line String of Canonical headers
 *
 * @todo fix use of private 'constants' as setting variables
 */
function getCanonicalHeaders (httpMethod, host, payloadHash, date) {
    /** @type {String} */
    var canonicalHeaders = 'host:' + host + '\n' +
                            'x-amz-content-sha256:' + payloadHash + '\n' +
                            'x-amz-date:' + date + '\n';
    if (httpMethod === 'GET') {
        canonicalHeaders = 'content-type:' + CONTENTTYPE + '\n' + canonicalHeaders;
    }

    return canonicalHeaders;
};

/**
 * Returns the aws formatted signed headers
 *
 * @param {String} httpMethod
 * @returns {String} Appropriate headers
 */
function getSignedHeaders (httpMethod) {
    /** @type {String} */
    var signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

    if (httpMethod === 'GET') {
        signedHeaders = 'content-type;' + signedHeaders;
    }

    return signedHeaders;
}

/**
 * Returns the aws formatted canonical request
 *
 * @param {String} httpMethod
 * @param {String} canonicalURI
 * @param {String} canonicalQueryString
 * @param {String} canonicalHeaders
 * @param {String} signedHeaders
 * @param {String} payloadHash
 * @returns {String} Multi-line HTTP request headers
 */
function getCanonicalRequest (httpMethod, canonicalURI, canonicalQueryString, canonicalHeaders, signedHeaders, payloadHash) {
    /** @type {String} */
    var canonicalRequest = httpMethod + '\n' +
                            canonicalURI + '\n' +
                            canonicalQueryString + '\n' +
                            canonicalHeaders + '\n' +
                            signedHeaders + '\n' +
                            payloadHash;

    return canonicalRequest;
};

/**
 * Returns the aws formatted credential scope
 *
 * @param {String} dateStamp
 * @param {String} awsRegion
 * @param {String} awsService
 * @returns {String}
 */
function getCredentialScope (dateStamp, awsRegion, awsService) {
    return dateStamp + '/' +
            awsRegion + '/' +
            awsService + '/' +
            'aws4_request';
};

/**
 * Create the string to sign
 *
 * @param {String} algorithm
 * @param {String} dateTimeStamp
 * @param {String} credentialScope
 * @param {String} canonicalRequest
 * @returns {String}
 */
function getStringToSign (algorithm, dateTimeStamp, credentialScope, canonicalRequest) {
    /** @type {MessageDigest} */
    var messageDigest = new MessageDigest(MessageDigest.DIGEST_SHA_256);

    return algorithm + '\n' +
            dateTimeStamp + '\n' +
            credentialScope + '\n' +
            Encoding.toHex(messageDigest.digestBytes(new Bytes(canonicalRequest)));
};

/**
 * Create the authorization header
 *
 * @param {String} algorithm
 * @param {String} dateTimeStamp
 * @param {String} credentialScope
 * @param {String} canonicalRequest
 * @returns {String} authorization header
 */
function getAuthorizationHeader (algorithm, accessKeyId, credentialScope, signedHeaders, signature) {
    /** @type {String} */
    var authorizationHeader = algorithm + ' ' +
                                'Credential=' + accessKeyId + '/' + credentialScope + ',' +
                                'SignedHeaders=' + signedHeaders + ',' +
                                'Signature=' + signature;

    return authorizationHeader;
};

/**
 * Encode slashes
 *
 * @param {String} input
 * @returns {String}
 */
function encodeSlash (input) {
    return input.replace(/\//g, '%2F');
}

/**
 * Parses the AWS key (file key)
 *
 * @param {String} key
 * @param {String} delimiter
 * @returns {Boolean}
 */
function isKeyADirectory (key, delimiter) {
    /** @type {Number} */
    var lastOccurence = key.lastIndexOf(delimiter);

    // Delimiter at the end === a directory
    if (lastOccurence === (key.length - 1)) {
        return true;
    } else {
        return false;
    }
};

/**
 * Creates the endpoint connection string
 *
 * @param {String} httpMethod
 * @param {String} fullPath
 * @param {String} canonicalQueryString
 * @returns {String}
 *
 * @todo fix use of private 'constants' as setting variables
 */
function createEndpoint (httpMethod, fullPath, canonicalQueryString) {
    /** @type {String} */
    var methodEndpoint = '';

    // Generate the correct endpoint for the passed method/path/file
    switch (httpMethod) {
    case 'GET':
        if (fullPath.lastIndexOf('.') !== fullPath.length - 4 && fullPath.lastIndexOf('.') !== fullPath.length - 5) {
            methodEndpoint = ENDPOINT + '?' + canonicalQueryString;
        } else {
            methodEndpoint = ENDPOINT + fullPath;
        }
        break;
    case 'PUT':
        methodEndpoint = ENDPOINT + fullPath;
        methodEndpoint = (canonicalQueryString !== '') ? methodEndpoint + '?' + canonicalQueryString : methodEndpoint;
        break;
    case 'DELETE':
        methodEndpoint = ENDPOINT + fullPath;
        break;
    default:
        throw new Error('Unsupported HTTP Method');
        break;
    }

    return methodEndpoint;
}

/**
 * Sets up the canonical query string
 *
 * @param {String} httpMethod
 * @param {String} prefix
 * @param {String} delimiter
 * @returns {String}
 *
 * @todo fix use of private 'constants' as setting variables
 */
function setCanonicalQueryString (httpMethod, prefix, delimiter, marker) {
    switch (httpMethod) {
    case 'GET':
        if (prefix !== '' && delimiter !== '') {
            CANONICALQUERYSTRING = 'delimiter=' + delimiter + ((empty(marker)) ? '' : '&marker=' + marker) + '&prefix=' + prefix;
            // Slashes need to be encoded for the signature to match Amazon's
            CANONICALQUERYSTRING = (delimiter === '/') ? encodeSlash(CANONICALQUERYSTRING) : CANONICALQUERYSTRING;
        } else {
            CANONICALQUERYSTRING = '';
        }
        break;
    case 'PUT':
        CANONICALQUERYSTRING = '';
        break;
    case 'DELETE':
        CANONICALQUERYSTRING = '';
        break;
    }

    return CANONICALQUERYSTRING;
}

/** @module int_s3/S3TransferClient */
module.exports = S3TransferClient;
