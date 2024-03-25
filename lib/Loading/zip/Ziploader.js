/**
 * @author Takahiro / https://github.com/takahirox
 */
import {
  LoaderUtils,
  DefaultLoadingManager,
  FileLoader
} from 'three';
import JSZip from 'jszip';
export class ZipLoader {//需要服务器
    constructor( manager ) {
		this.manager = ( manager !== undefined ) ? manager : DefaultLoadingManager;
		this.crossOriginSocket=""
	}
	load( url, onProgress, onError ) {
		const checkJSZipAvailability= onError => {
			if ( typeof JSZip === 'undefined' ) {
				var error = new Error( 'ZipLoader: Import JSZip https://stuk.github.io/jszip/' );
				if ( onError !== undefined ) {
					onError( error );
					return false;
				} else {
					throw error;
				}
			}
			return true;
		}
		if ( ! checkJSZipAvailability( onError ) ) return;

		var scope = this;

		var promise = JSZip.external.Promise;

		var baseUrl = 'blob:' + LoaderUtils.extractUrlBase( url );
		scope.baseUrl=baseUrl

		return new promise( function ( resolve, reject ) {
			if(scope.crossOriginSocket==""){//同源请求
				var loader = new FileLoader( scope.manager );
				loader.setResponseType( 'arraybuffer' );
				loader.load( url, resolve, onProgress, reject );
			}else{//跨源请求
				var oReq = new XMLHttpRequest();
				oReq.open(
					"POST", 
					scope.crossOriginSocket,//+socket0, 
					// "https://"+scope.crossOriginSocket,//+socket0, 
					true);
				oReq.responseType = "arraybuffer";
				oReq.onload = ()=>resolve(oReq.response)//接收数据
				oReq.onerror=e=>reject(e)//异常处理
				oReq.send(url);//发送请求
			}
		} ).then(  buffer => {
			scope.buffer=buffer
		} )

	}
	parse(baseUrl,buffer,onerror){
		var promise = JSZip.external.Promise;
		return new promise( function ( resolve, reject ) {
			resolve(buffer);
		} ).then( function ( buffer ) {
			return JSZip.loadAsync( buffer );

		} ).then( function ( zip ) {

			var fileMap = {};

			var pendings = [];

			for ( var file in zip.files ) {

				var entry = zip.file( file );

				if ( entry === null ) continue;

				pendings.push( entry.async( 'blob' ).then( function ( file, blob ) {

					fileMap[ baseUrl + file ] = URL.createObjectURL( blob );

				}.bind( this, file ) ) );

			}

			return promise.all( pendings ).then( function () {

				return fileMap;

			} );

		} ).then( function ( fileMap ) {

			return {

				urlResolver: function ( url ) {

					return fileMap[ url ] ? fileMap[ url ] : url;

				},

				find: function ( query ) {

					if ( typeof query === 'string' ) {

						query = new RegExp( query.replace( /\./g, '\\.' ) );

					}

					var files = [];

					for ( var key in fileMap ) {

						if ( key.match( query ) !== null ) {

							files.push( key );

						}

					}

					return files;

				}

			};

		} ).catch( onerror );
	}
}
