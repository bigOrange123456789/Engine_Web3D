//https://blog.csdn.net/qq_38845635/article/details/107071372
import * as THREE from "three";
export class PathLine extends THREE.Line{
    constructor(
        opt={
            path,
            camera,
            delayTime
        }){
        const pathGeometry = new THREE.BufferGeometry();
        const pathVertices = new Float32Array(opt.path);
        pathGeometry.setAttribute('position', new THREE.BufferAttribute(pathVertices, 3));
        const pathMaterial = new THREE.LineBasicMaterial({
            color: 0xff0000,
            // linewidth: 25000,
        });
        super(pathGeometry, pathMaterial);
        this.pathPointsBuf=opt.path//pathPointsBuf
        setInterval(()=>{
            this.move(opt.camera)
        },opt.delayTime)
    }
    move(m){
        this.pathPointsBuf.push(
            m.position.x,
            m.position.y+5,//+16,
            m.position.z)//(fire.position.x, 410, fire.position.z);
        const pathVertices = new Float32Array(this.pathPointsBuf);
        this.geometry.setAttribute('position', new THREE.BufferAttribute(pathVertices, 3));
    }
}