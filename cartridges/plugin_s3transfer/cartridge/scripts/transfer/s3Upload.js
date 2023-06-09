'use strict';

/* API Includes */
var Logger = require('dw/system/Logger').getLogger('custom.job.S3Upload');
var Status = require('dw/system/Status');
var S3TransferClient = require('~/cartridge/models/S3TransferClient');
var Site = require('dw/system/Site');
var Transaction = require('dw/system/Transaction');

var s3Upload = function () {
    try {
        Logger.info('Starting S3Upload job...');

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
            Logger.info('ERROR: No S3Upload Model');
            return new Status(Status.ERROR, 'ERROR', 'No S3Upload Model');
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

         // get folders from webdav
        var directoryList = [];
        directoryList.push(args.RootDirectoryWebDav + args.TargetSFCCFolder);
        var directoryRemote;
        for (var f = 0; f < directoryList.length; f++) {
            directoryRemote = WebDAVModelInstance.getFileList(args.TargetSFCCFolder, args.RootDirectoryWebDav);
            if (empty(args.TargetSFCCFolder.listDetail)) {
                continue;
            }
            for (var j = 0; j < args.TargetSFCCFolder.listDetail.length; j++) {
                if (args.TargetSFCCFolder.listDetail[j].directory) {
                    Logger.info('Get Directory {0}', args.TargetSFCCFolder.listDetail[j].name);
                    directoryList.push(args.TargetSFCCFolder.listDetail[j].name);
                }
            }
        }

        if (empty(directoryList)) {
            Logger.info('ERROR: No directoryList');
            return new Status(Status.ERROR, 'ERROR', 'No directoryList');
        }


        // get files from all folders from webdav
        for (var n = 0; n < directoryList.length; n++) {
            fileBool = true;

            fileRemote = WebDAVModelInstance.getFileList(args.TargetSFCCFolder, args.RootDirectoryWebDav);

                    // download file from  webdav and put it in s3
                for (var i = 0; i < fileRemote.fileList.length; i++) {
                    file = fileRemote.fileList[i];
                      //file= fileRemote.fileList[0];

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

                    returnFile = WebDAVModelInstance.createFile(args.RootDirectoryWebDav + args.TargetSFCCFolder, filenameString);
                    if (!returnFile.success) {
                        errorFlow = true;
                        Logger.info('WARNING: Failed create file {0}', filenameString);
                        continue;
                    }
                    localFile = returnFile.file;

                    // your file downloaded and is now available as the file identified by `localFile`
                    counterFile++;

                    var archiveFilename = args.S3ArchiveFolder + '/' + filename.split('/').pop();
                    var archiveSuccess = s3TransferClientInstance.putBinary(archiveFilename, file);
                         if (archiveSuccess && args.RemoveFromS3) {
                                s3TransferClientInstance.del(filename);
                            }
                    }

                    fileRemote.listDetail = [];

                if (args.ContinueDirectory) {
                    targetSfccFolder = args.TargetSFCCFolder.concat('/', directoryList[n]);
                } else {
                    if (empty(args.TargetSFCCFolder)) {
                        targetSfccFolder = directoryList[n];
                    } else {
                        targetSfccFolder = args.TargetSFCCFolder;
                    }
                }
            }

        // delete file from webdav
        if (localFile.exists()) {
             localFile.remove();
        }

        Logger.info('Download {0} files.', counterFile);
    }catch (error) {
        var errorMessage = error.message;
        Logger.info('Catched Critical Error: ' + errorMessage);
        return new Status(Status.ERROR, 'ERROR', 'Catched Critical Error: ' + errorMessage);
    }

    if (errorFlow) {
        return new Status(Status.ERROR, 'ERROR', 'Failed download some files. Check the logs for more information.');
    }

    return new Status(Status.OK, 'OK', 'S3Upload Concluded with NO ERRORS.');
};

exports.S3Upload = s3Upload;
