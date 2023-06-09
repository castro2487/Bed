'use strict';

/* Job for delete or archive files */ 

/* API Includes */
var Logger = require('dw/system/Logger').getLogger('custom.job.deleteOrArchiveFile');
var Status = require('dw/system/Status');
var File = require('dw/io/File');
var StringUtils = require('dw/util/StringUtils');
// The UNIX style '/' path separator, which must be used for files paths.
var Separator = File.SEPARATOR;

var deleteOrArchiveFiles = function () {
    try {
        Logger.info('Starting delete or archive files...');

        // check if global parameters is empty
        var args = arguments[0];
        if (empty(args.WorkingFolder) || empty(args.RootDirectoryWebDav)) {
            Logger.info('WARNING: global parameters is empty');
            return new Status(Status.ERROR, 'ERROR', 'global parameters is empty.');
        }

        /* MODEL Includes */
        var WebDavModel = require('~/cartridge/models/webDavModel');

        //webdav model instance
        var webDavInstance = new WebDavModel();
        if (empty(webDavInstance)) {
            Logger.info('ERROR: No WebDav Model');
            return new Status(Status.ERROR, 'ERROR', 'No WebDav Model');
        }
        var deleteFile = false;
        if (args.ArchiveOrDeleteFiles.equals('DELETE')) {
            deleteFile = true;
        }
        var dateFile = null;
        var calculateDate = null;

        if (empty(args.FileNameSFCC)) {

            //get file list info from webdav
            var fileWebDavResult = webDavInstance.getFileList(args.WorkingFolder, args.RootDirectoryWebDav, args.catalogOrLibraryName);

            if (deleteFile) {
                if (fileWebDavResult.success) {
                    for (var i = 0; i < fileWebDavResult.fileList.length; i++) {
                        if (empty(args.DateDeleteFiles)) {
                            fileWebDavResult.fileList[i].remove();
                        } else {
                            calculateDate = new Date();
                            calculateDate.setDate(calculateDate.getDate() - args.DateDeleteFiles);
                            dateFile = new Date(fileWebDavResult.fileList[i].lastModified());
                            if (!empty(dateFile) && !empty(calculateDate) && (dateFile < calculateDate)) {
                                fileWebDavResult.fileList[i].remove();
                            }
                        }
                    }
                    Logger.info('INFO: Delete List Files.');
                }

                if (args.IsDeleteContinueDirectory) {
                    var processSubDirectory = function (workingFolder) {
                        //get directory list info from webdav
                        var directoryWebDavResult = webDavInstance.getDirectoryList(workingFolder, args.RootDirectoryWebDav, args.catalogOrLibraryName);
                        if (!directoryWebDavResult.success) {
                            Logger.info('ERROR: Get directory INFO from WebDav Failed, so files of working folder subfolders not deleted.');
                        } else {
                            for (var i = 0; i < directoryWebDavResult.directoryList.length; i++) {
                                fileWebDavResult = webDavInstance.getFileList(directoryWebDavResult.directoryList[i].getPath(), args.RootDirectoryWebDav, args.catalogOrLibraryName);
                                if (fileWebDavResult.success) {
                                    for (var k = 0; k < fileWebDavResult.fileList.length; k++) {
                                        if (empty(args.DateDeleteFiles)) {
                                            fileWebDavResult.fileList[k].remove();
                                        } else {
                                            calculateDate = new Date();
                                            calculateDate.setDate(calculateDate.getDate() - args.DateDeleteFiles);
                                            dateFile = new Date(fileWebDavResult.fileList[k].lastModified());
                                            if (!empty(dateFile) && !empty(calculateDate) && (dateFile < calculateDate)) {
                                                fileWebDavResult.fileList[k].remove();
                                            }
                                        }
                                    }
                                    Logger.info('INFO: Delete List Files from {0} directory.', directoryWebDavResult.directoryList[i].getPath());
                                }
                                processSubDirectory(directoryWebDavResult.directoryList[i].getPath());
                            }
                        }
                    }
                    processSubDirectory(args.WorkingFolder);
                }

                if (args.IsDeleteDirectory) {
                    // var isRemove = true;
                    var processDeleteDirectory = function (workingFolder) {
                        //get directory list info from webdav
                        var directoryWebDavResult = webDavInstance.getDirectoryList(workingFolder, args.RootDirectoryWebDav, args.catalogOrLibraryName);
                        if (!directoryWebDavResult.success) {
                            Logger.info('ERROR: Get directory INFO from WebDav folder {0} Failed, so delete folders failed.', workingFolder);
                        } else {
                            for (var i = 0; i < directoryWebDavResult.directoryList.length; i++) {
                                processDeleteDirectory(directoryWebDavResult.directoryList[i].getPath());
                                if (empty(args.DateDeleteFiles)) {
                                    directoryWebDavResult.directoryList[i].remove();
                                } else {
                                    calculateDate = new Date();
                                    calculateDate.setDate(calculateDate.getDate() - args.DateDeleteFiles);
                                    dateFile = new Date(directoryWebDavResult.directoryList[i].lastModified());
                                    if (!empty(dateFile) && !empty(calculateDate) && (dateFile < calculateDate)) {
                                        directoryWebDavResult.directoryList[i].remove();
                                    }
                                }
                            }
                            Logger.info('INFO: Delete List Directory.');
                        }
                    }
                    processDeleteDirectory(args.WorkingFolder);
                }
            } else {
                if (!fileWebDavResult.success) {
                    Logger.info('ERROR: Get file INFO from WebDav Failed.');
                    return new Status(Status.ERROR, 'ERROR', 'Get file INFO from WebDav Failed. Check the logs for more information.');
                }
                if (empty(args.FolderArchive)) {
                    Logger.info('ERROR: No folder for archive files');
                    return new Status(Status.ERROR, 'ERROR', 'No folder for archive files');
                }
                if (args.IsDateStampArchiveFiles) {
                    var dateStamp = StringUtils.formatCalendar(new dw.util.Calendar(), "yyyy_MM_dd");
                    var timeStamp = StringUtils.formatCalendar(new dw.util.Calendar(), "HH_mm_ss");
                    var folderResult = webDavInstance.createFolder(args.WorkingFolder.concat(Separator, args.FolderArchive, Separator, dateStamp, Separator, timeStamp), args.RootDirectoryWebDav, args.catalogOrLibraryName);
                } else {
                    var folderResult = webDavInstance.createFolder(args.FolderArchive, args.RootDirectoryWebDav, args.catalogOrLibraryName);
                }
                if (!folderResult.success) {
                    Logger.info('WARNING: Failed create or CD in Folder {0}', args.WorkingFolder.concat(Separator, args.FolderArchive));
                    return new Status(Status.ERROR, 'ERROR', 'Failed create or CD in Folder');
                }
                var archiveFile;
                if (!empty(fileWebDavResult.fileList)) {
                    for (var j = 0; j < fileWebDavResult.fileList.length; j++) {
                        archiveFile = webDavInstance.createFile(folderResult.directory.getFullPath(), fileWebDavResult.fileList[j].getName());
                        if (archiveFile.file.exists()) {
                            archiveFile.file.remove();
                        }
                        fileWebDavResult.fileList[j].copyTo(archiveFile.file);
                        if (args.IsDeleteAfterArchive) {
                            fileWebDavResult.fileList[j].remove();
                        }
                    }
                    Logger.info('INFO: Archived List Files.');
                }
            }

        } else {

            var folderResultOriginal = webDavInstance.createFolder(args.WorkingFolder, args.RootDirectoryWebDav, args.catalogOrLibraryName);
            if (!folderResultOriginal.success) {
                Logger.info('WARNING: Failed create or CD in Folder {0}', args.WorkingFolder);
                return new Status(Status.ERROR, 'ERROR', 'Failed create or CD in Folder');
            }
            if (deleteFile) {
                var originalFile = webDavInstance.createFile(folderResultOriginal.directory.getFullPath(), args.FileNameSFCC);
                calculateDate = new Date();
                calculateDate.setDate(calculateDate.getDate() - args.DateDeleteFiles);
                dateFile = new Date(originalFile.file.lastModified());
                if (!empty(dateFile) && !empty(calculateDate) && (dateFile < calculateDate)) {
                    originalFile.file.remove();
                    Logger.info('INFO: Delete File {0}', originalFile.file.getName());
                } else {
                    Logger.info('INFO: Not delete File {0} because date delete file is empty o bigger than file date stamp.', originalFile.file.getName());
                }
            } else {
                if (empty(args.FolderArchive)) {
                    Logger.info('ERROR: No folder for archive files');
                    return new Status(Status.ERROR, 'ERROR', 'No folder for archive files');
                }
                if (args.IsDateStampArchiveFiles) {
                    var dateStamp = StringUtils.formatCalendar(new dw.util.Calendar(), "yyyy_MM_dd");
                    var timeStamp = StringUtils.formatCalendar(new dw.util.Calendar(), "HH_mm_ss");
                    var folderResult = webDavInstance.createFolder(args.WorkingFolder.concat(Separator, args.FolderArchive, Separator, dateStamp, Separator, timeStamp), args.RootDirectoryWebDav, args.catalogOrLibraryName);
                } else {
                    var folderResult = webDavInstance.createFolder(args.WorkingFolder.concat(Separator, args.FolderArchive), args.RootDirectoryWebDav, args.catalogOrLibraryName);
                }
                if (!folderResult.success) {
                    Logger.info('WARNING: Failed create or CD in Folder {0}', args.WorkingFolder.concat(Separator, args.FolderArchive));
                    return new Status(Status.ERROR, 'ERROR', 'Failed create or CD in Folder');
                }
                var originalFile = webDavInstance.createFile(folderResultOriginal.directory.getFullPath(), args.FileNameSFCC);
                var archiveFile = webDavInstance.createFile(folderResult.directory.getFullPath(), args.FileNameSFCC);
                if (archiveFile.file.exists()) {
                    archiveFile.file.remove();
                }
                originalFile.file.copyTo(archiveFile.file);
                if (args.IsDeleteAfterArchive) {
                    originalFile.file.remove();
                }
                Logger.info('INFO: Archived File {0}', originalFile.file.getName());
            }
        }

        Logger.info('Finish delete or archive files...');

    } catch (error) {
        var errorMessage = error.message;
        Logger.info('Catched Critical Error: ' + errorMessage);
        return new Status(Status.ERROR, 'ERROR', 'Catched Critical Error: ' + errorMessage);
    }

    return new Status(Status.OK, 'OK', 'Delete or Archive files Job Concluded with NO ERRORS.');
};

exports.DeleteOrArchiveFiles = deleteOrArchiveFiles;
