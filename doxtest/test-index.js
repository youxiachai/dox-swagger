/**
 * Created by youxiachai on 14-4-21.
 */


var swagger  = require('../lib/dox-swagger'),
    path = require('path'),
    fs  = require('fs');

var basePath = path.resolve('.');

var codeDir = path.join(basePath, 'test-code');

var files = fs.readdirSync(codeDir);
console.log(files)

files.forEach(function (item) {

    swagger.doxSwagger(path.join(codeDir, item), {basePath : 'http://localhost:5000'});
})

//swagger.doxSwagger('test-code/user.js', {basePath : 'http://localhost:5000'});
//
//
//
fs.writeFileSync('./api-doc', JSON.stringify(swagger.apiResourceList));




