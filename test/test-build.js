/**
 * Created by youxiachai on 14-5-12.
 */


var should = require('should');

var swagger  = require('../lib/dox-swagger'),
    path = require('path'),
    fs  = require('fs');


function swaggerOptions (dirname) {
    var codeDir = path.join(__dirname, 'example', dirname);

    var files = fs.readdirSync(codeDir);

    var modelDir = path.join(codeDir, 'models');

    var modelFiles = fs.readdirSync(modelDir);

    var modelObj = {};
    modelFiles.forEach(function (item){

        var point = item.lastIndexOf(".");
        var name = item.substr(0, point);

        modelObj[name] = require(path.join(modelDir, item))
    })



    var client = path.join(__dirname , 'test-output');
    var output = dirname;


    return {
        files :  files,
        client : client,
        output : output,
        codeDir : codeDir,
        option : {
            basePath : 'http://localhost:5000', output : output, models : modelObj, client : client
        }
      };

}



describe('should pass all case', function () {

    it('should build api doc include models', function () {

        var op =  swaggerOptions( 'include-models');
//
        op.files.forEach(function (item) {

            var point = item.lastIndexOf(".");

            var type = item.substr(point);

            if(type === '.js'){
                swagger.doxSwagger(path.join(op.codeDir, item), op.option);
            }
        })

        var apiDocOutput = path.join(op.client , op.output);

        var apidocfile = path.join(apiDocOutput,  'api-docs');

        fs.writeFileSync(apidocfile, JSON.stringify(swagger.apiResourceList));

        //校验生成的文档,是否符合标准

        var apiIndexDocs = JSON.parse( fs.readFileSync(apidocfile).toString());

        apiIndexDocs.should.have.property('apis').with.lengthOf(1);

        apiIndexDocs.apis.should.have.property('0', {
            path : 'http://localhost:5000/include-models/pet',
            description : ''
        })

        //校验具体
        var petDoc = path.join(apiDocOutput, 'pet');

        var petApi = JSON.parse( fs.readFileSync(petDoc).toString());


        petApi.models.should.have.property('Pet');

        petApi.apis[0].operations[0].nickname.should.eql('getPetInfobyId');









    })

})