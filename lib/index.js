// Module Dependencies 
var knox = require("knox");
var fs = require("fs");


/**
 * This is a wrapper for knox npm package to make uploading to Amazon S3 easier
 * @module EasyS3Uploader
 * @param {string} Amazon S3 Access key
 * @param {string} Amazon S3 Secret key
 * @param {string} Amazon S3 Bucket
 */

var EasyS3Uploader = function (s3_access, s3_secret, s3_bucket) {
    this.key = s3_access;
    this.secret = s3_secret;
    this.bucket = s3_bucket;
    this.client = null;

    /**
     * Initiate knox client
     * @method init
     */
    this.init = function () {
        this.client = knox.createClient({
            key: this.key,
            secret: this.secret,
            bucket: this.bucket
        });
    }

    this.init();

    /**
     * You can upload a file to s3 using this method
     * @method saveFile
     * @param {string} source_file The path for the file you want to upload
     * @param {string} destination_file the path at s3 you want to upload the source file to.
     * @param {string} mime_type in case you want the s3 client to set a content type for the file you can provide it here e.g ( image/png )
     * @param {boolean} isPublic  set to true if you want to your file to be accessibale for public
     * @param {function} next callback after uploading file
     **/
    this.saveFile = function (source_file, destination_file, mime_type, isPublic, next) {
        var $this = this;

        this.init();

        fs.readFile(source_file, function (err, buf) {
            if (!err) {
                $this.saveData(buf, destination_file, isPublic, mime_type, function (err, store_info) {
                    next(err, store_info);
                })
            } else {
                next(err, null);
            }
        });
    }

    /**
     * In case you have buffered date you can use this method to upload it to s3
     * @method saveData
     * @param {Buffer} buffer buffered data to be uploaded
     * @param {string} destination_file the path at s3 you want to upload the data to.
     * @param {string} mime_type in case you want the s3 client to set a content type for the file you can provide it here e.g ( image/png )
     * @param {boolean} isPublic  set to true if you want to your file to be accessibale for public
     * @param {function} next callback after uploading data
     **/
    this.saveData = function (buffer, destination_file, mime_type, isPublic, next) {

        if (buffer && destination_file) {
            var headers = {
                'Content-Length': buffer.length
            };
            if (isPublic) {
                headers['x-amz-acl'] = 'public-read';
            }
            if (mime_type) {
                headers['Content-type'] = mime_type;
            }
            var request = this.client.put(destination_file, headers);
            request.on('response', function (resp) {
                if (200 == resp.statusCode) {
                    next(null, {
                        url: request.url
                    });
                } else {
                    next(new Error(
                        "Error occured whilse saving file to s3 at " +
                        destination_file + 
                        " , status code  returend = " 
                        + resp.statusCode));
                }
            });
            request.on("error", function (err) {
                next(err, null);
            });
            request.end(buffer);
        } else {
            next(new Error("Missing parameters"), null);
        }
    }

    /**
    * What if you want to upload multiple files to s3 at once  , this method does that
    * @param {Object} resources  this is an array of objects that contains the files or data need to uploaded to s3
     e.g :
     resources = [
        {
         "src" : "/path/to/file/on/disk",
         "dest" : "/path/to/file/on/s3",
         "mime_type" : "image/png" // optional
         "public" : true
        },
        {
         "data" : <Buffer ......>,
         "dest" : "/path/to/file/on/s3",
         "mime_type" : "image/png" // optional
         "public" : true
        },
    ]
    * @param {function} next once uploading is done for all resources the next function will be called and the resources object will be passed to it , includes s3_url for each resources
    e.g :
    resources = [
        {
         "src" : "/path/to/file/on/disk",
         "dest" : "/path/to/file/on/s3",
         "mime_type" : "image/png" // optional
         "public" : true,
         "s3_url" : "https://bucket.s3.amazon/path/to/file/on/s3"
        },
        {
         "data" : <Buffer ......>,
         "dest" : "/path/to/file/on/s3",
         "mime_type" : "image/png" // optional
         "public" : true,
         "s3_url" : "https://bucket.s3.amazon/path/to/file/on/s3"
        },
    ]
    */

    this.saveMultiple = function (resources, next) {

        var counter = 0;
        var $this = this;
        var callback = function (resouse_index, err, store_info) {
            resources[resouse_index]['s3_url'] = (err == null ? store_info.url : false);
            counter++;
            if (counter == resources.length) {
                next(null, resources);
            }
        }

        var runSave = function (index, resource, next) {
            var mime_type = null;
            if (typeof (resources[i].mime_type) != "undefined") {
                mime_type = resources[i].mime_type;
            }

            if (typeof (resource.src) != "undefined") {
                $this.saveFile(resources[i].src, resources[i].dest, resources[i].public, mime_type, function (err, store_info) {
                    callback(index, err, store_info);
                });
            } else {
                if (typeof (resource.data) != "undefined") {
                    $this.saveData(resources[i].data, resources[i].dest, resources[i].public, mime_type, function (err, store_info) {
                        callback(index, err, store_info);
                    });
                } else {
                    callback(index, "Resouece is neither a file nor an object", null);
                }
            }
        }

        for (var i = 0, len = resources.length; i < len; i++) {
            runSave(i, resources[i], callback);
        }
    }

    /** 
     * Delete a file on S3
     * @method delete
     * @param {string} dest_file path to the file on s3 to be deleted
     * @param {function} next
     **/
    this.delete = function (dest_file, next) {
        this.client.deleteFile(dest_file, function (err, res) {
            next(err, res);
        });
    }
}

module.exports = EasyS3Uploader;