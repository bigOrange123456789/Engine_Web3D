import * as THREE from "three"
import { Vector3 } from "three"
import { VCG } from "./VCG.js"
export class PathPlanning{
    camera=window.camera
    step=0.2
    direction=new Vector3(1,1,1)//前进的方向
    count=0//到达终点剩余的步数
    countAll
    #temp=new THREE.Object3D()
    quaternionEnd//目标方向
    constructor(){
        console.log("PathPlanning")
        this.gragh=new VCG()
        this.keyPointStart=null
        this.keyPointEnd=1
        const self=this
        setInterval(()=>{
            self.next()
        },1)
    }
    #nextPosFlag=3
    #nextPosFlagMax=3
    nextPos(){
        if(this.#nextPosFlag==this.#nextPosFlagMax){
            this.nextKeyPoint()
            this.#nextPosFlag=1
        }
        const posEnd2=this.posEnd.clone().sub(this.posStart).multiplyScalar(this.#nextPosFlag/this.#nextPosFlagMax)
        posEnd2.add(this.posStart)
        this.#nextPosFlag++

        const dist=posEnd2.clone().sub(this.posStart).length()
        this.count=dist/this.step
        this.countAll=this.count
        this.direction=this.posEnd.clone().sub(this.posStart).multiplyScalar(this.step/dist)
        this.#temp.lookAt(this.direction.clone().multiplyScalar(-1))
        
        this.quaternionEnd=this.#temp.quaternion
    }
    nextKeyPoint(){
        this.camera.position.set(
            this.gragh.pointList[this.keyPointEnd][0],
            this.gragh.pointList[this.keyPointEnd][1],
            this.gragh.pointList[this.keyPointEnd][2]
        )
        
        const keyPointPre=this.keyPointStart
        this.keyPointStart=this.keyPointEnd
        let neighbor=[]
        for(let i=0;i<this.gragh.linkList.length;i++){
            const link=this.gragh.linkList[i]
            if(link[0]==this.keyPointStart&&link[1]!=keyPointPre)
                neighbor.push(link[1])
            if(link[1]==this.keyPointStart&&link[0]!=keyPointPre)
                neighbor.push(link[0])
        }
        if(neighbor.length==0)neighbor=[keyPointPre]
        const index=Math.floor(Math.random()*neighbor.length)
        this.keyPointEnd=neighbor[index]

        const posStart=camera.position
        const posEnd=new THREE.Vector3(
            this.gragh.pointList[this.keyPointEnd][0],
            this.gragh.pointList[this.keyPointEnd][1],
            this.gragh.pointList[this.keyPointEnd][2]
        )
        /////////////////////////////////////////////////////////////
        this.posStart=posStart
        this.posEnd  =posEnd
        /////////////////////////////////////////////////////////////

        
    }
    nextPosOld(){

        this.camera.position.set(
            this.gragh.pointList[this.keyPointEnd][0],
            this.gragh.pointList[this.keyPointEnd][1],
            this.gragh.pointList[this.keyPointEnd][2]
        )

        const keyPointPre=this.keyPointStart
        this.keyPointStart=this.keyPointEnd
        let neighbor=[]
        for(let i=0;i<this.gragh.linkList.length;i++){
            const link=this.gragh.linkList[i]
            if(link[0]==this.keyPointStart&&link[1]!=keyPointPre)
                neighbor.push(link[1])
            if(link[1]==this.keyPointStart&&link[0]!=keyPointPre)
                neighbor.push(link[0])
        }
        if(neighbor.length==0)neighbor=[keyPointPre]
        const index=Math.floor(Math.random()*neighbor.length)
        this.keyPointEnd=neighbor[index]

        const posStart=camera.position
        const posEnd=new THREE.Vector3(
            this.gragh.pointList[this.keyPointEnd][0],
            this.gragh.pointList[this.keyPointEnd][1],
            this.gragh.pointList[this.keyPointEnd][2]
        )
        const dist=posEnd.clone().sub(posStart).length()
        this.count=dist/this.step
        this.countAll=this.count
        this.direction=posEnd.clone().sub(posStart).multiplyScalar(this.step/dist)
        this.#temp.lookAt(this.direction.clone().multiplyScalar(-1))
        
        this.quaternionEnd=this.#temp.quaternion

        
    }
    next(){
        if(this.count<=0){
            this.nextPosOld()
        }else{
            this.camera.position.set(
                this.camera.position.x+this.direction.x,
                this.camera.position.y+this.direction.y,
                this.camera.position.z+this.direction.z
            )
            this.camera.quaternion.slerp (this.quaternionEnd,0.01 );
            this.count--
        }
    }
}