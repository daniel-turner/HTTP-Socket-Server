var net = require('net');
var resources = require('./resources.js');
var PORT = 6969;
var CONTENT_MODIFICATION_DATE = "Sat, 29 Oct 1994 19:43:31 GMT"; //for testing if-modified-since functionality
var HTTP_RESPONSE_CODES = {

  200 : "OK",
  404 : "Not Found",
  403 : "Forbidden",
  500 : "Internal Server Error",
  302 : "Found",
  304 : "Not Modified"
};

// console.log(resources().fourOFour);

function getHeader(code, contentLength) {

  var header = "HTTP/1.1 " + code + " " + HTTP_RESPONSE_CODES[code];
  header += " Server: daniels_server";
  header += " Date: " + new Date().toUTCString();
  header += " Content-Type: text/html; charset=utf-8";
  header += " Content-Length: " + contentLength;
  header += " Connection: close";

  return header;
};

function clientConnected(client) { //'connection' listener

  client.setEncoding('utf8');

  client.on('end', function() {

    client.end();
  });

  client.on('data', function(chunk) {

    var messageArray = chunk.split(" ");
    var header;
    var body;
    var response;

    var ifModifiedSinceIndex = messageArray.indexOf("If-Modified-Since:");

    if(ifModifiedSinceIndex) {

      var ifModifiedSinceTime;

      for(var i = 1; i < 7; i++) {

        ifModifiedSinceTime += messageArray[ifModifiedSinceIndex + i];
      }

      if(ifModifiedSinceTime) {

        if(Date.parse(ifModifiedSinceTime) > Date.parse(CONTENT_MODIFICATION_DATE)) {

          response = getHeader(304, 0);
        }
      }
    }

    if(!response) {

      switch (messageArray[0]) {

        case "GET":

          switch (messageArray[1]) {

            case "/hydrogen.html":

              body = resources().htmlHydrogen;
              header = getHeader(200, body.length);
              response = header + "\n\n" + body;

              break;

            case "/":
            case "/index.html":

              body = resources().htmlIndex;
              header = getHeader(200, body.length);
              response = header + "\n\n" + body;

              break;

            case "/css/styles.css":

              body = resources().cssStyles;
              header = getHeader(200, body.length);
              response = header + "\n\n" + body;

              break;

            default:

              body = resources().fourOFour;
              header = getHeader(404, body.length);
              response = header + "\n\n" + body;
              break;
          }
          break;

        case "POST":

          break;

        case "PUT":

          break;

        case "DELETE":

          break;

        case "HEAD":

          response = getHeader(200, 0);

          break;

        case "OPTIONS":

          break;

        default:

          break;
      }
    }

    console.log(response);

    if(!response) {

      response = getHeader(500,0);
    }

    client.write(response);
    client.end();
  });
};

var server = net.createServer(clientConnected);

server.listen(PORT,function() {

  console.log('server bound to ' + PORT);
});