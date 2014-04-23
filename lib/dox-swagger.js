
//api 资源列表 全局变量
var apiIndex = require('../swagger12/api-resource-list');
    fs = require('fs'),
    path = require('path'),
    dox = require('dox'),
    tempApiDesc = [];


/**
 * https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md#52-api-declaration
 * @param resourcePath
 * @param option
 * @returns {*|exports}
 */
function buildApiDesc(resourcePath, option){

    var option = option ? option : {};

    var exportApi = {};

    exportApi.apiVersion = option.apiVersion ? option.apiVersion : "1.0.0";
    exportApi.swaggerVersion = '1.2';
    exportApi.basePath = option.basePath ?  option.basePath : '' ;
    exportApi.resourcePath = resourcePath;
//    exportApi.description = option.description ? option.description :  '';
    exportApi.apis = [];
    //模型导入,看情况实现...
    exportApi.models = option.models ?  option.models : {};

    exportApi.produces = ["application/json"];

    exportApi.consumes = [];

    //权限部分,看情况实现
    exportApi.authorizations = option.authorizations ? option.authorizations : {};


    return exportApi;
}





/**
 * https://github.com/wordnik/swagger-spec/blob/master/versions/1.2.md#522-api-object
 * @param oneDox
 * @param {basePath : '', description : ''} option
 */
function buildApiObject(oneDox, option) {

    var output = option.output ?  option.output  : '';

    var api = {};
    api.path = "";
    api.description =  oneDox.description ? oneDox.description.full : '';
    api.operations = [];

    var operations = {}
    //必须大写.并且是 GET POST PUT PATCH DELETE OPTIONS
    operations.method = 'GET';
    operations.parameters =[];
    operations.responseMessages = [];
    operations.nickname = oneDox.ctx ? oneDox.ctx.name : '';

    var apiDesc = {};


    oneDox.tags.forEach(function (item){

        if(item.type === 'resourcePath'){
            //迭代查找是否已经存在的API 列表该路径
            var isInstance = false;

            tempApiDesc.forEach(function (apiDescItem){
                if(item.string === apiDescItem.resourcePath) {
                    isInstance = true;
                    apiDesc = apiDescItem;
                    return;
                }
            })

//            console.log(item.string + '  ' +  tempApiDesc.length + ' isInstance ' + isInstance);

            if(!isInstance){
                apiDesc =  buildApiDesc(item.string, option);

                //存到一个临时变量里面,以备复用
                tempApiDesc.push(apiDesc);
                //构建api 列表
                apiIndex.apis.push({
                    path : option.basePath + '/' + option.output + item.string,
                    description : api.description
                })
            }
        }

        // build path 复用操作
        if(item.type === 'path') {

            api.path = item.string;

             //检查api 是否已经存在
            if(apiDesc.apis.length){

                apiDesc.apis.forEach(function (apiDescitem){
                    if(api.path === apiDescitem.path ){
                        //复用已经存在对象.
//                        console.log(item.string + ' ' +  apiDescitem.path + ' ' + i )
//                        console.log(apiDescitem)
                        api =  apiDescitem;
                        return;
                    }
                })
            }
        }

        if(item.type === 'method') {
            //必须大写.并且是 GET POST PUT PATCH DELETE OPTIONS
            operations.method = item.string ? item.string.toUpperCase() : 'GET';
        }

        if(item.type === 'summary') {
            operations.summary = item.string ?  item.string : '';
        }

        if(item.type === 'notes') {
            operations.notes = item.string ?  item.string : '';
        }

        if(item.type === 'nickname') {
            operations.nickname = item.string ?  item.string : '';
        }

        // build operations
        // find param
        if(item.type === "param"){
            //types[0] -> it is type
            var oneParamert = {};
            //required
            oneParamert.name =  item.name;
            oneParamert.description = item.description;
            //默认query  支持配置: path, body, header, form required
            oneParamert.paramType = "query";
            oneParamert.required = false;

            var pararmOptions = item.types;

            //约定数组第一个为参数类型
            oneParamert.type = pararmOptions[0];


            pararmOptions.splice(1).forEach(function (item) {

                var newItem = item.split('=');

                //该参数是否必须
                //只要用required 字段都是必须的,兼容拼写不严格
                if(newItem[0].toLowerCase() === 'required'
                    || newItem[0].toLowerCase() === 'require'
                    || newItem[0].toLowerCase() === 'must'){

                    oneParamert.required = true;

                }else if(newItem[0].toLowerCase() === 'paramtype'
                    || newItem[0] === 'type'){

                    oneParamert.paramType =  newItem[1] ? newItem[1] : 'query';

                }else {

                    oneParamert[newItem[0]] = newItem[1] ? newItem[1] : '';

                }



            })

            operations.parameters.push(oneParamert);
        }

        // 处理返回值
        if(item.type === 'responseMessages') {
            operations.responseMessages.push(JSON.parse(item.string))
        }
    })

    //把一个api 的操作push 进操作对象里面
    api.operations.push(operations);

    //push 到总的列表
    // 反正也不多..迭代 检查吧..
    var shouldPush = true;
    apiDesc.apis.forEach(function (apiDescitem){
          if(api.path === apiDescitem.path) {
              shouldPush = false;
              return;
          }
    })

    if(shouldPush) {
        apiDesc.apis.push(api);
    }

    //创建文件
//    fs.writeFileSync('./' + apiDesc.resourcePath.replace('/', ''), JSON.stringify(apiDesc));
    fs.writeFileSync(path.join(output,apiDesc.resourcePath.replace('/', '')), JSON.stringify(apiDesc));

}




exports.apiResourceList = apiIndex;

/*!
 *
 * @param path
 * @param {basePath|description|output} options
 */
exports.doxSwagger = function (path, options) {

    var buf = fs.readFileSync(path, 'utf8');


    var obj = dox.parseComments(buf, {});

//    console.log(JSON.stringify(obj.ignore))

    obj.forEach(function (item){

        if(item.ignore || item.isPrivate) {
            return;
        }

        buildApiObject(item, options);
    })

}