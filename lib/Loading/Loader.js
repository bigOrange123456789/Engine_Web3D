import * as THREE from "three"
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'//
import { ZipLoader } from './zip/Ziploader'
import { DRACOLoader } from './dracoLoader/DRACOLoader.js';
export class Loader{
    static ZipLoader=ZipLoader
    static GLTFLoader=GLTFLoader
    constructor(path0,crossOriginSocket,useDraco){
        this.path0=path0
        this.crossOriginSocket=crossOriginSocket
        // this.p2p=p2p
        this.#initLoader(useDraco)
    }
    #initLoader(useDraco)
    {
        this.loaderZip=new THREE.LoadingManager()
        if(useDraco){
            THREE.Cache.enabled = true;
            const dracoLoader = new DRACOLoader();
            dracoLoader.setDecoderPath('assets/textures/draco/');
            dracoLoader.setDecoderConfig({ type: "js" });
            this.glbLoader = new GLTFLoader(this.loaderZip);
            dracoLoader.preload();
            this.glbLoader.setDRACOLoader(dracoLoader);
        }else{
            this.glbLoader = new GLTFLoader(this.loaderZip);
        }
        
    }
    loadGLB(id,cb){
        // if(this.meshes_info[id])return
        // this.meshes_info[id]={request:performance.now()}//true
        // this.detection.request("glb")
        const url=this.path0+id+".glb"
        const loader = new GLTFLoader();
        loader.load(url, gltf=>{
            // gltf.scene.traverse(o=>{
            //     if(o instanceof THREE.Mesh){                    
            //         self.addMesh(id,o)
            //     }
            // })
            if(cb)cb(gltf)
        }, undefined, function (error) {
            console.error(error);
        });
    }
    loadZip(id,cb1,cb2){
        const self=this
        const url=this.path0+id+".zip"
	    new Promise( function( resolve, reject ) {//加载资源压缩包
            const zipLoader=new ZipLoader()
            if(self.crossOriginSocket&&self.crossOriginSocket.length>0){
                const i=Math.floor(Math.random()*self.crossOriginSocket.length)
                zipLoader.crossOriginSocket=self.crossOriginSocket[i]
            }
		    zipLoader.load( url,()=>{
		    },()=>{
			    console.log("加载失败："+id)
			    setTimeout(()=>{//重新请求
			    },1000*(0.5*Math.random()+1))//1~1.5秒后重新加载
		    }).then( ( zip )=>{//解析压缩包
                if(cb1)cb1(zipLoader)
                new ZipLoader().parse(zipLoader.baseUrl,zipLoader.buffer).then( ( zip )=>{//解析压缩包
                    self.loaderZip.setURLModifier( zip.urlResolver );//装载资源
                    resolve({//查看文件是否存在？以及路径
                        fileUrl: zip.find( /\.(gltf|glb)$/i )
                    });
                },()=>{});
		    });
	    } ).then( function ( configJson ) {
		    const loader = self.glbLoader//new GLTFLoader(self.loaderZip);
		    loader.load(configJson.fileUrl[0], (gltf) => {
                if(cb2)cb2(gltf)
		    });
	    } );
    }
    p2pParseNodraco(message,cb){//p2p传输draco数据目前会出一些问题
        const self=this
		new Promise( function( resolve, reject ) {//加载资源压缩包
            new ZipLoader().parse(message.baseUrl,message.buffer).then( ( zip )=>{//解析压缩包
                self.loaderZip.setURLModifier( zip.urlResolver );//装载资源
                resolve({//查看文件是否存在？以及路径
                    fileUrl: zip.find( /\.(gltf|glb)$/i )
                });
            },()=>{});
	    } ).then( function ( configJson ) {
		    const loader = new GLTFLoader(self.loaderZip);
		    loader.load(configJson.fileUrl[0], (gltf) => {
                if(cb)cb(gltf)
		    });
	    } );
    }
    p2pParse(message,cb){//p2p传输draco数据目前会出一些问题
        const self=this
		new Promise( function( resolve, reject ) {//加载资源压缩包
            new ZipLoader().parse(message.baseUrl,message.buffer).then( ( zip )=>{//解析压缩包
                self.loaderZip.setURLModifier( zip.urlResolver );//装载资源
                resolve({//查看文件是否存在？以及路径
                    fileUrl: zip.find( /\.(gltf|glb)$/i )
                });
            },()=>{});
	    } ).then( function ( configJson ) {
		    const loader = self.glbLoader//new GLTFLoader(self.loaderZip);
		    loader.load(configJson.fileUrl[0], (gltf) => {
                if(cb)cb(gltf)
		    });
	    } );
    }
    load(name){
        const self=this
        const path=self.config.path+name+".glb"
        const loader = new GLTFLoader();
        loader.load(path, gltf=>{
            gltf.scene.traverse(o=>{
                if(o instanceof THREE.Mesh){                    
                    // self.scene.add(id,o)
                    // console.log(o.material)
                    o.material=new IndirectMaterial(o.material)
                    // o.material.Json2DataTexture()
                }
            })
            console.log(gltf.scene)
            self.scene.add(gltf.scene)
            // if(cb)cb()
        }, undefined, function (error) {
            console.error(error);
        });
    }
}