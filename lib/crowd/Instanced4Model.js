import * as THREE from "three";
import { Instanced3Group } from './Instanced3Group.js'
import {PM}from"./PM.js";
export class Instanced4Model extends THREE.Object3D {
    getInstancedBufferAll(){
        return this.parent.getInstancedBufferAll()
    }
    getInstanced0Shader(){
        return this.parent.getInstanced0Shader()
    }
    constructor(opt,crowd0) {
        super()
        this.isInstancedMesh=typeof opt["animPathPre"]=='string'
        this.pathTexture=opt.pathTexture
        // alert(opt.pathTexture)

        this.meshType=opt.meshType
        this.meshTypeList=opt.meshTypeList
        this.meshTypeListElem=opt.meshTypeListElem

        this.assets=opt.assets  //{}//防止资源重复加载
        this.count=opt.count
        this.camera=opt.camera
        
        this.clock=crowd0.clock//new THREE.Clock()

        this.parent=crowd0
        const ibAll=this.getInstancedBufferAll()
        for(let instancedBufferName in ibAll){
            this[instancedBufferName]=ibAll[instancedBufferName]
        }
        
        this.useColorTag=opt.useColorTag//["CloW_A_kuzi_geo","CloW_A_waitao_geo1","CloW_A_xiezi_geo","hair"]
        this.instanceColorIn_All=crowd0.instanceColorIn_All

        this.visibleList_needsUpdate0=false

        this.lodCount=crowd0.lodCount
        this.lodList=crowd0.lodList

        this.lod=[]//里面存放的元素为 仿照mesh类型 自定义的结构
        this.lod_distance=crowd0.lod_distance//[15,25,50,75,100]
        this.lod_geometry=crowd0.lod_geometry

        let scope=this
        let lod_visible=opt.lod_visible
        opt.lod_set=()=>{   
            for (let i = 0; i < scope.children.length; i++) {
                var instanced3Group0 = scope.children[i]
                for(let name in lod_visible){
                    let level=lod_visible[name]
                    if (i >= level){
                        var mesh=instanced3Group0.getMesh(name)
                        if (mesh){
                            mesh.visible0=mesh.visible=false 
                           mesh.parent.remove(mesh)
                        } 

                    }
                }
            }
        }
        this.myLodController=crowd0.myLodController



        this.lod_set=opt.lod_set
        opt.crowd=crowd0
        opt.instanced4Model=this
        // let count=this.count
        for(let i=0;i<1+this.lod_distance.length;i++){//层级数量由lod_distance数组的长度确定
            let child=new Instanced3Group(opt)
            child.countMax=opt.lod_avatarCount[i]
            child.lodLevel=i
            this.add(child)
        }
        if(this.parent.getUsePoints()){
            this.children[this.children.length-1].visible=false//最后一个层级使用点集的方式进行渲染
        }
        console.log("flag",this.parent.getUsePoints())
        // this.lod_set()

        
        
        this.usePM=true//window.id==0
        this.pathLodGeo=opt.pathLodGeo
        this.pathTextureConfig=opt.pathTextureConfig
        
    }
    createPre(){//生成LOD的前向索引
        let pre=null
        for(let i=0;i<this.children.length;i++){//层级数量由lod_distance数组的长度确定
            let group=this.children[i]
            group.pre=pre;
            for(let k=0; k<group.children.length;k++){
                let mesh=group.children[k]
                if(pre==null)mesh.pre=null
                else
                    for(let j=0; j<pre.children.length;j++){
                        let mesh_pre=pre.children[j]
                        if(mesh.name==mesh_pre.name){
                            mesh.pre=mesh_pre
                        }
                    }
            }
            pre=group;
        }
    }
    init(groupOld,cb_){
        var scope=this
        this.pm=new PM({
            "crowd":scope,
            "groupOld":groupOld,
            "usePM":scope.usePM,
            "isInstancedMesh":this.isInstancedMesh
        },()=>{
            initChild(0)
        })
        function initChild(i){
            scope.children[i].init(//初始化所有子节点，本来是要等待动画数据的加载，采用预加载后应该就不用等待了
                groupOld,
                scope.meshType,
                scope.meshTypeList,
                scope.meshTypeListElem,
                ()=>{
                    if(i+1<scope.children.length)initChild(i+1)
                    else {
                        for(let i0=0;i0<scope.children.length;i0++){
                            for(let j0=0;j0<scope.children[i0].children.length;j0++){
                                scope.children[i0].children[j0].meshTypeId=scope.meshTypeId
                            }
                        }
                        // window.timeTest.measure("update start")
                        scope.myLodController.cameraStatePre=""
                        scope.update()
                        scope.createPre()
                        // window.timeTest.measure("update end")
                        if(cb_)cb_()
                        scope.pm.init(()=>{
                            console.log("pm.init")
                            loadTexture()
                        })
                    }
                }
            )
        }
        function loadTexture(){
            if(typeof(scope.pathTexture)=="string")
                scope.pm.loadJson(
                    scope.pathTextureConfig,
                    data=>{
                        data.rootPath=scope.pathTexture
                        scope.updateMap(data)
                    }
                )
            else scope.updateMap(scope.pathTexture)
            console.log(typeof(scope.pathTexture)=="string",scope.pathTexture)
        }
        
    }
    useLod(i){
        for(let c of this.children)c.useLod(i)
    }
    updateMap(data){
        // console.log("crowd updatemap")
        for(var i0=this.children.length-1;i0>0;i0--){
            // this.children[this.children.length-1].updateMap(data)
            // const i0=this.children.length>7?7:this.children.length-1
            // alert(this.pathTexture+";"+"./assets/textures_sim1/")
            this.children[i0].updateMap(data.rootPath,data)//this.children[i0].updateMap(this.pathTexture,data)//this.children[i0].updateMap("./assets/textures_sim1/",data)
            // this.children[0].updateMap("./assets/textures/",data)
        }
        // console.log(this.parent)
        // const scope=this
        // setTimeout(()=>{
        //     scope.parent.visible=true
        // },10000)
    }
    useLod(lod0){
        if(lod0.lodLevel)lod0=lod0.lodLevel
        // if(this.lodLevel==lod0)
        //     return
        // for(let i=1;i<this.children.length;i++){//0组对象不更新LOD
        for(let i=0;i<this.children.length;i++){
            var geometryLod=this.lod_geometry[i]
            lod0=Math.min(lod0,geometryLod)
            this.children[i].useLod(lod0)
            // this.lodLevel=lod0
        }
    }
    setColor(avatarIndex, color,meshName) { 
        let buffer=this.instanceColorIn_All[meshName]
        if(buffer)
        for(let j=0;j<3;j++)
            buffer.array[avatarIndex*3+j]=color[j]
    }
    update_new() {
        const self=this
        for(let i=0;i<self.children.length;i++){
            const lodGroup=self.children[i]
            for(let j=0;j<self.lodList.length;j++){
                lodGroup.visibleList[j]=self.lodList[j]==i?1:0
            }
            lodGroup.visibleList_needsUpdate0=true
            lodGroup.update()
        }
    }
    updateOld2() {
        const self=this
        for(let k_lod=0;k_lod<self.children.length;k_lod++){//lod数量
            const lodGroup=self.children[k_lod];
     
            let flag_needUpdate=false
            for(let i00=lodGroup.children.length-1;i00>=0;i00--){//mesh的种类数量
                const mesh=lodGroup.children[i00]
                //////////////////////////////
                let index=0
                for(let i=0;i<self.lodList.length;i++){//遍历每一个化身
                    if(self.lodList[i]==k_lod&&mesh.meshTypeList[i]==mesh.meshTypeId){
                        for(let t=0;t<mesh.buffer_all.length;t++){//变量全部缓存
                            let buffer=mesh.buffer_all[t]

                                let itemSize=buffer.itemSize
                                for(let j=0;j<itemSize;j++){
                                    buffer.array[itemSize*index+j]=
                                    buffer.origin.array[itemSize*i+j]
                                }
                            buffer.needsUpdate =true
                        }
                        index++
                    }
                }
                mesh.count=index
                //////////////////////////////
                mesh.visible=mesh.count!=0
                if(mesh.count>mesh.countMax){
                    lodGroup.remove(mesh)
                    lodGroup.add(mesh.clone())
                    flag_needUpdate=true
                }
            }
            if(flag_needUpdate){
                console.log("lod count不足")
                lodGroup.update()
            }
        }
    }
    update() {
        const self=this
        for(const lodGroup of self.children){//lod数量
            for(let i00=lodGroup.children.length-1;i00>=0;i00--){//mesh的种类数量
                const mesh=lodGroup.children[i00]
                mesh.count=0
            }
        }
        for(let i=0;i<self.lodList.length;i++){//遍历每一个化身
            const k_lod=self.lodList[i]
            if(k_lod>=0){//lod数量
                const lodGroup=self.children[k_lod]
                for(const mesh of lodGroup.children){//mesh的种类数量
                    if(mesh.meshTypeList[i]==mesh.meshTypeId){
                        for(let t=0;t<mesh.buffer_all.length;t++){//变量全部缓存
                            let buffer=mesh.buffer_all[t]
                            let itemSize=buffer.itemSize
                            for(let j=0;j<itemSize;j++){
                                buffer.array[itemSize*mesh.count+j]=
                                buffer.origin.array[itemSize*i+j]
                            }
                            buffer.needsUpdate =true
                        }
                        mesh.count++
                    }
                }
            }
        }
        for(const lodGroup of self.children){//lod数量
            let flag_needUpdate=false
            for(let i00=lodGroup.children.length-1;i00>=0;i00--){//mesh的种类数量
                const mesh=lodGroup.children[i00]
                //////////////////////////////
                mesh.visible=mesh.count!=0
                if(mesh.count>mesh.countMax){
                    lodGroup.remove(mesh)
                    lodGroup.add(mesh.clone())
                    flag_needUpdate=true
                }
            }
            if(flag_needUpdate){
                console.log("lod count不足")
                lodGroup.update()
            }
        }
    }
    getCrowdPoints(){
        const child=this.children[this.children.length-1]
        // console.log(child)
        return child.getCrowdPoints()
    }

}
