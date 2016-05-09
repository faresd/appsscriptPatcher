'use strict';


/**
 * Apps script
 */
function appsscript(superagent) {


  function newRequest(method, url) {
    var self = this;
    Emitter.call(this);
    this._query = this._query || [];
    this.method = method;
    this.url = url;
    this.header = {};
    this._header = {};
    this.on('end', function(){
      var res = new Response(self.fetcher);
      if ('HEAD' == method) res.text = null;
      self.callback(null, res);
    });
  }

  superagent.Request = newRequest;

  function newResponse(fetcher, options) {
    options = options || {};
    this.fetcher = fetcher;
    this.text = fetcher.result.getContentText();
    this.setStatusProperties(fetcher.result.getResponseCode());
    this.header = this.headers = fetcher.result.getAllHeaders();
    this.setHeaderProperties(this.header);
    this.body = this.parseBody(this.text);
  }

  superagent.Response =  newResponse;

  function getFetcher() {
    return new Fetcher();
  }


  function Fetcher() {
    this.params = {};
  }

  Fetcher.prototype.setRequestHeader = function(field, value) {
    var headers = {};
    headers[field] = value;
    params.headers = headers;
  }
  Fetcher.prototype.open = function(method, url){
    this.params.method = method;
    this.url = url;
  }
  Fetcher.prototype.send = function(payload){
    var urlFetchApp = UrlFetchApp;
    if (payload)
      this.params.payload = payload;
    var result = urlFetchApp.fetch(this.url, this.params)
    this.result = result;
    return result;
  }


  var reqProto = superagent.Request.prototype;

  // Patch Request.end()


  //var oldEnd = originalMethods.end = superagent.Request.prototype.end;
  reqProto.end = function(cb) {
    var self = this;
    var fetcher = this.fetcher = getFetcher()
    var query = this._query.join('&');
    var data = this._data;

    // store callback
    this._callback = cb || noop;

    // initiate request
    fetcher.open(this.method, this.url, true);

    // body
    if ('GET' != this.method && 'HEAD' != this.method && 'string' != typeof data && !isHost(data)) {
      // serialize stuff
      var serialize = request.serialize[this.getHeader('Content-Type')];
      if (serialize) data = serialize(data);
    }

    // set header fields
    for (var field in this.header) {
      if (null == this.header[field]) continue;
      fetcher.setRequestHeader(field, this.header[field]);
    }

    // send stuff
    var result = fetcher.send(data);
    this.fetcher.result = result;

    self.emit('end');
    return this;
  };

  // Patch Request.send()

  return appsscript; // chaining

}


/**
 * Helpers
 */
