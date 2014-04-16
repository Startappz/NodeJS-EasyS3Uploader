EasyS3Uploader
==============

This is simple and  elegant wrapper for [knox](https://github.com/LearnBoost/knox) npm package to make it much easier and more fun to upload to Amazon S3.

### Features
 + Upload file
 + Upload Data
 + Upload multiple files at once
 + Delete File
 
### How to use 

#### Installation

```
npm install easys3uploader
```

#### initilaizaiton

```javascript
var s3 = new EasyS3Uploader(
    "PLACE_YOUR_S3_ACCESS_KEY_HERE",
    "PLACE_YOUR_S3_SECRET_KEY_HERE",
    "PLACE_YOUR_BUCKET_HERE"
);
```

#### Upload file

```javascript
s3.saveFile(__dirname + "/file.txt",
    "/test/file.txt",
    "text/plain",
    true,
    function (err, result) {
        if (!err) {
            console.log("Uploading File Passed", result);
        } else {
            console.error(err);
        }
    });
```

#### Upload Data

```javascript
s3.saveData("This is test",
    "/test/file2.txt",
    "text/plain",
    true,
    function (err, result) {
        if (!err) {
            console.log("Uploading Data Passed", result);
   } else {
            console.error(err);
        }
    });
```


#### Upload Multiple Files 


```javascript
// Prepare resouces to be uploaded 
var resources = [{
    "src": __dirname + "/file.txt",
    "dest": "/test/file3.txt",
    "public": true
}, {
    "data": "This is test",
    "dest": "/test/file4.txt",
    "public": true
}];
// Upload 
    s3.saveMultiple(resources, function (err, result) {
    if (!err) {
        console.log("Uploading Mutiple file/data ", result);
    } else {
        console.error(err);
    }
});
```

### Test

A test script is prepared at tests/test.js, you need to provide your s3 access key , secret key and bucket into that file , to run the test :

```javascript
npm test
```

