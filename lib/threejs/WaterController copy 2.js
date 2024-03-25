import * as THREE from "three";
// import {Water} from "./Water";
// import {Water} from "three/examples/jsm/objects/Water";
import {Water} from "../three/examples/jsm/objects/Water";
export class WaterController{
    constructor(mesh){
        this.water=this.initWater(mesh)
        window.water=this.water
        this.water.frustumCulled=false
        const self=this
        let time=0
        let time2=110
        const animate=()=>{
            time+= 1.0/65.0
            time2+= 1.0/35.0
            // console.log(time2)
            // const sun=window.sun?window.sun:new THREE.Vector3(-200,800,-600)
            const sun=new THREE.Vector3(-200,800,-600)
            requestAnimationFrame(animate)
            self.water.material.uniforms['sunDirection'].value.copy(sun).normalize()
            self.water.material.uniforms['time'].value=time
        };animate()
    }
    initWater(mesh){
        return new Water(mesh.geometry,{
            textureWidth: 512,
            textureHeight: 512,
            waterNormals: new THREE.TextureLoader().load('assets/waternormals.jpg',function(texture){
                texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            }),
            sunDirection: new THREE.Vector3(),
            sunColor: 0x00ffff,
            waterColor: 0x002e1f,
            distortionScale: 3.7,
            fog: true
        })
    }
    
}