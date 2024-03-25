import * as THREE from "three";
import { Instanced4Model } from './Instanced4Model.js'
import { CrowdLod } from './CrowdLod.js'
import { CrowdPoints } from './CrowdPoints.js'
export class Instanced5Object extends THREE.Object3D {
    moveFlag=false
    // ifAnimated=true
    #usePoints=false
    // #useTetrahedron=true//是否使用四面体
    #useInstancedBuffer={
        //type,itemSize
        instanceMatrix:[Float32Array,16],
        textureType:[Uint8Array,4],//null,
        bodyScale:[Float32Array,4],//null,//
        
        moveMaxLength:[Float32Array,1],
        speed:[Float32Array,1],
        animationIndex:[Uint8Array,1],
        animationStartTime:[Float32Array,1],

        obesity:false,//[Float32Array,1],//
    }
    #Shader
    #refreshFrequency=500//"eachFrame"
    getUsePoints(){
        return this.#usePoints
    }
    getRefreshFrequency(){
        return this.#refreshFrequency
    }
    getInstanced0Shader(){
        return this.#Shader
    }
    #initInstancedBufferAll(){
        if(false){//if(!this.ifAnimated){
            this.#useInstancedBuffer["moveMaxLength"]=false
            this.#useInstancedBuffer["animationIndex"]=false
            this.#useInstancedBuffer["speed"]=false
            this.#useInstancedBuffer["animationStartTime"]=false
        }
        for(let instancedBufferName in this.#useInstancedBuffer){
            if(this.#useInstancedBuffer[instancedBufferName])    
            {
                const ibType = this.#useInstancedBuffer[instancedBufferName][0]
                const ibSize = this.#useInstancedBuffer[instancedBufferName][1]
                this[instancedBufferName] =new THREE.InstancedBufferAttribute(
                    new ibType(this.count*ibSize), ibSize
                );
            }
        }
    }
    getInstancedBufferAll(){
        const instancedBufferAll={}
        for(let instancedBufferName in this.#useInstancedBuffer){
            if(this.#useInstancedBuffer[instancedBufferName])    
            {
                instancedBufferAll[instancedBufferName] =this[instancedBufferName]
            }
        }
        return instancedBufferAll
    }
    
    constructor(opt) {
        super()
        if(typeof opt.refreshFrequency=="undefined")this.#refreshFrequency=500
        else this.#refreshFrequency=opt.refreshFrequency
        if(opt.useInstancedBuffer){
            for(let tag in opt.useInstancedBuffer)
                this.#useInstancedBuffer[tag]=opt.useInstancedBuffer[tag]
        }
        console.log(this.#useInstancedBuffer,opt.useInstancedBuffer)
        this.#Shader=opt.Shader
        // this.isInstancedMesh=typeof opt["animPathPre"]=='string'
        // console.log("this.isInstancedMesh",this.isInstancedMesh,opt["animPathPre"])
        // alert(opt.pathTexture)
        this.camera=opt.camera
        this.dummy = new THREE.Object3D();

        this.count=opt.count
        this.clock=new THREE.Clock()

        this.#initInstancedBufferAll()

        this.useColorTag=opt.useColorTag//["CloW_A_kuzi_geo","CloW_A_waitao_geo1","CloW_A_xiezi_geo","hair"]
        // console.log("useColorTag",opt.useColorTag)
        this.instanceColorIn_All={}
        for(let i=0;i<this.useColorTag.length;i++){
            let meshName=this.useColorTag[i]
            this.instanceColorIn_All[meshName]=
                new THREE.InstancedBufferAttribute(new Float32Array(this.count*3), 3);
        }

        this.lodCount=21//几何lod层级的个数
        // this.lodLevel=20//this.lodCount-1//当前的lod层级编号 //
        this.lodList=new Int8Array(this.count)
        var e=[1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]
        for(let i=0;i<this.count;i++){
            this.lodList[i]=-1
            for(let j=0;j<16;j++)
                this.instanceMatrix.array[16*i+j]=e[j]
        }

        this.lod_distance=opt.lod_distance//[15,25,50,75,100]
        this.lod_geometry=opt.lod_geometry

        if(typeof(opt.lodParam)=="undefined"){
            this.myLodController=new CrowdLod({crowd:this})
        }else{
            opt.lodParam.crowd=this
            this.myLodController=new CrowdLod(opt.lodParam)
        }
        
        this.opt=opt
        this.meshType=opt.meshType//记录了每个glb中每个mesh对应的类型

        this.meshTypeList={}
        this.meshTypeListElem={}
        this.meshName2meshId={}
        for(let i=0;i<this.meshType.length;i++){
            let arr=Object.values(this.meshType[i])
            for(let j=0;j<arr.length;j++){
                this.meshTypeList[arr[j]]=[]
                this.meshTypeListElem[arr[j]]={}//[]
            }
        }

        
        for(let i=0;i<this.meshType.length;i++){
            let arr=Object.values(this.meshType[i])
            for(let j=0;j<arr.length;j++){
                this.meshTypeListElem[arr[j]][i]=true//.push(i)
            }
        }
        for(let i in this.meshTypeListElem){
            let data=this.meshTypeListElem[i]
            let arr=Object.keys(data)
            for(let j=0;j<arr.length;j++){
                arr[j]=parseInt(arr[j])
            }
            this.meshTypeListElem[i]=arr
        }


        for(let type in this.meshTypeList)
            if(type!==null&&type!=="null"){//type是字符串类型
                let list=this.meshTypeList[type]
                for(let i=0;i<this.count;i++){
                    const arr=this.meshTypeListElem[type]
                    const index=Math.floor(Math.random()*arr.length)
                    const k=arr[index]//Math.floor(Math.random()*2)//i%2//
                    list.push(k)
                }
            }
        
        this.CrowdPoints=new THREE.Object3D()
        this.CrowdPoints.position.y=0.2
    }
    ioInstancedBuffer(ibName,index,ibItem){
        const ib=this[ibName]
        if(ib){
            if(typeof ibItem!="undefined"&&(ib.itemSize==1||ib.itemSize==ibItem.length)){//写入
                if(!ibItem.length)ibItem=[ibItem]
                for(let i=0;i<ib.itemSize;i++){
                    ib.array[index*ib.itemSize+i]=ibItem[i]
                }
                ib.needsUpdate0=true
            }else if(typeof ibItem=="undefined"){//读取
                ibItem=[]
                for(let i=0;i<ib.itemSize;i++){
                    ibItem.push(ib.array[index*ib.itemSize+i])
                }
                if(ibItem.length==1)ibItem=ibItem[0]
            }
            return ibItem
        }
    }
    getInstancedBuffer(ibName,index){
        const ib=this[ibName]
        const ibItem=[]
        if(ib){
            for(let i=0;i<ib.itemSize;i++){
                ibItem.push(ib.array[index*ib.itemSize+i])
            }
        }
        return ibItem
    }
    init(groups){
        for(let i=0;i<groups.length;i++){
            let groupOld=groups[i]
            const child=new Instanced4Model({
                camera:this.opt.camera,
                count: this.opt.count,//self.modelManager.modelList[modelType].ModelCount,
                animPathPre: this.opt.animPathPre,//self.modelManager.modelList[modelType].pathAnima,

                pathLodGeo:  this.opt.pathLodGeo[i],
                pathTextureConfig: this.opt.pathTextureConfig[i],
                useColorTag: this.opt.useColorTag,
                meshType:    this.opt.meshType[i],
                meshTypeList:this.meshTypeList,
                meshTypeListElem:this.meshTypeListElem,
                
                assets:      this.opt.assets,
                lod_distance:this.opt.lod_distance,
                lod_geometry:this.opt.lod_geometry,
                lod_avatarCount:
                    this.opt.lod_avatarCount?
                        this.opt.lod_avatarCount:
                     Array.from(new Array(this.opt.lod_distance.length+1)).map((i,v)=>{return 0}),
                lod_visible: this.opt.lod_visible[i],

                pathTexture:this.opt.pathTexture[i]
            },this)
            child.meshTypeId=this.children.length
            child.init(groupOld)
            this.add(child)
        }
        if(this.#usePoints){
            const self=this
            const s=setInterval(()=>{
                if(self.children[0].children[0].children[0]){
                    self.CrowdPoints.add(CrowdPoints.createPoints(self))
                    clearInterval(s)
                }
            },1)
        }
        
        
    }
    useLod(i){
        for(let c of this.children)c.useLod(i)
    }
    setPartType(index,partName,meshId){
        this.meshTypeList[partName][index]=meshId
        this.meshTypeList.needsUpdate0=true
    }
    getPartType(index,partName){
        return this.meshTypeList[partName][index]
    }
    getMatrixAt( index, matrix ) {
		matrix.fromArray( this.instanceMatrix.array, index * 16 );
	}
    setMatrixAt( index, matrix ) {
		matrix.toArray( this.instanceMatrix.array, index * 16 );
        this.instanceMatrix.needsUpdate0=true
	}
    getPosition(avatarIndex) {
        var mat4 = new THREE.Matrix4();
        this.getMatrixAt(avatarIndex,mat4)
        var e=mat4.elements
        return [e[12],e[13],e[14]];
    }
    getRotation(avatarIndex) {
        var mat4 = new THREE.Matrix4();
        this.getMatrixAt(avatarIndex,mat4)

        let position = new THREE.Vector3();
        let quaternion = new THREE.Quaternion();
        let scale = new THREE.Vector3();
        mat4.decompose(position, quaternion, scale);

        let euler = new THREE.Euler(0, 0, 0, 'XYZ');
        euler.setFromQuaternion(quaternion);
        return [euler.x, euler.y, euler.z];
    }
    getScale(avatarIndex) {
        var mat4 = new THREE.Matrix4();
        this.getMatrixAt(avatarIndex,mat4)

        let position = new THREE.Vector3();
        let quaternion = new THREE.Quaternion();
        let scale = new THREE.Vector3();
        mat4.decompose(position, quaternion, scale);
        return [scale.x, scale.y, scale.z];

    }
    setPosition(avatarIndex, pos) {//CrowdLod
        var mat4 = new THREE.Matrix4();
        this.getMatrixAt(avatarIndex,mat4)
        mat4.elements[12]=pos[0]
        mat4.elements[13]=pos[1]
        mat4.elements[14]=pos[2]
        this.setMatrixAt(avatarIndex,mat4)
        // console.log(pos)
        this.moveFlag=true
    }
    setScale(avatarIndex, size) {
        var mat4 = new THREE.Matrix4();
        this.getMatrixAt(avatarIndex,mat4)

        let position = new THREE.Vector3();
        let quaternion = new THREE.Quaternion();
        let scale = new THREE.Vector3();

        mat4.decompose(position, quaternion, scale);
        let euler = new THREE.Euler(0, 0, 0, 'XYZ');
        euler.setFromQuaternion(quaternion);

        this.dummy.scale.set(size[0], size[1], size[2]);
        this.dummy.rotation.set(euler.x, euler.y, euler.z);
        this.dummy.position.set(position.x, position.y, position.z);
        this.dummy.updateMatrix();

        this.setMatrixAt(avatarIndex,this.dummy.matrix)        
    }
    setRotation(avatarIndex, rot) {
        var mat4 = new THREE.Matrix4();
        this.getMatrixAt(avatarIndex,mat4)

        let position = new THREE.Vector3();
        let quaternion = new THREE.Quaternion();
        let scale = new THREE.Vector3();
        mat4.decompose(position, quaternion, scale);

        this.dummy.scale.set(scale.x, scale.y, scale.z);
        this.dummy.rotation.set(rot[0], rot[1], rot[2]);
        this.dummy.position.set(position.x, position.y, position.z);
        this.dummy.updateMatrix();

        this.setMatrixAt(avatarIndex, this.dummy.matrix);
    }
    move(avatarIndex, dPos) {
        let pos = this.getPosition(avatarIndex);
        this.setPosition(avatarIndex, [pos[0] + dPos[0], pos[1] + dPos[1], pos[2] + dPos[2]]);
    }
    rotation(avatarIndex, dRot) {
        let rot = this.getRotation(avatarIndex);
        this.setRotation(avatarIndex, [rot[0] + dRot[0], rot[1] + dRot[1], rot[2] + dRot[2]]);
    }

    setTexture(avatarIndex, type) { // 设置贴图类型
        this.ioInstancedBuffer("textureType",avatarIndex, type)
    }
    setBodyScale(avatarIndex, scale) { // 设置身体部位缩放
        this.ioInstancedBuffer("bodyScale",avatarIndex, scale)
    }
    getBodyScale(avatarIndex) { 
        return this.getInstancedBuffer("bodyScale",avatarIndex)
    }
    setAnimation(avatarIndex, type, offset) { // 设置动画类型
        this.ioInstancedBuffer("animationIndex",avatarIndex, type)
        this.ioInstancedBuffer("animationStartTime",avatarIndex, offset)
    }
    getAnimation(avatarIndex) { // 设置动画类型
        return [
            this.ioInstancedBuffer("animationIndex",avatarIndex),
            this.ioInstancedBuffer("animationStartTime",avatarIndex)
        ]
    }
    setSpeed(avatarIndex, speed) { // 设置动画速度
        this.ioInstancedBuffer("speed",avatarIndex, speed)
    }
    getSpeed(avatarIndex) { 
        return this.ioInstancedBuffer("speed",avatarIndex)
    }
    setObesity(avatarIndex, obesity) { // 设置动画速度
        return this.ioInstancedBuffer("obesity",avatarIndex,obesity)
    }
    setMoveMaxLength(avatarIndex, moveMaxLength) { // 设置动画速度
        return this.ioInstancedBuffer("moveMaxLength",avatarIndex,moveMaxLength)
    }
    useLod(lod0){
        for(var i=0;i<this.children.length;i++)
            this.children[i].useLod(lod0)
    }
    setColor(avatarIndex, color,meshName) { // 设置动画速度
        let buffer=this.instanceColorIn_All[meshName]
        if(buffer){
            for(let j=0;j<3;j++)
                buffer.array[avatarIndex*3+j]=color[j]
            buffer.needsUpdate0=true
        }
    }
    update() {
        // console.log("update")
        for(var i=0;i<this.children.length;i++)
            this.children[i].update()
    }
    updatePoints(){
        return
        const self=this
        // for(let i=self.CrowdPoints.children.length-1;i>=0;i--){
        //     self.CrowdPoints.remove(self.CrowdPoints.children[i])
        // }
        // if(self.CrowdPoints.children.length==0){
            for(let i=0;i<1;i++){//for(var i=1;i<2;i++){//for(var i=0;i<this.children.length;i++){
                const child=self.children[i]
                self.CrowdPoints.add(child.getCrowdPoints())
          }  
        // }else{
        //   for(let i=0;i<1;i++){//for(var i=1;i<2;i++){//for(var i=0;i<this.children.length;i++){
        //         const child=self.children[0].children[0]
        //         // self.CrowdPoints.add(child.getCrowdPoints())
        //         // console.log(self.CrowdPoints.children[0].children[0])
        //         self.CrowdPoints.children[0].children[0].update(child.children[child.children.length-1])
        //   }  
        // }
        
    }
}
