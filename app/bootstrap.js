require.config( {
    paths : {
        angular : 'vendor/angular/angular'
    } ,
    shim : {
        angular : {
            exports : 'angular' ,
            init : function () {
                // ---------------------重要代码段！------------------------------
                // 应用启动后不能直接用 module.controller 等方法，否则会报控制器未定义的错误，
                // 见 http://stackoverflow.com/questions/20909525/load-controller-dynamically-based-on-route-group
                // 代码参考：https://github.com/Treri/angular-require/blob/master/angular-require.js#L44
                var _module = angular.module;
                angular.module = function () {
                    var newModule = _module.apply( angular , arguments );
                    if ( arguments.length >= 2 ) {
                        newModule.config( [
                            '$controllerProvider' ,
                            '$compileProvider' ,
                            '$filterProvider' ,
                            '$provide' ,
                            function ( $controllerProvider , $compileProvider , $filterProvider , $provide ) {
                                newModule.controller = $controllerProvider.register;
                                newModule.directive = $compileProvider.directive;
                                newModule.filter = $filterProvider.register;
                                newModule.factory = $provide.factory;
                                newModule.service = $provide.service;
                                newModule.provider = $provide.provider;
                                newModule.value = $provide.value;
                                newModule.constant = $provide.constant;
                                newModule.decorator = $provide.decorator;
                            }
                        ] );
                    }
                    return newModule;
                };
            }
        } ,
        'vendor/angular/angular-ui-router' : [ 'angular' ] ,
        '../test/angular-mocks' : [ 'angular' ]
    } ,
    map : {
        '*' : {
            'css' : 'vendor/require/css'
        }
    }
} );

require( [
    'angular' ,

    // 第三方库只需要列在这里就可以了
    'vendor/angular/angular-ui-router' ,

    // 如果测试时需要用到 angular-mocks.js 则取消注释，上线前一定记得注释掉，以免多加载一个文件
    '../test/angular-mocks' ,

    // 别忘了依赖 app 模块
    './app' , // 前面的 ./ 必须带上，否则 gulp-rev-all 不会更新引用

    // 公用的服务和指令列在下面。
    // 这些模块因为都依赖 app.js ，所以必须声明在这里而不是 app.js 里。
    'services/UserLoginService' ,
    'directives/focus-me'
] , function ( angular ) {
    angular.module( 'all' , [ 'ui.router' , 'app' ] ); // 注意：app 模块只能放在最后一个，因为它依赖前面的第三方模块！
    angular.module( 'bootstrap' , [ 'all' ] ); // 单独加一个 all 模块的原因见 test/protractor.conf.js 的 onPrepare 事件
    angular.bootstrap( document , [ 'bootstrap' ] );
} );