function MarabuCtrl( $scope , Accounts ) {
    
    $scope.Accounts = Accounts; 
        
    $scope.test = "#Some text";   
}

// MarabuCtrl.$inject = [ "$scope", "Accounts"];

function HomeCtrl( $scope, Documents  ) {
    
    $scope.docs = Documents;
    
    $scope.newName = "";
    $scope.newGist = "";
    
    $scope.add = function() {
        $scope.docs.add( $scope.newName );
        $scope.newName = "";
    };
    
    $scope.load = function() {
        $scope.docs.load( $scope.newGist );
        $scope.newGist = "";
    };
      
}

function ViewerCtrl( $scope, $location, $document, Documents ) {
    
    $scope.doc = Documents.get( $location.search()["doc"] ); 
    
}

function AccountsCtrl( $scope, Accounts ) {
    
    $scope.Accounts = Accounts;
    
    $scope.logins = {
       github : {
           type : "GitHub", // Constructor
           username : "",
           password : "",        
           remember : true
       } 
    };
    
    
    $scope.login = function( login ) {
        $scope.Accounts.login( login );       
    };

    $scope.logout = function( login ) {
        $scope.Accounts.logout( login );
    };
    
    $scope.createRoot = function( login ) {        
        $scope.Accounts.createRoot( login );        
    };
    
}

function DebuggerCtrl( $scope, $location, $timeout, Documents ) {
    
    var CURRENT_DOC = $location.search()["doc"];
    
    var _this  = this;
    
    this.save = function() {        
        //Storage.put( CURRENT_DOC, $scope.doc );
        $scope.doc.save();
        $scope.saveCount++;
    };
    
    this.load = function() {        
        return Documents.get( CURRENT_DOC );        
    };

    $scope.location = $location;
    $scope.timeout = $timeout;
        
    $scope.doc = this.load();
        
    $scope.saveCount = 0;
            
    $scope.components = {
        DOC : true, EDIT : true, STYLE : false, MODEL : true, DEBUG : true 
    };
    
    $scope.enableClass = function( component ) {
        return $scope.components[component] ? "" : "disabled";
    };
    
    $scope.toggle = function( component ) {
        $scope.components[component] = !$scope.components[component];
    };
                        
    this.docChange = function(newValue, oldValue) {
        _this.save();
    };
    
    this.modelChange = function(newValue, oldValue) {
                
        if ( newValue === undefined ) {            
            return;
        }
        
        _this.save();
        
        try {            
            $scope.keys = [];
            /*
            for(var key in $scope.obj) {
               var val = $scope.obj[key];
               $scope.keys.push( { 
                   name : key, 
                   type : val ? $scope.obj[key].constructor.name : "-", //.constructor.name, 
                   value : val ? $scope.obj[key] : "undefined",                    
                   asString : val ? $scope.obj[key].toString() : "undefined" } );
            }
            */
            
        }
        catch ( ex ) {
            $scope.ex = ex.toString();
        }
    };

    
    $scope.$watch( 'doc.model', _.debounce(this.modelChange, 100), false );
    $scope.$watch( 'doc.text', _.debounce(this.docChange,1000), false );
    
    _this.modelChange( $scope.doc.model );
    // _this.docChange( $scope.doc.text );
    
}

/** Archive */

// Bootstrap tabs
// --------------

//    $scope.activeTab = 1;
//    
//    $scope.activate = function(nr) {
//        $scope.activeTab = nr;
//    };
//    
//    $scope.isActive = function(nr) {
//        return ( $scope.activeTab === nr ) ? "active" : "";
//    };
