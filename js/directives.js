'use strict';

/* Directives */

angular.module('marabu.directives', []).
  directive('marabuDocView', function($timeout, $compile /*, marabu */) {
      
    return {
        replace: true,        
        restrict: 'E',
        scope: {
            __DOC__ : "=document"
        },

        compile: function compile(tElement, tAttrs, transclude) {
            // alert( "Compiling " );            
            return {
                pre : function(scope, element, attrs) {
                    // scope.$$document = scope.$parent.$eval(attrs.document);
                    // alert("Pre");
                },
                post : function(scope, element, attrs) {
                    // used to update the UI
                    var updateDocument = function( newValue, oldValue ) {

                       if ( !newValue ) {
                           return; // XXX clear the html
                       }

                       marabu.Objects.strip( scope, scope.__DOC__.runtimeModel );
                       scope.__DOC__.updateModel();
                       marabu.Objects.extend( scope, scope.__DOC__.runtimeModel );

                       try {
                          // XXX later make a diff only
                          // Would backbone help?

                          // when the 'compile' expression changes
                          // assign it into the current DOM
                          element.html( scope.__DOC__.html() );

                          // compile .childNodes so that
                          // we don't get into infinite loop compiling ourselves
                          $compile(element.contents())(scope);

                          }
                          catch ( ex ) {
                            scope.__DOC__.textError = ex;
                          }
                     };

                  // watch the expression, and update the UI on change.
//                  scope.$watch( "__DOC__.text", updateDocument() );
//                  scope.$watch( "__DOC__.model", updateDocument() );
                  scope.$watch( "__DOC__" , updateDocument, true );
                                    
//                  updateDocument( scope.__DOC__, "brr"); // First update
                }
            };    
        }
     };
  }).
  directive('canvas', function($compile) {
      
    return {
        template : "<div></div>",
        replace: true,
        // transclude: true,
        restrict: 'E',
        require : "ngModel",
        //scope: {},
//        controller : function($scope, $attr) {
//            alert( "Creating Controller " + $scope.$id);
//        },
        compile: function compile(tElement, tAttrs, transclude) {
            alert( "Compiling " + tElement[0] );
                    
            var stage = new Kinetic.Stage({
                container: tElement[0],
                width: tAttrs.width || 150,
                height: tAttrs.height || 100
            });
            
            var layer = new Kinetic.Layer();            
            var layer2 = new Kinetic.Layer();

            var rect = new Kinetic.Rect({
                x: 0,
                y: 0,
                width: 10,
                height: 10,
                fill: 'green',
                stroke: 'black',
                strokeWidth: 1
            });
            
            var rect2 = new Kinetic.Rect({
                x: 50,
                y: 50,
                width: 10,
                height: 10,
                fill: 'red',
                stroke: 'blue',
                strokeWidth: 1
            });
                        
            layer.add(rect);
            layer2.add(rect2);
            //stage.add(layer);
            // stage.draw();
            
            return {
                pre : function(scope, element, attrs, ngModel) {
                    alert( "Canvas Pre Link" + attrs.ngModel);
                },
                post : function(scope, element, attrs, ngModel) {
                                  
                  stage.add(layer);
                  stage.add(layer2);
                  
//                  var le = angular.element( stage.getDOM() );
//                  
//                  le.css( "width", "100%" );
//                  
//                  le = angular.element( layer.getCanvas().getElement() );
//            
//                  le.css( "width", "100%" );

            
                  alert( "Canvas Post Link");  
            
                  // used to update the UI
                  var updateCanvas = function( newValue, oldValue ) {
                      rect.setX( newValue );
                      stage.draw();
                      alert( "Updating canvas" + newValue);
                  };
                  
                  scope.$watch( attrs.ngModel, updateCanvas );
                  
                  updateCanvas(); // First update
                }
            };    
        }
     };
  }).        
  // directive('uiCodemirror', ['ui.config', '$parse', function (uiConfig, $parse) {
  directive('uiCodemirror', [ '$parse', function ($parse) {
    'use strict';

    //uiConfig.codemirror = uiConfig.codemirror || {};
        return {
          require: 'ngModel',
          link: function (scope, elm, attrs, ngModel) {
            // Only works on textareas
//            if (!elm.is('textarea')) {
//              throw new Error('ui-codemirror can only be applied to a textarea element');
//            }

            var codemirror;
            // This is the method that we use to get the value of the ui-codemirror attribute expression.
            var uiCodemirrorGet = $parse(attrs.uiCodemirror);
            // This method will be called whenever the code mirror widget content changes
            var onChangeHandler = function (ed) {
              // We only update the model if the value has changed - this helps get around a little problem where $render triggers a change despite already being inside a $apply loop.
              var newValue = ed.getValue();
              if (newValue !== ngModel.$viewValue) {
                ngModel.$setViewValue(newValue);
                scope.$apply();
              }
            };
            // Create and wire up a new code mirror widget (unwiring a previous one if necessary)
            var updateCodeMirror = function (options) {
              // Merge together the options from the uiConfig and the attribute itself with the onChange event above.
              options = angular.extend({}, options /*, uiConfig.codemirror */);

              // We actually want to run both handlers if the user has provided their own onChange handler.
              var userOnChange = options.onChange;
              if (userOnChange) {
                options.onChange = function (ed) {
                  onChangeHandler(ed);
                  userOnChange(ed);
                };
              } else {
                options.onChange = onChangeHandler;
              }

              // If there is a codemirror widget for this element already then we need to unwire if first
              if (codemirror) {
                codemirror.toTextArea();
              }
              // Create the new codemirror widget
              codemirror = CodeMirror.fromTextArea(elm[0], options);
            };

            // Initialize the code mirror widget
            updateCodeMirror(uiCodemirrorGet());

            // Now watch to see if the codemirror attribute gets updated
            scope.$watch(uiCodemirrorGet, updateCodeMirror, true);

            // CodeMirror expects a string, so make sure it gets one.
            // This does not change the model.
            ngModel.$formatters.push(function (value) {
              if (angular.isUndefined(value) || value === null) {
                return '';
              }
              else if (angular.isObject(value) || angular.isArray(value)) {
                throw new Error('ui-codemirror cannot use an object or an array as a model');
              }
              return value;
            });

            // Override the ngModelController $render method, which is what gets called when the model is updated.
            // This takes care of the synchronizing the codeMirror element with the underlying model, in the case that it is changed by something else.
            ngModel.$render = function () {
              codemirror.setValue(ngModel.$viewValue);
            };
          }
        };
}]);
