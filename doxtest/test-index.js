/**
 * Created by youxiachai on 14-4-21.
 */


var swagger  = require('../lib/dox-swagger'),
    path = require('path'),
    fs  = require('fs');

var basePath = path.resolve('.');

var codeDir = path.join(basePath, 'test-code-nest');

var files = fs.readdirSync(codeDir);
console.log(files)

files.forEach(function (item) {

    swagger.doxSwagger(path.join(codeDir, item), {basePath : 'http://localhost:5000', output : 'api2'});
})

//swagger.doxSwagger('test-code/user.js', {basePath : 'http://localhost:5000'});
//
//
//
fs.writeFileSync('./api2/api-docs', JSON.stringify(swagger.apiResourceList));




