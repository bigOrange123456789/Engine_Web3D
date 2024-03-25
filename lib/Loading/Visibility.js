import * as THREE from "three";
import { Culling }        from './visibilityLib/Culling'
import { DynamicLoading } from './visibilityLib/DynamicLoading'
export class Visibility{
    minvd=0
    constructor(camera,loading,meshes,detection) {
        camera.getWorldDirection=()=>{//相机的初始方向是（0，0，-1）
            return new THREE.Vector3(
                camera.matrixWorld.elements[8]*-1,
                camera.matrixWorld.elements[9]*-1,
                camera.matrixWorld.elements[10]*-1
            )
        }
        this.config=window.configALL.Visibility
        this.urlVdServer=this.config.urlVdServer//"http://150.158.24.191:8091"
        this.detection=detection
        if(!detection)console.log("没有开始数据收集功能")
        console.log("urlVdServer",this.urlVdServer)
        // console.log("areaInf",areaInf)
        // console.log(areaInf["min"])
        // areaInf["min"][1]-=0.5
        // areaInf["max"][1]-=0.5
        this.areaInf=this.initAreaInfList()[0]
        
        this.camera=camera
        this.meshes=meshes//用于可见性剔除
        this.componentNum=this.config.componentNum//8437//1278
        this.vd =new Array(this.componentNum)//{}//当前每个构件的可见度
        this.pvd=new Array(this.componentNum)
        this.visualList={}//用于视点的可见资源列表
        
        this.prePoint="";//视点变化就进行加载 (或者添加了新的模型) 
        this.loading=loading
        this.dynamicLoading=new DynamicLoading({
            visibility:this
        })//加载和预加载
        // this.dynamicLoading()
        this.culling=new Culling({
            visibility:this
        })//遮挡剔除和视锥剔除

        // if(new URLSearchParams(window.location.search).has("autoMove"))
        //     if(new URLSearchParams(window.location.search).get('autoMove')=="true"){
        //         areaInf.min
        //         const g=(a,b)=>{return Math.random() * (b-a)+a}
        //         const start=[
        //             g(areaInf.min[0],areaInf.max[0]),
        //             g(areaInf.min[1],areaInf.max[1]),
        //             g(areaInf.min[2],areaInf.max[2])
        //         ]
        //         camera.position.x=start[0]
        //         camera.position.y
        //         camera.position.z=start[1]
        //         const end=[
        //             g(areaInf.min[0],areaInf.max[0]),
        //             g(areaInf.min[1],areaInf.max[1]),
        //             g(areaInf.min[2],areaInf.max[2])
        //         ]
        //         camera.lookAt(
        //             end[0],
        //             camera.position.y,
        //             end[2]
        //         )
        //         const time=60*1000/10
        //         const step=[
        //             (end[0]-start[0])/time,
        //             (end[1]-start[1])/time,
        //             (end[2]-start[2])/time
        //         ]
        //         console.log(start,end)
        //         setInterval(()=>{
        //             camera.position.x+=step[0]
        //             camera.position.z+=step[2]
        //         },10)//60*1000
        //     }
    }
    initAreaInfList(){
        this.areaInfList=[]
        this.visualList_request={}//记录资源列表的请求是否已经发送
        for(let i=0;i<this.config.areaInfList.length;i++){
            const c=this.config.areaInfList[i]
            if(true){
                c.y[0]=Math.floor(c.y[0])
                c.y[1]=Math.floor(c.y[1])
                // this.areaInf["min"][1]=Math.floor(this.areaInf["min"][1])
                // this.areaInf["max"][1]=Math.floor(this.areaInf["max"][1])
            }
            this.areaInfList.push({
                "min": [c.x[0],c.y[0],c.z[0]],
                "max": [c.x[1],c.y[1],c.z[1]],
                "step": [
                    (c.x[1]-c.x[0])/c.x[2],
                    (c.y[1]-c.y[0])/c.y[2],
                    (c.z[1]-c.z[0])/c.z[2]
                ],
                areaId:i
            })
            this.visualList_request[i]={}
        }
        return this.areaInfList
    }
    getDirection(){
        var d=this.camera.getWorldDirection()
        var d1={x: 1, y: 0, z: 0}   //  //[0,-Math.PI/2,0]
        var d2={x: -1, y: 0, z: 0}  //  //[0,Math.PI/2,0]
        var d3={x: 0, y: 1, z: 0}   //上//[Math.PI/2,0,0]
        var d4={x: 0, y: -1, z: 0}  //下//[Math.PI*1.5,0,0]
        var d5={x: 0, y: 0, z: 1}   //  //[Math.PI,0,0]
        var d6={x: 0, y: 0, z: -1}  //  //[0,0,0]
        var getMul=(a,b)=>{
            let m=a.x*b.x+a.y*b.y+a.z*b.z
            let l=Math.pow((
                Math.pow(a.x,2)+
                Math.pow(a.y,2)+
                Math.pow(a.z,2)
            ),0.5)
            m=m/l
            m=2*(m+1)-1
            if(m<0)m=0
            return m
        }
        return [
            getMul(d,d1),getMul(d,d2),getMul(d,d3),getMul(d,d4),getMul(d,d5),getMul(d,d6)
        ]
    }
    setArea(){
        if(this.areaInfList.length<=1)return
        const k=2
        const areaInf=this.areaInfList[0]
        const c=this.camera
        var x=c.position.x
        var y=c.position.y
        var z=c.position.z
        let min =areaInf.min
        let max =areaInf.max
        let step=[
           (max[0]-min[0])/areaInf.step[0],
           (max[0]-min[0])/areaInf.step[0],
           (max[0]-min[0])/areaInf.step[0] 
        ]
        if( x<=max[0]+step[0]*k&&
            y<=max[1]+step[1]*k&&
            z<=max[2]+step[2]*k&&
            x>=min[0]-step[0]*k&&
            y>=min[1]-step[1]*k&&
            z>=min[2]-step[2]*k){
              this.areaInf=this.areaInfList[0]
        }else this.areaInf=this.areaInfList[1]
    }
    getPosIndex(){//加载和剔除都调用这个函数
        this.setArea()
        const self=this
        let min =this.areaInf.min
        let step=this.areaInf.step
        let max =this.areaInf.max
        var dl=[]
        for(var i=0;i<3;i++)
            dl.push(
                 step[i]==0?0:
                (max[i]-min[i])/step[i]
            )    
        // console.log(dl)
        const distanceMax=Math.pow(
            Math.pow(dl[0],2)+
            Math.pow(dl[1],2)+
            Math.pow(dl[2],2)
            ,0.5) 
        const getPosIndex0=(x,y,z)=>{
            if(x>max[0]||y>max[1]||z>max[2]||x<min[0]||y<min[1]||z<min[2]){
                this.border=true//视点在采样区域之外
                if(x>max[0])x=max[0]
                if(y>max[1])y=max[1]
                if(z>max[2])z=max[2]
                if(x<min[0])x=min[0]
                if(y<min[1])y=min[1]
                if(z<min[2])z=min[2]
            }else this.border=false
            const x2=self.camera.position.x
            const y2=self.camera.position.y
            const z2=self.camera.position.z
            
            var xi=dl[0]==0?0:Math.round((x-min[0])/dl[0])
            var yi=dl[1]==0?0:Math.round((y-min[1])/dl[1])
            var zi=dl[2]==0?0:Math.round((z-min[2])/dl[2])
            const x3=min[0]+dl[0]*xi
            const y3=min[1]+dl[1]*yi
            const z3=min[2]+dl[2]*zi
            window.pos=[x3,y3,z3]
            var s=step
            var index=xi*(s[1]+1)*(s[2]+1)+yi*(s[2]+1)+zi
            var weight=1-Math.pow(
                Math.pow(x2-x3,2)+
                Math.pow(y2-y3,2)+
                Math.pow(z2-z3,2)
                ,0.5) /distanceMax
                // console.log([x2,y2,z2],[x3,y3,z3],weight)
            return [xi,yi,zi,index,Math.max(weight,0.000001)]
        }
        const c=this.camera
        var x=c.position.x
        var y=c.position.y
        var z=c.position.z
        const arr=[]
        for(let i=-1;i<2;i+=2)
            for(let j=-1;j<2;j+=2)
                for(let k=-1;k<2;k+=2)
                    arr.push(
                        getPosIndex0(
                            x+i*dl[0],
                            y+j*dl[1],
                            z+k*dl[2])
                    )
        let a0=getPosIndex0(x,y,z)
        arr.push(a0)
        let sum=0
        for(let i=0;i<arr.length;i++)sum+=arr[i][4]
        if(sum!==0)
            for(let i=0;i<arr.length;i++)arr[i][4]/sum
        
        a0.push(arr)
        return a0
    } 
}