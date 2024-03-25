export class DynamicLoading{
    constructor(param){
        this.v=param.visibility
        this.camera=param.visibility.camera

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
            scope.#getList2()
        },1500)
		console.log("开始动态加载资源")
    }
    getList(){
        // console.log("*")
        const self=this.v
        let vd_had=0
        let vd_hading=0
        const posIndexAll=this.v.getPosIndex()
        const arr=posIndexAll[5]
        let loaded=true
        for(let i=0;i<arr.length;i++){
            const posIndex0=arr[i][3]
            if(!this.v.visualList[posIndex0]){
                loaded=false
                this.#request(posIndex0)
            }
        }
        // window.arr=arr
        if(loaded){
            // const posIndex=posIndexAll[3]
            const d=this.v.getDirection()

            for(let i=0;i<this.v.componentNum;i++){
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
                this.v.vd[i]=0
                for(let j=0;j<arr.length;j++){
                    // console.log()
                    this.v.vd[i]+=getVD(j)
                }
                if(Object.keys(this.v.meshes).length!==0&&this.v.meshes[i])
                    vd_had+=this.v.vd[i]
                else vd_hading+=this.v.vd[i]
            } 
            

            document.getElementById("plumpness").innerHTML=""//"饱满度:"+(100*vd_had/(vd_had+vd_hading)).toFixed(4)+"%"
            
            // console.log(this.vd)
            window.vd=this.v.vd
            let list=this.v.vd.map((value, index) => ({ value, index }))
                .filter(item => item.value > 0)
                .sort((a, b) => b.value - a.value)
                .map((value, index) => value.index )
            self.detection.addDemand(list)
            if(list.length>0)this.v.loading(list)

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
    #getList2(){//PVD
        if(!this.v.config.list2Len)return
        const self=this.v
        const posIndexAll=this.v.getPosIndex()
        const arr=posIndexAll[5]
        let loaded=true
        for(let i=0;i<arr.length;i++){
            const posIndex0=arr[i][3]
            if(!this.v.visualList[posIndex0]){
                loaded=false
                this.#request(posIndex0)
            }
        }
        if(loaded){
            for(let i=0;i<this.v.componentNum;i++){
                const getPVD=(j)=>{
                    const posIndex=arr[j][3]
                    const weight=arr[j][4]
                    const visualList0=self.visualList[posIndex] 
                    const pvd=i in visualList0["pvd"]?visualList0["pvd"][i]:0
                    return pvd*weight
                }
                this.v.pvd[i]=0
                for(let j=0;j<arr.length;j++)
                    this.v.pvd[i]+=getPVD(j)
            } 
            
            let list2=this.v.pvd.map((value, index) => ({ value, index }))
                .filter(item => item.value > 0)
                .sort((a, b) => b.value - a.value)
                .filter((value, index) => index < this.v.config.list2Len)
                .map((value, index) => value.index )
            console.log("list2.length",list2.length)
            if(list2.length>0)this.v.loading(list2)
        }
    }
    #request(posIndex){
        const self=this
        const scope=this.v
        const areaId=this.v.areaInf.areaId
        let finishFlag=false
        const re=()=>{
            if(finishFlag)return
            finishFlag=true
            console.log("重新请求",posIndex)
            self.v.visualList_request[areaId][posIndex]=false
            self.#request(posIndex)
        }
        // console.log(
        //     posIndex,
        //     this.v.visualList_request[areaId][posIndex]
        // )
        if(!this.v.visualList_request[areaId][posIndex]){
            // console.log("request,areaId",posIndex,areaId)

            
            const oReq = new XMLHttpRequest();
            oReq.onerror = ()=>{
                console.log("XMLHttpRequest出错")
                re()
            }
            // oReq.onreadystatechange = function(){
            //   switch(xhr.readyState){
            //     case 0 : console.log("未初始化，及还未调用open方法");
            //              break;
            //     case 1 : console.log("启动，未调用send方法");
            //              break;
            //     case 2 : console.log("发送，未收到响应");
            //              break;
            //     case 3 : console.log("接受，取得部分数据");
            //              break;
            //     case 4 : if((xhr.status >=200 && xhr.status < 300) || xhr.status ==304){
            //               console.log(xhr.responceText);
            //              };
            //               break;
            //     default : console.log("are you kidding?");
            //   }
            // }
            oReq.open("POST", scope.urlVdServer, true);
            oReq.responseType = "arraybuffer";
            oReq.onload = function () {//接收数据
                finishFlag=true
                var unitArray=new Uint8Array(oReq.response) //网络传输基于unit8Array
                var str=String.fromCharCode.apply(null,unitArray)
                scope.visualList[posIndex]=JSON.parse(str)
                // console.log(JSON.parse(str),"JSON.parse(str)")
                // var test=scope.visualList[posIndex]
                // console.log(test)
                // console.log(scope.visualList[posIndex])
                // window.test=scope.visualList[posIndex]
                // console.log("test[all]",Object.keys(test["all"]))
                // console.log("test[1]"  ,Object.keys(test["1"]))
                scope.dynamicLoading.getList()
            }
            // console.log({"posIndex":posIndex,"sceneId":scope.config.sceneId,"areaId":scope.areaInf.areaId})
            // oReq.send(JSON.stringify(posIndex));//发送请求
            oReq.send(JSON.stringify({
                "posIndex":posIndex,
                "sceneId":scope.config.sceneId,
                "areaId":scope.areaInf.areaId}));//发送请求
            this.v.visualList_request[areaId][posIndex]=true//已经完成了请求
            setTimeout(()=>{
                re()
            },2000+1000*Math.random())//如果三秒后没有收到数据就重新请求
        }
    }
}