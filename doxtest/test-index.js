/**
 * Created by youxiachai on 14-4-21.
 */


var swagger  = require('../lib/dox-swagger'),
    fs  = require('fs');

var files = fs.readdirSync('./test-code');
console.log(files)

files.forEach(function (item) {

    swagger.doxSwagger('./test-code/' + item, {basePath : 'http://localhost:5000'});
})

//swagger.doxSwagger('test-code/user.js', {basePath : 'http://localhost:5000'});
//
//
//
fs.writeFileSync('./api-doc', JSON.stringify(swagger.apiResourceList));




