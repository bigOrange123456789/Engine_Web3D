import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { PlayerControl } from '../playerControl/PlayerControl.js'
import {Panel } from './Panel.js'
import{Engine3D}from'../Engine3D.js'
export class StartSampling{
    constructor(body,config,Building){
        this.config=config.main//.src.main
        this.body = body
        this.canvas = document.getElementById('myCanvas')
        this.initScene(Building)
        console.log(config)
        new Panel(config)
    }
    async initScene(Building){
        this.renderer = new THREE.WebGLRenderer({
            // alpha:true,
            // antialias: true,
            // canvas:this.canvas,
            // preserveDrawingBuffer:true
            antialias: false,//关闭抗锯齿
            preserveDrawingBuffer: true//将每一帧缓存到renderer.domElement中
        })
        ////////////////////////////////////////////////////////////////////////
        // this.renderer.physicallyCorrectLights = true //正确的物理灯光照射
        // this.renderer.outputEncoding = THREE.sRGBEncoding //采用sRGBEncoding 
        // this.renderer.toneMapping = THREE.ACESFilmicToneMapping //aces标准
        // this.renderer.toneMappingExposure = 1//1.25 //调映射曝光度
        // this.renderer.shadowMap.enabled = true //阴影
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap //阴影类型（处理运用Shadow Map产生的阴影锯齿）
        ////////////////////////////////////////////////////////////////////////

        this.renderer.setSize(800,800)//(this.body.clientWidth,this.body.clientHeight)
        // console.log(this.renderer.domElement.width)
        this.renderer.setPixelRatio(window.devicePixelRatio)
        window.renderer=this.renderer
        this.body.appendChild(this.renderer.domElement)
        
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        this.renderer.setClearColor(0xffffff);//(0xcccccc);

        this.renderer.autoClear = true;



        this.stats = new Stats();
        this.stats.domElement.style.position = 'absolute'
        this.stats.domElement.style.left = '0px'
        this.stats.domElement.style.top = '0px'
        var statsContainer = document.createElement('div')
        statsContainer.id = 'stats-container'
        statsContainer.appendChild(this.stats.domElement)
        this.body.appendChild(statsContainer)

        this.scene = new THREE.Scene()

        // this.camera = new THREE.PerspectiveCamera(90,this.body.clientWidth/this.body.clientHeight,0.01,5000)
        this.camera = new THREE.PerspectiveCamera(
            90,
            1,//this.body.clientWidth/this.body.clientHeight,
            this.config.camera.near,
            this.config.camera.far)
        // this.camera.up.set(0,0,1)
        // this.camera.position.set(-43.486343682038736,  2.127206120237504,  -8.698678933445201)
        this.camera.position.set(1780.71101881,  1600.5785283,  14.783995491)
        this.camera.position.set(1874.4326513789465,  1684.8195034736839,  15.56210051684223)
        window.camera=this.camera
        this.camera.lookAt(0,0,0)
        console.log(this.config)
        this.camera.position.set(
            this.config.camera.position.x,
            this.config.camera.position.y,
            this.config.camera.position.z
        )
        this.camera.rotation.set(
            this.config.camera.rotation.x,
            this.config.camera.rotation.y,
            this.config.camera.rotation.z
        )

        this.camera.name = "camera";
        // this.camera.position.set( -0.6821012446503002,  11.0913040259869,  -0.2459109391034793)
        // this.camera.rotation.set(-1.5929642031588853,  -0.061406332932874515, -1.9174927752336077)
        window.camera=this.camera
        
        this.scene.add(this.camera)
        
        // this.orbitControl = new OrbitControls(this.camera,this.renderer.domElement)
        // this.orbitControl.target.set(1780.71101881,  1600.5785283,  14.783995491)

        this.playerControl=new PlayerControl(this.camera)
        this.playerControl.mode.set("viewpoint")
        console.log(this.playerControl)
        this.playerControl.target.set(1780.71101881,  1600.5785283,  14.783995491)
        this.playerControl.speed.moveBoard =this.config.speed     //this.config.speed.moveBoard//1
        this.playerControl.speed.moveWheel0=this.config.speed*0.01

        this.animate = this.animate.bind(this)
        requestAnimationFrame(this.animate)

        // new AvatarManager(this.scene,this.camera)
        // this.scene.add(new THREE.DirectionalLight(0xFFFFFF, 3.5));//new LightProducer(this.scene)

        // const geometry = new THREE.BoxGeometry( 1, 1, 1 );
        // const material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        // const cube = new THREE.Mesh( geometry, material );
        // cube.position.set(1780.71101881,  1600.5785283,  14.783995491)
        // this.scene.add( cube );

        new Building(this.scene,this.camera,null,()=>{},true,Engine3D)
    }
    animate(){
        // let startTime = Date.now();
        // if (this.lastTime) {
        //   console.log("每帧时间",Date.now()-this.lastTime)
        // }
        // this.lastTime = Date.now();
        this.stats.update()
        // this.effectComposer.render()
        //如果要启用后处理，就需要用后处理通道覆盖render通道  
        this.renderer.render(this.scene,this.camera)
        // let endTime = Date.now()
        // console.log("main时间", endTime - startTime)
        requestAnimationFrame(this.animate)
    }
}
// document.addEventListener('DOMContentLoaded', () => {
//     new Loader(document.body)
// })
