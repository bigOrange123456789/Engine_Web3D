import * as THREE from "three";
import {Sky} from "three/examples/jsm/objects/Sky"
export class SkyController{
    constructor(scene,camera,renderer){
        this.scene=scene
        this.camera=camera
        this.renderer=renderer
        this.sun = new THREE.Vector3();
        window.sun=this.sum
        this.sky=this.initSky()
        this.render()
    }
    initSky(){
        let sky = new Sky();
        sky.scale.setScalar( 450000 );
        // sky.rotation.set( 0, 0, Math.PI*1.5 )
        this.scene.add( sky );
        this.sky=sky
        this.effectController = {
            turbidity: 0,//10,//1,//10,//光晕强度
            rayleigh: 100,//0.1,//1,//3,//太阳光强度
            mieCoefficient: 0,//0.005,//0.0001,//0.005,//光晕强度
            mieDirectionalG:0,// 0.01,//0.7,//光晕强度
            elevation: 5,//20,//5,//2,  //俯仰角
            azimuth: 180-20,      //偏航角
            // exposure: this.renderer.toneMappingExposure/100 //this.renderer.toneMappingExposure
        }
        return sky
    }
    render(){
        const effectController=this.effectController
        // console.log()
        const uniforms = this.sky.material.uniforms;
        uniforms[ 'turbidity' ].value = effectController.turbidity;
        uniforms[ 'rayleigh' ].value = effectController.rayleigh;
        uniforms[ 'mieCoefficient' ].value = effectController.mieCoefficient;
        uniforms[ 'mieDirectionalG' ].value = effectController.mieDirectionalG;

        const phi = THREE.MathUtils.degToRad( 90 - effectController.elevation );
        const theta = THREE.MathUtils.degToRad( effectController.azimuth );
        this.sun.setFromSphericalCoords( 1, phi, theta );

        uniforms[ 'sunPosition' ].value.copy( this.sun );

        this.renderer.toneMappingExposure = effectController.exposure;
        this.renderer.render( this.scene, this.camera );
    }
}