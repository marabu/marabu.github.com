/*  Marabu library
 * 
 *  Namspace for functions. Based on Java packages.
 *    
 *  XXX Probably move from angular to underscore
 *  XXX Add import 
 *  XXX Add service loaders / lookup
 */

// 'use strict';

(function(window) {
    
    marabu = window.marabu || (window.marabu = {});

    //var window = window;
    var services = {};

    marabu.import = function() {
        
    };

    marabu.lookup = function( fn ) {
        // XXX imlement me
    };
    
    marabu.factory = function( fac ) {
        
    };

    // Utility methods for String
    marabu.Strings = {

        startsWith : function( str, start ) {
            return str.substring(0, start.length) === start;
        } 

    };

    marabu.Objects = {
        isDefined : angular.isDefined,
        isUndefined : angular.isUndefined,
        extend : angular.extend,
        size : _.size,
        values : _.values,
        keys : _.keys,
        strip :  function( dst ) {
                    marabu.Collections.forEach(arguments, function(obj) {
                        if (obj !== dst) {
                          marabu.Collections.forEach(obj, function(value, key){
                            delete dst[key];
                          });
                        }
                    });
                    return dst;
                  }
    };

    marabu.Collections = {
        forEach : angular.forEach,
        copy : angular.copy
    };

    marabu.Json = {
        to : angular.toJson,
        from : angular.fromJson
    };

    marabu.Base64 = {
        to : function( text ){ return window.btoa(text); },
        from : function( text ){ return window.atob(text); }
    };

    marabu.XML = {
        from : function( str ) {
            var xmlDoc = null;
            if (window.DOMParser) {
                var parser = new DOMParser ();
                xmlDoc = parser.parseFromString (str, "application/xml");
            } else if (window.ActiveXObject) {
                xmlDoc = new ActiveXObject ("Microsoft.XMLDOM");
                xmlDoc.async = false;
                xmlDoc.loadXML (str);
            }
            return xmlDoc;
        }
    };
    
    marabu.GitHub = function( http, url ) {
        
        this.http = http;
        this.url = url || "https://api.github.com/";
        this.headers = {};
        
    };
    
    marabu.GitHub.prototype.login = function( username, password ) {
        
        var authorization = null;
        
        if ( username && password ) {
            authorization = 'Basic ' + marabu.Base64.to(username + ':' + password);
        }
        else if ( auth === 'oauth' && username ) {
            authorization = 'token ' + options.token;
        }
        
        if ( authorization === null ) {
            return null;
        }
        
        /// this.headers.Authorization = "Basic aHJlYmVqazprcjBwYWNlaw==";
        /// this.headers = {"Authorization" : authorization};
        this.headers["Authorization"] = authorization;
        this.readUser();
        
        return this.user;
    };
    
    marabu.GitHub.prototype.logout = function() {
        delete this.headers['Authorization'];
        this.user = undefined;        
    };

    marabu.GitHub.prototype.readUser = function() {
        this.user = this.http({
                url: this.url + "user",
                headers: this.headers, 
                method: "GET"
            }).then(function(data) {
                var user = marabu.Json.from(data.data);
                return user;
            });
        
        
//        return this.user = this.http( config ).then(function(data) {
//            return ( marabu.Json.from(data.data) );
//        });
    };

    /* Tries to read gist of given id. */
    marabu.GitHub.prototype.gist = function(id) {
        return this.http({url: this.url+ "gists/" + id, // + "?callback=JSON_CALLBACK",
            method: "GET",
            headers: this.headers
        });
    };

    /* Reads list of gist for authenticated user 
     * XXX really read all of them not just first page 
     */
    marabu.GitHub.prototype.gists = function() {
        return this.http({url: this.url + "gists",
            method: "GET",
            headers: this.headers
        });
    };

    marabu.GitHub.prototype.createGist = function(gist) {
        return this.http({url: this.url + "gists",
            method: "POST",
            headers: this.headers,
            data: gist
        });
    };

    marabu.GitHub.prototype.updateGist = function(id, gist) {
        return this.http({url: this.url + "gists/" + id,
            method: "PATCH",
            headers: this.headers,
            data : gist
        });
    };
})(window);