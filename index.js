var http            	= require("http");
var express         	= require("express");
var bodyParser 		    = require('body-parser')
var app 				= express();
var eventsEmit      	= require('events').EventEmitter;
var eventsEmitter   	= new eventsEmit();
var port            	= 8005; 
var proxyInfo			= "http://m.molinari:crush.2017@192.168.12.200:8080";


//custom port
    if(process.argv[2]){
        port = process.argv[2];
    }
//end

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({ type: 'application/json' } ));

eventsEmitter.on("message",function(res,message){
	res.end(JSON.stringify(message)); 
});

eventsEmitter.on("before_call",function(res,message){
    //before data_processing
    

    //end
});

eventsEmitter.on("call_elastic",function(res,args){
    
    var request = require("request");
    var optionsRequest = {
        method: 'GET',
        proxy: proxyInfo,
        url: 'http://192.168.13.121:9200/nifitester/_search?q='+args+'&size=10&pretty',
        };
        console.log(optionsRequest);
        request(optionsRequest, function optionalCallback(err, httpResponse, body) {
            //console.log(httpResponse);
            if (err) {
                eventsEmitter.emit("message",res,{message:'Call Dashboard API failed\nresponse:',code:"KO"});
                return console.error('Call Dashboard API failed\nresponse:', err);
            }
        
            var responseArr = JSON.parse(body);               
            if(responseArr.hits.total){
                eventsEmitter.emit("message",res,{message:{"total_found":responseArr.hits.total,"data":responseArr.hits.hits},code:"OK"});    
                return;                              
            }else{
                eventsEmitter.emit("message",res,{message:{"total_found":0,"data":""},code:"OK"});
                return;            
            }
            
        });

});

eventsEmitter.on("data_processing",function(res,argsRequest){
    //elaborazione dati
    
    switch(argsRequest.keyword){
        case 'miner':
            switch(argsRequest.parameters){
                case 'search':
                    console.log(argsRequest.values);
                    console.log(typeof(argsRequest.values));
                    console.log(JSON.parse(argsRequest.values));
                    var arrValues = JSON.parse(argsRequest.values);

                    if(!arrValues.length){
                        eventsEmitter.emit("message",res,{message:"Nessun parametro passato come valore della ricerca",code:"KO"}); 
                        return;
                    }
                    //console.log(typeof(JSON.stringify(argsRequest.values)));
                    
                    var valueSearch = "";
                    for(var index=0; index<arrValues.length;index++){
                        valueSearch = arrValues[index].value;
                        console.log(index+"=="+arrValues.length);
                        if(index==arrValues.length-1){
                            eventsEmitter.emit("call_elastic",res,valueSearch);
                        }
                    }
                        
                    
                break;
            }
        break;
        case 'Feed2':
        
        break;
    }
    //end
    //eventsEmitter.emit("message",res,{message:"Sono l'evento che si occupa di elaborare la richiesta effettuata per: "+argsRequest.keyword+" ----- "+argsRequest.parameters+" ----- "+argsRequest.values,code:"KO"}); 
    //return;
});

eventsEmitter.on("after_call",function(res,message){
    //after data_processing
    

    //end
});


app.post('/botdataprocessing', function (req, res) {
   console.log(req.body);   
    if(parseInt(req.body.data.length)>0){ 
        eventsEmitter.emit("data_processing",res,JSON.parse(req.body.data[0])); 
    }else{ 
        eventsEmitter.emit("message",res,{message:"Nessun parametro specificato per la richiesta ",code:"KO"}); 
    }
});

 
app.listen(port, function () {
    //console.log('Example app listening on port 3000!') 
})
  

console.log("//   /$$$$$$$$       /$$                           /$$                  /$$$$$$            /$$");
console.log("//  | $$_____/      | $$                          |__/                 /$$__  $$          | $$");
console.log("//  | $$    /$$$$$$ | $$$$$$$   /$$$$$$   /$$$$$$  /$$  /$$$$$$$      | $$   __/  /$$$$$$ | $$");
console.log("//  | $$$$$|____  $$| $$__  $$ |____  $$ /$$__  $$| $$ /$$_____/      |  $$$$$$  /$$__  $$| $$");
console.log("//  | $$__/ /$$$$$$$| $$    $$  /$$$$$$$| $$   __/| $$|  $$$$$$         ____  $$| $$   __/| $$");
console.log("//  | $$   /$$__  $$| $$  | $$ /$$__  $$| $$      | $$  ____  $$       /$$    $$| $$      | $$");
console.log("//  | $$  |  $$$$$$$| $$$$$$$/|  $$$$$$$| $$      | $$ /$$$$$$$/      |  $$$$$$/| $$      | $$");
console.log("//  |__/    _______/|_______/   _______/|__/      |__/|_______/         ______/ |__/      |__/");
console.log("//                                                                                            ");
console.log("//  API Service Bot Data Processing Ver 1.0.0 - Service Active on port: " +port+" - Copyright Fabaris SRL 2017");