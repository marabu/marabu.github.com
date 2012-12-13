'user strict';

/* Services */

angular.module('marabu.services', []).
    factory('Storage', [function() {
        // Object storage (Very very primitive for now)
        var storage = {};

        storage.s = localStorage; // Local storage for now XXX

        storage.get = function(path) {
            return marabu.Json.from(this.s[path]);
        };

        storage.put = function(path, object) {
            this.s[path] = marabu.Json.to(object);
        };

        storage.del = function(path) {
            delete this.s[path];
        };

        storage.exists = function(path) {
            return marabu.Objects.isDefined(this.s[path]);
        };

        return storage;
    }]).
    factory('Documents', ["$http",  "Storage", "Accounts",  function($http, Storage, Accounts) {
        // Document storage
        var storage = Storage;
        var DOCS_KEY = ".marabu.documents";  // Should be in home
        var mdc = new Markdown.Converter();

        var docs = {
            entries: storage.get(DOCS_KEY) || {}
        };

        var save = function() {
            storage.put(DOCS_KEY, docs.entries);
        };
        
        var store = function( document ) {
            docs.entries[document.metadata.name] = { store : "Local", path: document.metadata.name };
            save();            
            document.save();
        };

        docs.add = function(name) {
            this.entries[name] = { store : "Local", path: name };
            save();
            var nd = new docs.Document( {
                metadata: {
                    name: name,                    
                    cre: new Date(),
                    mod: new Date(),
                    store : "Local",
                    remoteId : undefined
                },
                model : '@name = "' + name + '"',
                modelError : null,
                text : "{{name}}\n========",
                textError : null,
                jsModel : null,
                runtimeModel : null,
                debugModel : null
            });
            nd.save();
            return nd;
        };
        
        
        docs.load = function(gist) {
            
            var gitHub = new marabu.GitHub( $http );
            var _docs = this;
            
            gitHub.gist( gist ).success(
                function( data ) {
                    var nd = new _docs.Document( marabu.Json.from( data.files["document.json"].content ) );
                    store( nd );                    
                }
            ).error( function() { alert( "Could not load gsit : " + gist + "." ); } );            
            
        };
        

        docs.del = function(name) {
            var entry = this.entries[name];
            storage.del(entry.path);
            delete this.entries[name];
            save();
        };

        docs.all = function() {
            return this.entries;
        };

        docs.get = function(name) {
            var entry = this.entries[name];
            var d = storage.get(entry.path);
            return new docs.Document(d);
        };
        
        docs.saveRemote = function( name ) {
            var entry = docs.entries[name];
            if ( entry.store === "Local") {
                entry.store = "GitHub"; 
                save();
            }
            Accounts.active[entry.store].save( new docs.Document( storage.get(entry.path) ) );
        };

        docs.Document = function(opt) {
            marabu.Objects.extend(this, opt);
        };

        docs.Document.prototype.save = function() {
            
            // XXX Fundamentaly wrong it saves also debug and runtime
            // models. Recursive structures make it hang.
            
            var entry = docs.entries[this.metadata.name];
            this.metadata.mod = new Date();
            storage.put(entry.path, this);
        };
                
        docs.Document.prototype.del = function() {
            var entry = docs.entries[name];
            storage.del(entry.path);
            delete docs.entries[this.name];
            docs.save();
        };

        docs.Document.prototype.html = function() {
            this.textError = undefined;
            return mdc.makeHtml(this.text);
        };

        docs.Document.prototype.updateModel = function() {
            // Let's try to produce runtime model
            this.modelError = undefined;
            try {
                // XXX Merge the runtime and debug model
                // XXX Add metadata about model such as types and ranges
                // XXX errors should also be per element in model
                
                // var nodes = CoffeeScript.nodes( this.model );


                this.jsModel = "new function() { \n" + 
                                CoffeeScript.compile( this.model ) +
                                "\n}";
                
                this.runtimeModel = eval( this.jsModel );
                
                this.debugModel = [];
                                
                for(var key in this.runtimeModel) {
                   var val = this.runtimeModel[key];
                   this.debugModel.push( { 
                       name : key, 
                       type : val ? val.constructor.name : "-", //.constructor.name, 
                       value : val ? val : "undefined",
                       asString : val ? val.toString() : "undefined" 
                   } );
                }
                                
                return this.runtimeModel;
            }
            catch (ex) {
                this.modelError = ex;
            }            
        };

        return docs;
    }]).
    factory('Accounts', ["$http", "Storage", function($http, Storage) {

        var ACCOUNTS_PATH = "/etc/.accounts";
        
        var accounts = Storage.get(ACCOUNTS_PATH) || {}; // contains accounts which should be remembered

        var saveAccounts = function() {
            Storage.put(ACCOUNTS_PATH, accounts);            
        };
        
        var services = {};
        
        var _acc = {
            active : {}
        };

        

        // Creates login beased on memo
        _acc.login = function( account ) {
            var ns = new services[account.type](account);
            
            _acc.active[account.type] = ns;
            if ( account.remember ) {
                accounts[account.type] = account;
                saveAccounts();
            }
            
        };
        
        _acc.logout = function( account ) {
            delete this.active[account.type];
            delete accounts[account.type];
            saveAccounts;
        };
         
        _acc.createRoot = function( account ) {
            this.active[account.type].createRoot();
        };
        
        _acc.synchronize = function() {
            alert( "Synchronizing" );
        };
        
        services.GitHub = function( account ) {
            
            if ( "GitHub" !== account.type ) {
                throw "Illegal State GitHub login with account type " + account.type;
            }
            
            this.account = account;
            this.client = new marabu.GitHub( $http );
            this.user = this.client.login( account.username, account.password );
            
            this.createRoot = function() {
                var home = {
                description: "Marabu : Home",
                public: false,
                files: {
                  ".docs.json": {
                    "content": '[]'
                  }
                }
              };
              
              this.client.createGist( home ).success( function( data ) {
                  var gist = marabu.Json.from( data );
                  Storage.put( ROOT_PATH, { type : "GitHub", id : gist.id } );
              });
            };
            
            this.save = function( doc ) {
                var gist = {
                    description: doc.metadata.name,
                    public: false,
                    files : {
                         "document.json" : {
                            "content" : marabu.Json.to( doc, true )
                         }
                    }
                };
                
                if ( !doc.metadata.remoteId ) {
                   this.client.createGist( gist ).success( function( data ) {
                        var gist = marabu.Json.from( data );
                        doc.metadata.remoteId = gist.id;                        
                        doc.save();
                        return gist;
                    }); 
                }
                else {
                   this.client.updateGist( doc.metadata.remoteId, gist ); 
                }                
            };
                        
        };
        
                
        marabu.Collections.forEach( accounts, function(account) { _acc.login( account ); } );
        
        
        return _acc;
    }]);
