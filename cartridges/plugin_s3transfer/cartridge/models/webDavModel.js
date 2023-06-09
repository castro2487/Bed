'use strict';

/* Module for process file in WebDAV

* rootDirectory = directories accessible through WebDAV (TEMP, IMPEX, CATALOGS/CatalogName, LIBRARIES/LibraryName) (is necessary)
* directoryName = Use Directory Name only if Root Directory is equals to CATALOGS or LIBRARIES.
(
examples: Catalog -> https://{yoursandbox}.demandware.net/on/demandware.servlet/webdav/Sites/Catalogs/[Catalog name]
Content Images -> https://{yoursandbox}.demandware.net/on/demandware.servlet/webdav/Sites/Libraries/[Library Name]
)
*/

/* API Includes */
var Logger = require('dw/system/Logger');

/** @type {dw.io.File} */
var File = require('dw/io/File');

/** @type {dw.io.FileWriter} */
var FileWriter = require('dw/io/FileWriter');

/** @type {dw.io.XMLStreamWriter} */
var XMLStreamWriter = require('dw/io/XMLStreamWriter');

// The UNIX style '/' path separator, which must be used for files paths.
var Separator = File.SEPARATOR;

function webDavInstance () {
};

webDavInstance.prototype = {

    /* add content to file
    * content = content to insert in XML file
    */
    createXmlContent: function (file, content) {
        try {
            var result = {};

            if (empty(file) || empty(content)) {
                Logger.info('File and content are mandatory for Connection.');
                result.success = false;
                return result;
            }

            var fileWriter = new FileWriter(file, 'UTF-8');
            var writerXml = new XMLStreamWriter(fileWriter);

            writerXml.writeRaw(content);

            writerXml.flush();
            writerXml.close();
            fileWriter.close();
            Logger.info('File {0} written.', file.getName());

            result.file = file;
            result.success = true;

            return result;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    /* create file in webdav
    * fullPathFile = path file that create in webdav
    * fileName = name of the file
    */
    createFile: function (fullPathFile, fileName) {
        try {
            var result = {};

            if (empty(fullPathFile) || empty(fileName)) {
                Logger.info('Root Directory and Full Path Files are mandatory for Connection.');
                result.success = false;
                return result;
            }

            var file = new File(fullPathFile.concat(Separator, fileName));
            //Logger.info('File {0} created.', file.getName());

            result.file = file;
            result.success = true;
            return result;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    /* create folder in webdav
    * fullPathFolder = path folder that create in webdav
    * rootDirectory = impex, etc...
    * directoryName = necessary if only root directory is libraries or catalogs
    */
    createFolder: function (fullPathFolder, rootDirectory, directoryName) {
        try {
            var result = {};

            var rootDir = checkRootDirectory(rootDirectory, directoryName);

            if (empty(rootDir)) {
                Logger.info('Directory Name is mandatory for Connection if Root Directory is equals to CATALOGS or LIBRARIES.');
                result.success = false;
                return result;
            }

            var filePath = new File(rootDir.concat(Separator, fullPathFolder, Separator));
            if (!filePath.exists()) {
                filePath.mkdirs();
                Logger.info('Directory {0} created.', filePath);
            }
            //Logger.info('CD in directory {0}.', filePath);
            result.directory = filePath;
            result.success = true;
            return result;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    /* create file list in webdav
    * filesPath = path of the files that create in webdav
    * filelist = list of file with file information
    * rootDirectory = impex, etc...
    * directoryName = necessary if only root directory is libraries or catalogs
    */
    createFileList: function (filesPath, fileList) {
        try {
            var result = {};

            if (empty(filesPath) || empty(fileList)) {
                Logger.info('Files Path and File List are mandatory for process file.');
                result.success = false;
                return result;
            }

            var arrayFiles = new Array();
            for (var i = 0; i < fileList.length; i++) {
                if (!fileList[i].getDirectory()) {
                    var fileResult = this.createFile(filesPath, fileList[i].getName());
                    if (!fileResult) {
                        Logger.info('WARNING: File {0} not created.', fileList[i].getName());
                        continue;
                    }
                    arrayFiles.push(fileResult.file);
                }
            }

            result.files = arrayFiles;
            result.success = true;
            return result;
        } catch (e) {
            throw new Error(e.message);
        }
    },

    /* get file list from webdav
    * fullPathFiles = path of the folder that contains the files
    * rootDirectory = impex, etc...
    * directoryName = necessary if only root directory is libraries or catalogs
    */
    getFileList: function (fullPathFiles, rootDirectory, directoryName) {
        try {
            var result = {};

            if (empty(rootDirectory) || empty(fullPathFiles)) {
                Logger.info('Root Directory and Full Path Files are mandatory.');
                result.success = false;
                return result;
            }

            var rootDir = checkRootDirectory(rootDirectory, directoryName);

            if (empty(rootDir)) {
                Logger.info('Directory Name is mandatory if Root Directory is equals to CATALOGS or LIBRARIES.');
                result.success = false;
                return result;
            }

            var filesPath = new File(rootDir.concat(Separator, fullPathFiles, Separator));

            if (!filesPath.exists()) {
                Logger.info('Directory {0} not exists', filesPath);
                result.success = false;
                return result;
            }

            var files = filesPath.listFiles();

            var arrayFiles = new Array();
            for (var i = 0; i < files.length; i++) {
                if (!files[i].isDirectory()) {
                    arrayFiles.push(files[i]);
                }
            }

            if (empty(files) || empty(arrayFiles)) {
                Logger.info('No files in directory {0}.', fullPathFiles);
                result.success = true;
                return result;
            }

            result.fileList = arrayFiles;
            result.success = true;

            return result;
        } catch (e) {
            throw new Error(e.message);
        }
    }

};

function checkRootDirectory (rootDir, dirName) {
    try {
        if (rootDir.equals(File.CATALOGS || File.LIBRARIES)) {
            if (empty(dirName)) {
                return null;
            } else {
                return rootDir.concat(Separator, dirName, Separator);
            }
        } else {
            return rootDir;
        }
    } catch (e) {
        throw new Error(e.message);
    }
}

module.exports = webDavInstance;
