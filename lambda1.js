/**
 * Función que realiza la invocación de la función para obtener el token de autenticación necesario para 
 * consumir el web service SecurityProxy/creditos/historicos, el cual devuelve el histórico de créditos del usuario.
 * 
 * @author ICX
 * @param {event} JSON con la información enviada por el API Gateway.
 * 
 * @returns  {response} JSON con la respuesta del servicio web SecurityProxy/creditos/historicos junto con el código de respuesta de la función.
 */
var aws = require('aws-sdk');
aws.config.region = 'us-east-1';
var lambda = new aws.Lambda();
exports.handler = async(event, context, callback, params, query, headers) => {
    
    // console.log("event:" + JSON.stringify(event));
    // var eventBody = JSON.parse(event.body);
    
    let accessToken = await getAccessToken();
    accessToken = JSON.parse(accessToken);
    
    var date = new Date();
    var timestamp = date.getTime();
    var transactionID = "" + timestamp;
    
    // var securityHeader = { 
    //     "Header": { 
    //         "SecurityHeader": { 
    //             "User": process.env.user, 
    //             "Password": process.env.password, 
    //             "Username": process.env.username, 
    //             "Token": accessToken.body.TokenGeneratorResponse.Body.access_token
    //         }, 
    //         "System": { 
    //             "InputSystem": process.env.inputSystem, 
    //             "ApplicationID": process.env.applicationID, 
    //             "TransactionID": transactionID, 
    //             "IPAddress": process.env.ipAddress, 
    //             "Branch": process.env.branch,
    //             "TerminalID": process.env.terminalID
    //         } 
    //     } 
    // };
    
    // securityHeader = JSON.stringify(securityHeader);
    
    var User = "53036634"; 
    var Password = "UzRudDRuZDNyMjAxOSo="; 
    var Username = "SVCQAFABRICA"; 
    var Token = "U1ZDQ09CUkFOWkExNTUwMDg1NTE0Njg23";
    var InputSystem = "01"; 
    var ApplicationID = "SWPR157"; 
    var TransactionID = "201901801115"; 
    var IPAddress = "0.0.0.0"; 
    var Branch = "33";
    var TerminalID = "011";
    
    var securityHeader = { 
        "Header": { 
            "SecurityHeader": { 
                "User": User, 
                "Password": Password, 
                "Username": Username, 
                "Token": Token
            }, 
            "System": { 
                "InputSystem": InputSystem, 
                "ApplicationID": ApplicationID, 
                "TransactionID": TransactionID, 
                "IPAddress": IPAddress, 
                "Branch": Branch,
                "TerminalID": TerminalID
            } 
        } 
    };

    securityHeader.Header.SecurityHeader.Token = accessToken.body.TokenGeneratorResponse.Body.access_token;

    var nonce = "" + timestamp;
    securityHeader.Header.System.TransactionID = nonce;
    
    
    let historico = await getHistorico(securityHeader);
    
    const response = {
        statusCode: 200,
        body: historico,
    };
    return response;
};

/**
 * Función que realiza el consumo del servicio web SecurityProxy/creditos/historicos, el cual devuelve el histórico de créditos del usuario.
 * 
 * @param {securityHeader} Token de autenticación para consumo del web service
 * @param {eventBody} JSON con los parámetros para la consulta del servicio
 * @param {eventBody.tipoIdentificacion} Tipo de identificación del usuario
 * @param {eventBody.legalID} Número de identificación del usuario
 * 
 * @returns  {response} JSON con la respuesta del servicio web SecurityProxy/creditos/historicos.
 */
async function getHistorico(securityHeader) {
    
    // var options = {
    //     host: hostBus,
    //     port: null,
    //     path: pathHistoricos + '?legalID=' + legalID + '&tipoIdentificacion=' + tipoIdentificacion,
    //     method:  'GET',
    //     headers: {
    //         'Content-Type': 'application/json',
    //         'SecurityHeader': securityHeader
    //     }
    // };
    var data =JSON.stringify({
        	"producto": {
        		"id": "4280057431"
            },
        	"fechaInicioTransaccion": "2018-01-01",
        	"fechaFinTransaccion": "2018-12-12",
        	"movimientosDia": "N",
        	"movimiento":{
        	
        	    "tipoTransaccion":{
        	        "id": ""
        	        
        	    }
        	}
        	
        });
        
    var options = {
        host: 'esbintprutls.compensar.com',
        port: 443,
        path: '/Compensar/SecurityProxy/Bancor/HistoricoMovimientos',
        method:  'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length,
            'SecurityHeader': securityHeader
        },
        
    };
    
    console.log("options: " + JSON.stringify(options));
    
    var responsejson = "";
    var https = require('https');
    return new Promise(function(resolve, reject){
        const req = https.request(options, (res) => {
            res.on('data', function(cbresponse) {
                responsejson += cbresponse;
            });
            res.on('end', function() {
                console.log("response:" + responsejson);
                console.log(responsejson)
                resolve(responsejson);
                // resolve(JSON.stringify(responsejson));
            });
        });
        req.on('error', function (e) {
            console.log("error: " + e);
            reject({
                "error" : e
            });
        });
        req.write(data)
        req.end();
    });
}

/**
 * Función que realiza el consumo del servicio web de autenticación.
 * 
 * @param {functionName}
 * 
 * @returns  {response} Token de autenticación para el consumo del webservice.
 */
async function getAccessToken(){
    
    var functionName = "arn:aws:lambda:us-east-1:956371136502:function:factory-imaginecx-wslogintls2";
    
    var params = {
        FunctionName: functionName, 
        InvocationType: 'RequestResponse ',
        LogType: 'Tail',
        Payload: '{}'
    };
    
    console.log("params: " + JSON.stringify(params));
    
    return new Promise(function(resolve, reject){
        lambda.invoke(params, function(e, data) {
            if (e) {
                reject(e);
                console.log("error: " + e);
            } else {
                console.log("response: " + data.Payload);
                resolve(data.Payload);
            }
        });
    });
}


// exports.handler = async(event, context, callback, params, query, headers) => {
    
//     let login = await invokeLogin();
//     login = JSON.parse(login);
//     console.log("login response: " + login);
    
//     //TODO Reemplazar por variables de entorno
//     var User = "53036634"; 
//     var Password = "UzRudDRuZDNyMjAxOSo="; 
//     var Username = "SVCQAFABRICA"; 
//     var Token = "U1ZDQ09CUkFOWkExNTUwMDg1NTE0Njg23";
//     var InputSystem = "01"; 
//     var ApplicationID = "SWPR157"; 
//     var TransactionID = "201901801115"; 
//     var IPAddress = "0.0.0.0"; 
//     var Branch = "33";
//     var TerminalID = "011";
    
//     var securityHeader = { 
//         "Header": { 
//             "SecurityHeader": { 
//                 "User": User, 
//                 "Password": Password, 
//                 "Username": Username, 
//                 "Token": Token
//             }, 
//             "System": { 
//                 "InputSystem": InputSystem, 
//                 "ApplicationID": ApplicationID, 
//                 "TransactionID": TransactionID, 
//                 "IPAddress": IPAddress, 
//                 "Branch": Branch,
//                 "TerminalID": TerminalID
//             } 
//         } 
//     };

//     securityHeader.Header.SecurityHeader.Token = login.body.TokenGeneratorResponse.Body.access_token;

//     var date = new Date();
//     var timestamp = date.getTime();
//     var nonce = "" + timestamp;
//     securityHeader.Header.System.TransactionID = nonce;
    
//     let string = JSON.stringify(securityHeader)
//     let historico = await obtenerMovimientos(string);
//     console.log("response: " + historico); 
    
//     const response = {
//         statusCode: 200,
//         body: historico,
//     };
//     return response;
// };

// async function invokeLogin(){
    
//     //TODO Reemplazar por variables de entorno
//     var functionName = "arn:aws:lambda:us-east-1:956371136502:function:factory-imaginecx-wslogin";
    
//     var params = {
//         FunctionName: functionName, 
//         InvocationType: 'RequestResponse ',
//         LogType: 'Tail',
//         Payload: '{}'
//       };
//     console.log("login invocation: " + JSON.stringify(params));
//     return new Promise(function(resolve, reject){
//         lambda.invoke(params, function(err, data) {
//             if (err) {
//                 reject(err);
//               console.log("error: " + err);
//             } else {
//                 resolve(data.Payload);
//             }
//         });
//     });
// }

// async function obtenerMovimientos(securityHeader) {
//     //TODO Reemplazar por variables de entorno
//     var legalID = "52902549";
//     var tipoIdentificacion = "1";
    
//     var options = {
//         host: 'esbintprutls.compensar.com',
//         port: null,
//         path: '/Compensar/SecurityProxy/Bancor/HistoricoMovimientos',
//         method:  'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             'SecurityHeader': securityHeader
//         },
//         body:{
//         	"producto": {
//         		"id": "4280057431"
//             },
//         	"fechaInicioTransaccion": "2018-01-01",
//         	"fechaFinTransaccion": "2018-12-12",
//         	"movimientosDia": "N"
//         }
//     };
//     var responsejson = "";
//     var https = require('https');
//     return new Promise(function(resolve, reject){
//         const req = https.request(options, (res) => {
//             res.on('data', function(cbresponse) {
//                 responsejson += cbresponse;
//             });
//             res.on('end', function() {
//                 console.log("response:" + responsejson);
//                 console.log("status code: " + responsejson.statusCode);
//                 resolve(responsejson);
//             });
//         });
//         req.on('error', function (e) {
//             console.log("error: " + e);
//             reject({
//                 "error" : e
//             });
//         });
//         req.end();
//     });
// }
