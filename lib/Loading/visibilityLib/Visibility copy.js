import * as THREE from "three";
export class Visibility{
    constructor(camera,loading,meshes,detection) {
        camera.getWorldDirection=()=>{//相机的初始方向是（0，0，-1）
            return new THREE.Vector3(
                camera.matrixWorld.elements[8]*-1,
                camera.matrixWorld.elements[9]*-1,
                camera.matrixWorld.elements[10]*-1
            )
        }
        this.config=window.configALL.src.Visibility
        this.urlVdServer=this.config.urlVdServer//"http://150.158.24.191:8091"
        this.detection=detection
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
        this.prePoint2="";//视点变化就进行可见性剔除
        this.loading=loading
        this.dynamicLoading()//加载和预加载
        // this.culling()//遮挡剔除和视锥剔除
        new Culling({
            visibility:this
        })

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
    dynamicLoading(){//用于加载和预加载
        const scope=this
		const c=this.camera
        let first=true
		setInterval(()=>{
					var point0=c.position.x+","+c.position.y+","+c.position.z
                            +c.rotation.x+","+c.rotation.y+","+c.rotation.z
                    if(this.prePoint===point0){//如果视点没有移动或旋转
						if(first){//如果是第一次暂停 => 加载资源
                            scope.getList()
							first=false
						}
					}else {//如果视点发生了移动或旋转
						scope.prePoint=point0
						first=true
					}
		},200)
        setInterval(()=>{
            scope.getList()
            scope.getList2()
        },1500)
		console.log("开始动态加载资源")
    }
    #culling(){//遮挡剔除和视锥剔除
        const scope=this
		const c=this.camera
        this.prePoint2=""
		function setInterval0(){
            requestAnimationFrame(setInterval0)
			var point0=c.position.x+","+c.position.y+","+c.position.z
                    +c.rotation.x+","+c.rotation.y+","+c.rotation.z
            if(scope.prePoint2!==point0){//如果视点发生了移动或旋转
                    scope.#showOnlyEvs()
                    scope.prePoint2=point0
			}
        }setInterval0()
		console.log("开始动态加载资源")
    }
    getListSim(){
        const self=this
        let vd_had=0
        let vd_hading=0
        const posIndexAll=this.getPosIndex()
        const arr=posIndexAll[5]
        let loaded=true
        for(let i=0;i<arr.length;i++){
            const posIndex0=arr[i][3]
            if(!this.visualList[posIndex0]){
                loaded=false
                this.request(posIndex0)
            }
        }
        // window.arr=arr
        // console.log(arr)
        if(loaded){
            // const posIndex=posIndexAll[3]
            const d=this.getDirection()

            for(let i=0;i<this.componentNum;i++){
                const getVD=(j)=>{
                    const posIndex=arr[j][3]
                    const weight=arr[j][4]
                    const visualList0=self.visualList[posIndex] 
                    const vd1=i in visualList0["1"]?visualList0["1"][i]:0
                    const vd2=i in visualList0["2"]?visualList0["2"][i]:0
                    const vd3=i in visualList0["3"]?visualList0["3"][i]:0
                    const vd4=i in visualList0["4"]?visualList0["4"][i]:0
                    const vd5=i in visualList0["5"]?visualList0["5"][i]:0
                    const vd6=i in visualList0["6"]?visualList0["6"][i]:0
                    // console.log(posIndex,weight,vd1,vd2,vd3,vd4,vd5,vd6)
                    return (vd1*d[0]+vd2*d[1]+vd3*d[2]+vd4*d[3]+vd5*d[4]+vd6*d[5])*weight
                }
                
                // this.vd[i]=getVD(posIndex)//posIndexAll[3]
                this.vd[i]=0
                for(let j=0;j<arr.length;j++){
                    // console.log()
                    this.vd[i]+=getVD(j)
                }
                if(Object.keys(this.meshes).length!==0&&this.meshes[i])
                    vd_had+=this.vd[i]
                else vd_hading+=this.vd[i]
            } 
            

            document.getElementById("plumpness").innerHTML=""//"饱满度:"+(100*vd_had/(vd_had+vd_hading)).toFixed(4)+"%"
            
            // console.log(this.vd)
            window.vd=this.vd
            let list=this.vd.map((value, index) => ({ value, index }))
                .filter(item => item.value > 0)
                .sort((a, b) => b.value - a.value)
                .map((value, index) => value.index )
            self.detection.addDemand(list)
            // console.log("list1.length",list.length)
            if(list.length>0)this.loading(list)

            // list.filter((value, index) => index<list.length-i )
            // console.log(list.length)
            // list=list.map((value, index) => value.index )
            // if(list.length>0)this.loading(list)

            // const list=this.vd.map((value, index) => ({ value, index }))
            //     .filter(item => item.value > 4*Math.PI/600)
            //     .sort((a, b) => b.value - a.value)
            //     .map((value, index) => value.index )
            // if(list.length>0)this.loading(list)
        }
    }
    getList(){
        // console.log("*")
        const self=this
        let vd_had=0
        let vd_hading=0
        const posIndexAll=this.getPosIndex()
        const arr=posIndexAll[5]
        let loaded=true
        for(let i=0;i<arr.length;i++){
            const posIndex0=arr[i][3]
            if(!this.visualList[posIndex0]){
                loaded=false
                this.request(posIndex0)
            }
        }
        // window.arr=arr
        // console.log(arr)
        if(loaded){
            // const posIndex=posIndexAll[3]
            const d=this.getDirection()

            for(let i=0;i<this.componentNum;i++){
                const getVD=(j)=>{
                    const posIndex=arr[j][3]
                    const weight=arr[j][4]
                    const visualList0=self.visualList[posIndex] 
                    const vd1=i in visualList0["1"]?visualList0["1"][i]:0
                    const vd2=i in visualList0["2"]?visualList0["2"][i]:0
                    const vd3=i in visualList0["3"]?visualList0["3"][i]:0
                    const vd4=i in visualList0["4"]?visualList0["4"][i]:0
                    const vd5=i in visualList0["5"]?visualList0["5"][i]:0
                    const vd6=i in visualList0["6"]?visualList0["6"][i]:0
                    // console.log(posIndex,weight,vd1,vd2,vd3,vd4,vd5,vd6)
                    return (vd1*d[0]+vd2*d[1]+vd3*d[2]+vd4*d[3]+vd5*d[4]+vd6*d[5])*weight
                }
                
                // this.vd[i]=getVD(posIndex)//posIndexAll[3]
                this.vd[i]=0
                for(let j=0;j<arr.length;j++){
                    // console.log()
                    this.vd[i]+=getVD(j)
                }
                if(Object.keys(this.meshes).length!==0&&this.meshes[i])
                    vd_had+=this.vd[i]
                else vd_hading+=this.vd[i]
            } 
            

            document.getElementById("plumpness").innerHTML=""//"饱满度:"+(100*vd_had/(vd_had+vd_hading)).toFixed(4)+"%"
            
            // console.log(this.vd)
            window.vd=this.vd
            let list=this.vd.map((value, index) => ({ value, index }))
                .filter(item => item.value > 0)
                .sort((a, b) => b.value - a.value)
                .map((value, index) => value.index )
            self.detection.addDemand(list)
            // console.log("list1.length",list.length)
            if(list.length>0)this.loading(list)

            // list.filter((value, index) => index<list.length-i )
            // console.log(list.length)
            // list=list.map((value, index) => value.index )
            // if(list.length>0)this.loading(list)

            // const list=this.vd.map((value, index) => ({ value, index }))
            //     .filter(item => item.value > 4*Math.PI/600)
            //     .sort((a, b) => b.value - a.value)
            //     .map((value, index) => value.index )
            // if(list.length>0)this.loading(list)
        }
    }
    getList2(){//PVD
        if(!this.config.list2Len)return
        const self=this
        const posIndexAll=this.getPosIndex()
        const arr=posIndexAll[5]
        let loaded=true
        for(let i=0;i<arr.length;i++){
            const posIndex0=arr[i][3]
            if(!this.visualList[posIndex0]){
                loaded=false
                this.request(posIndex0)
            }
        }
        if(loaded){
            for(let i=0;i<this.componentNum;i++){
                const getPVD=(j)=>{
                    const posIndex=arr[j][3]
                    const weight=arr[j][4]
                    const visualList0=self.visualList[posIndex] 
                    const pvd=i in visualList0["pvd"]?visualList0["pvd"][i]:0
                    return pvd*weight
                }
                this.pvd[i]=0
                for(let j=0;j<arr.length;j++)
                    this.pvd[i]+=getPVD(j)
            } 
            
            let list2=this.pvd.map((value, index) => ({ value, index }))
                .filter(item => item.value > 0)
                .sort((a, b) => b.value - a.value)
                .filter((value, index) => index < this.config.list2Len)
                .map((value, index) => value.index )
            console.log("list2.length",list2.length)
            if(list2.length>0)this.loading(list2)
        }
    }
    #showOnlyEvs(){//用于渲染
        const posIndex=this.getPosIndex()[3]
        const visualList0=this.visualList[posIndex]
        if(visualList0){
            const d=this.getDirection()
            for(let i=0;i<this.componentNum;i++)
            if(this.meshes[i]){
                const vd1=i in visualList0["1"]?visualList0["1"][i]:0
                const vd2=i in visualList0["2"]?visualList0["2"][i]:0
                const vd3=i in visualList0["3"]?visualList0["3"][i]:0
                const vd4=i in visualList0["4"]?visualList0["4"][i]:0
                const vd5=i in visualList0["5"]?visualList0["5"][i]:0
                const vd6=i in visualList0["6"]?visualList0["6"][i]:0
                this.vd[i]=vd1*d[0]+vd2*d[1]+vd3*d[2]+vd4*d[3]+vd5*d[4]+vd6*d[5]
                if(this.meshes[i].lod){
                    for(let j=0;j<this.meshes[i].lod.length;j++)    
                        this.meshes[i].lod[j].visible=false
                    if(this.vd[i]>Math.PI/(40))this.meshes[i].lod[1].visible=true//this.meshes[i].lod[0].visible=true
                    else if(this.vd[i]>0)         this.meshes[i].lod[0].visible=true
                }else{
                    this.meshes[i].visible= this.vd[i]>0
                }
                this.meshes[i].used=true//这个mesh被使用了
            } 
            window.visibleArea={}
            if(visualList0["a"])
                for(let i=0;i<visualList0["a"].length;i++){
                    window.visibleArea[visualList0["a"][i]]=true
                }
        }
    }
    request(posIndex){
        const scope=this
        const areaId=this.areaInf.areaId
        // console.log(this.visualList_request,areaId)
        if(!this.visualList_request[areaId][posIndex]){
            var oReq = new XMLHttpRequest();
            oReq.open("POST", scope.urlVdServer, true);
            oReq.responseType = "arraybuffer";
            oReq.onload = function () {//接收数据
                var unitArray=new Uint8Array(oReq.response) //网络传输基于unit8Array
                var str=String.fromCharCode.apply(null,unitArray)
                scope.visualList[posIndex]=JSON.parse(str)
                // var test=scope.visualList[posIndex]
                // console.log(test)
                // console.log(scope.visualList[posIndex])
                // window.test=scope.visualList[posIndex]
                // console.log("test[all]",Object.keys(test["all"]))
                // console.log("test[1]"  ,Object.keys(test["1"]))
                scope.getList()
            }
            // console.log({"posIndex":posIndex,"sceneId":scope.config.sceneId,"areaId":scope.areaInf.areaId})
            // oReq.send(JSON.stringify(posIndex));//发送请求
            oReq.send(JSON.stringify({
                "posIndex":posIndex,
                "sceneId":scope.config.sceneId,
                "areaId":scope.areaInf.areaId}));//发送请求
            this.visualList_request[areaId][posIndex]=true//已经完成了请求
        }
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
class DynamicLoading{
    constructor(){}
}
class Culling{
    constructor(param){
        this.v=param.visibility
        this.camera=param.visibility.camera
        this.meshes=this.v.meshes

        const scope=this
		const c=this.camera
        this.prePoint2=""
		function setInterval0(){
            requestAnimationFrame(setInterval0)
			var point0=c.position.x+","+c.position.y+","+c.position.z
                    +c.rotation.x+","+c.rotation.y+","+c.rotation.z
            if(scope.prePoint2!==point0){//如果视点发生了移动或旋转
                    scope.#showOnlyEvs()
                    scope.prePoint2=point0
			}
        }setInterval0()
		console.log("开始动态加载资源")
    }
    #showOnlyEvs(){//用于渲染
        const posIndex=this.v.getPosIndex()[3]
        const visualList0=this.v.visualList[posIndex]
        if(visualList0){
            const d=this.v.getDirection()
            for(let i=0;i<this.v.componentNum;i++)
            if(this.meshes[i]){
                const vd1=i in visualList0["1"]?visualList0["1"][i]:0
                const vd2=i in visualList0["2"]?visualList0["2"][i]:0
                const vd3=i in visualList0["3"]?visualList0["3"][i]:0
                const vd4=i in visualList0["4"]?visualList0["4"][i]:0
                const vd5=i in visualList0["5"]?visualList0["5"][i]:0
                const vd6=i in visualList0["6"]?visualList0["6"][i]:0
                this.v.vd[i]=vd1*d[0]+vd2*d[1]+vd3*d[2]+vd4*d[3]+vd5*d[4]+vd6*d[5]
                if(this.meshes[i].lod){
                    for(let j=0;j<this.meshes[i].lod.length;j++)    
                        this.meshes[i].lod[j].visible=false
                    if(this.v.vd[i]>Math.PI/(40))this.meshes[i].lod[1].visible=true//this.meshes[i].lod[0].visible=true
                    else if(this.v.vd[i]>0)         this.meshes[i].lod[0].visible=true
                }else{
                    this.meshes[i].visible= this.vd[i]>0
                }
                this.meshes[i].used=true//这个mesh被使用了
            } 
            window.visibleArea={}
            if(visualList0["a"])
                for(let i=0;i<visualList0["a"].length;i++){
                    window.visibleArea[visualList0["a"][i]]=true
                }
        }
    }
}