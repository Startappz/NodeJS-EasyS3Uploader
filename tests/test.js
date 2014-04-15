var EasyS3Uploader = require(__dirname + "/../lib");

var s3 = new EasyS3Uploader(
    "PLACE_YOUR_S3_ACCESS_KEY_HERE",
    "PLACE_YOUR_S3_SECRET_KEY_HERE",
    "PLACE_YOUR_BUCKET_HERE"
);

// Uploading a file
s3.saveFile(__dirname + "/file.txt",
    "/test/file.txt",
    "text/plain",
    true,
    function (err, result) {
        if (!err) {
            console.log("Uploading File Passed", result);

            //Deleteing files
            s3.delete("/test/file.txt", function (err, result) {
                if (!err) {
                    console.log("Deleing file /test/file.txt done");
                } else {
                    console.log(err);
                }
            });

        } else {
            console.error(err);
        }
    });

//Uploading data
s3.saveData("This is test",
    "/test/file2.txt",
    "text/plain",
    true,
    function (err, result) {
        if (!err) {
            console.log("Uploading Data Passed", result);

            //Deleteing files
            s3.delete("/test/file2.txt", function (err, result) {
                if (!err) {
                    console.log("Deleing file /test/file2.txt done");
                } else {
                    console.log(err);
                }
            })
        } else {
            console.error(err);
        }
    });

//Upload Multiple files At once
var resources = [{
    "src": __dirname + "/file.txt",
    "dest": "/test/file3.txt",
    "public": true
}, {
    "data": "This is test",
    "dest": "/test/file4.txt",
    "public": true
}];

s3.saveMultiple(resources, function (err, result) {
    if (!err) {
        console.log("Uploading Mutiple file/data ", result);

        var passed = 0;
        for (var i = 0; i < resources.length; i++) {
            if (typeof (resources[i].s3_url) != undefined) {
                if (resources[i].s3_url != false) {
                    passed++;
                }
            }
        }
        console.log(passed + " of resources passed out of " + resources.length);
        if (passed != 0) {
            //Deleteing files
            s3.delete("/test/file3.txt", function (err, result) {
                if (!err) {
                    console.log("Deleing file /test/file3.txt done");
                } else {
                    console.log(err);
                }
            });

            //Deleteing files
            s3.delete("/test/file4.txt", function (err, result) {
                if (!err) {
                    console.log("Deleing file /test/file4.txt done");
                } else {
                    console.log(err);
                }
            });
        }

    } else {
        console.error(err);
    }
});