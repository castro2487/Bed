'use strict';

/* API Includes */
var Logger = require('dw/system/Logger').getLogger('custom.job.S3Transfer');
var Status = require('dw/system/Status');
var S3TransferClient = require('~/cartridge/models/S3TransferClient');
var Site = require('dw/system/Site');
var Transaction = require('dw/system/Transaction');

var s3Transfer = function () {
    try {
        Logger.info('Starting S3Transfer job...');

        var errorFlow = false;

        // check if global parameters is empty
        var args = arguments[0];
        if (empty(args.bucketName) || empty(args.accessKey) || empty(args.secretAccessKey) || empty(args.region) || empty(args.contentType) || empty(args.timeout) || empty(args.remoteFolder) || empty(args.RootDirectoryWebDav)) {
            Logger.info('WARNING: global parameters is empty.');
            return new Status(Status.ERROR, 'ERROR', 'global parameters is empty.');
        }

        /* MODEL Includes */
        var WebDavModel = require('~/cartridge/models/webDavModel');

        var s3TransferClientInstance = new S3TransferClient(
            args.bucketName,
            args.accessKey,
            args.secretAccessKey,
            args.region,
            args.contentType,
            args.timeout,
            args.remoteFolder
        );

        if (empty(s3TransferClientInstance)) {
            Logger.info('ERROR: No S3Transfer Model');
            return new Status(Status.ERROR, 'ERROR', 'No S3Transfer Model');
        }

        // get folders from s3 bucket
        var directoryList = [];
        directoryList.push(args.remoteFolder);
        var directoryRemote;
        for (var f = 0; f < directoryList.length; f++) {
            directoryRemote = s3TransferClientInstance.list(directoryList[f], false);
            if (empty(directoryRemote.listDetail)) {
                continue;
            }
            for (var j = 0; j < directoryRemote.listDetail.length; j++) {
                if (directoryRemote.listDetail[j].directory) {
                    Logger.info('Get Directory {0}', directoryRemote.listDetail[j].name);
                    directoryList.push(directoryRemote.listDetail[j].name);
                }
            }
        }

        if (empty(directoryList)) {
            Logger.info('ERROR: No directoryList');
            return new Status(Status.ERROR, 'ERROR', 'No directoryList');
        }

        // Instance WebDAVModel
        var WebDAVModelInstance = new WebDavModel();
        if (empty(WebDAVModelInstance)) {
            Logger.info('ERROR: No WebDAV Model');
            return new Status(Status.ERROR, 'ERROR', 'No WebDAV Model');
        }

        var filename;
        var filenameArray;
        var endfilename;
        var filenameString;
        var localFile;
        var file;
        var targetSfccFolder;
        var counterFile = 0;
        var fileRemote;
        var fileRemote2;
        var nextMarker;
        var fileBool;
        var folderWebDavResult;
        var returnFile;
        var downloadSuccess;
        var dateFile;
        var fileNameEnd;
        var fileNameEndArray;
        var regexCharacters = new RegExp('^[_a-zA-Z0-9.:]*((-)*[_a-zA-Z0-9.:])*(-)*$');

        // get files from all folders from the bucket s3
        for (var n = 0; n < directoryList.length; n++) {
            fileBool = true;

            fileRemote = s3TransferClientInstance.list(directoryList[n], true);

            if (fileRemote.truncated && !empty(fileRemote.nextMarker)) {
                nextMarker = encodeURI(fileRemote.nextMarker);
                nextMarker = nextMarker.replace(/\s+/g, '%20');
                while (fileBool) {
                    fileRemote2 = s3TransferClientInstance.list(directoryList[n], true, nextMarker);
                    for (var k = 0; k < fileRemote2.listDetail.length; k++) {
                        fileRemote.listDetail.push(fileRemote2.listDetail[k]);
                    }

                    if (empty(fileRemote.listDetail)) {
                        continue;
                    }

                    if (args.ContinueDirectory) {
                        targetSfccFolder = args.TargetSFCCFolder.concat('/', directoryList[n]);
                    } else {
                        if (empty(args.TargetSFCCFolder)) {
                            targetSfccFolder = directoryList[n];
                        } else {
                            targetSfccFolder = args.TargetSFCCFolder;
                        }
                    }

                    // create or cd folder
                    folderWebDavResult = WebDAVModelInstance.createFolder(targetSfccFolder, args.RootDirectoryWebDav, args.catalogOrLibraryName);
                    if (!folderWebDavResult.success) {
                        errorFlow = true;
                        continue;
                    }

                    // download file from bucket s3 and put it in webdav
                    for (var i = 0; i < fileRemote.listDetail.length; i++) {
                        file = fileRemote.listDetail[i];

                        filename = file.getName();
                        filenameArray = filename.split('/');
                        endfilename = filenameArray.pop();
                        filenameString = endfilename.toString();
                        fileNameEndArray = endfilename.split('.');
                        fileNameEndArray.pop();
                        fileNameEnd = fileNameEndArray.toString();

                        if (!regexCharacters.test(fileNameEnd)) {
                            Logger.info('WARNING: Failed create file {0} because name is incorrect.', filenameString);
                            continue;
                        }

                        returnFile = WebDAVModelInstance.createFile(folderWebDavResult.directory.getFullPath(), filenameString);
                        if (!returnFile.success) {
                            errorFlow = true;
                            Logger.info('WARNING: Failed create file {0}', filenameString);
                            continue;
                        }
                        localFile = returnFile.file;

                        if (localFile.exists()) {
                            // skip if file exists
                            if (args.ReplaceSameFiles) {
                                localFile.remove();
                            } else {
                                continue;
                            }
                        }

                        // DOWNLOAD FILE
                        downloadSuccess = s3TransferClientInstance.getBinary(filename, localFile);
                        if (!downloadSuccess) {
                            if (args.S3ErrorFolder) {
                                var errorFilename = args.S3ErrorFolder + filename.split('/').pop();
                                s3TransferClientInstance.putBinary(errorFilename, localFile);
                            }
                            errorFlow = true;
                            continue;
                        }

                        // your file downloaded and is now available as the file identified by `localFile`
                        counterFile++;

                        if (args.S3ArchiveFolder) {
                            var archiveFilename = args.S3ArchiveFolder + filename.split('/').pop();
                            var archiveSuccess = s3TransferClientInstance.putBinary(archiveFilename, localFile);
                            if (archiveSuccess && args.RemoveFromS3) {
                                s3TransferClientInstance.del(filename);
                            }
                        }
                    }

                    fileRemote.listDetail = [];

                    if (fileRemote2.truncated && !empty(fileRemote2.nextMarker)) {
                        nextMarker = encodeURI(fileRemote2.nextMarker);
                        nextMarker = nextMarker.replace(/\s+/g, '%20');
                    } else {
                        fileBool = false;
                    }
                }
            } else {
                if (empty(fileRemote.listDetail)) {
                    continue;
                }

                if (args.ContinueDirectory) {
                    targetSfccFolder = args.TargetSFCCFolder.concat('/', directoryList[n]);
                } else {
                    if (empty(args.TargetSFCCFolder)) {
                        targetSfccFolder = directoryList[n];
                    } else {
                        targetSfccFolder = args.TargetSFCCFolder;
                    }
                }

                // create or cd folder
                folderWebDavResult = WebDAVModelInstance.createFolder(targetSfccFolder, args.RootDirectoryWebDav, args.catalogOrLibraryName);
                if (!folderWebDavResult.success) {
                    errorFlow = true;
                    continue;
                }

                // download file from bucket s3 and put it in webdav
                for (var l = 0; l < fileRemote.listDetail.length; l++) {
                    file = fileRemote.listDetail[l];

                    filename = file.getName();
                    filenameArray = filename.split('/');
                    endfilename = filenameArray.pop();
                    filenameString = endfilename.toString();
                    fileNameEndArray = endfilename.split('.');
                    fileNameEndArray.pop();
                    fileNameEnd = fileNameEndArray.toString();

                    if (!regexCharacters.test(fileNameEnd)) {
                        Logger.info('WARNING: Failed create file {0} because name is incorrect.', filenameString);
                        continue;
                    }

                    returnFile = WebDAVModelInstance.createFile(folderWebDavResult.directory.getFullPath(), filenameString);
                    if (!returnFile.success) {
                        errorFlow = true;
                        Logger.info('WARNING: Failed create file {0}', filenameString);
                        continue;
                    }
                    localFile = returnFile.file;

                    if (localFile.exists()) {
                        // skip if file exists
                        if (args.ReplaceSameFiles) {
                            localFile.remove();
                        } else {
                            continue;
                        }
                    }

                    // DOWNLOAD FILE
                    downloadSuccess = s3TransferClientInstance.getBinary(filename, localFile);
                    if (!downloadSuccess) {
                        if (args.S3ErrorFolder) {
                            var errorFilename = args.S3ErrorFolder + filename.split('/').pop();
                            s3TransferClientInstance.putBinary(errorFilename, localFile);
                        }
                        errorFlow = true;
                        continue;
                    }

                    // your file downloaded and is now available as the file identified by `localFile`
                    counterFile++;

                    if (args.S3ArchiveFolder) {
                        var archiveFilename = args.S3ArchiveFolder + filename.split('/').pop();
                        var archiveSuccess = s3TransferClientInstance.putBinary(archiveFilename, localFile);
                        if (archiveSuccess && args.RemoveFromS3) {
                            s3TransferClientInstance.del(filename);
                        }
                    }
                }
            }
        }
        Logger.info('Download {0} files.', counterFile);
    } catch (error) {
        var errorMessage = error.message;
        Logger.info('Catched Critical Error: ' + errorMessage);
        return new Status(Status.ERROR, 'ERROR', 'Catched Critical Error: ' + errorMessage);
    }

    if (errorFlow) {
        return new Status(Status.ERROR, 'ERROR', 'Failed download some files. Check the logs for more information.');
    }

    return new Status(Status.OK, 'OK', 'S3Transfer Concluded with NO ERRORS.');
};

exports.S3Transfer = s3Transfer;
