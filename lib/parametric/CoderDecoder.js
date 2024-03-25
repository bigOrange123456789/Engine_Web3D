import {
    InstancedMesh,
    Mesh,
    LoadingManager,
    Matrix4,
    MeshBasicMaterial,
    Raycaster,Vector2,
    CylinderGeometry,
    BoxGeometry,
    Object3D,
    Group,
    FileLoader
} from "../electron/three.module.js"//"three";//
import * as THREE from "../electron/three.module.js"
import{Parameter}from "./Parameter.js"
let materialTest = new MeshBasicMaterial( {color: 0xff0000} )
let geometryCylinder=new CylinderGeometry( 1, 1, 2, 8 )
const geometryCylinder0=new CylinderGeometry( 1, 1, 2, 3 )
const geometryCylinder1=new CylinderGeometry( 1, 1, 2, 5 )
const geometryCylinder2=new CylinderGeometry( 1, 1, 2, 16 )
const geometryCylinder3=new CylinderGeometry( 1, 1, 2, 16 )
const geometryCylinder4=new CylinderGeometry( 1, 1, 2, 40 )
const geometryCube=new BoxGeometry( 1, 1, 1 );
// import{CoderDecoder1}from"./CoderDecoder1"
export class CoderDecoder{
    static loadBin(path,cb_){
        let loader = new FileLoader();
		loader.setResponseType("arraybuffer");
		loader.load(
  			path,
  			buffer => {
                if(cb_)cb_(new Float32Array(buffer))
            }
        )
    }
    static code2sim(code){
        const sim=[
            code.color[0],
            code.color[1],
            code.color[2]
        ]
        const ms=code.matrix
        for(let i=0;i<ms.length;i++){
            for(let j=0;j<ms[i].length;j++){
                let value=ms[i][j]
                if(Math.floor(value)!=value&&
                10*Math.floor(value)!=10*value&&
                100*Math.floor(value)!=100*value&&
                1000*Math.floor(value)!=1000*value
                ){
                    value=parseFloat(value.toFixed(4))
                }
                sim.push(value)
            }
        }
        return sim
    }
    static sim2code(sim,type){//几何体编码长度为9
        const color=[
            sim[0],
            sim[1],
            sim[2],
        ]
        const matrix=[]
        for(let i=0;i<(sim.length-3)/9;i++){
            const m0=[]
            for(let j=0;j<9;j++){
                m0.push(sim[3+9*i+j])
            }
            matrix.push(m0)
        }
        return {
            color:color,
            matrix:matrix,
            type:type,
        }
    }
    static sim2codeOld(sim,type){
        const color=[
            sim[0],
            sim[1],
            sim[2],
        ]
        const matrix=[]
        for(let i=0;i<(sim.length-3)/12;i++){
            const m0=[]
            for(let j=0;j<12;j++){
                m0.push(sim[3+12*i+j])
            }
            matrix.push(m0)
        }
        return {
            color:color,
            matrix:matrix,
            type:type,
        }
    }
    constructor(){}
    static encoder(matrixList_,param){
        if(param.material)materialTest=param.material
        if(false)
        return CoderDecoder.encoder12(matrixList_,param)
        return CoderDecoder.encoder9(matrixList_,param)
    }
    static decoder(list2){//开始进行解码
        if(false)
        return CoderDecoder.decoder12(list2)
        return CoderDecoder.decoder9(list2)
    }
    static encoder12(matrixList_,param){
        // if(param.r)
        
        // console.log("r",param.r)
        const list16=CoderDecoder.encoder16(matrixList_,param)
        const list12=[]
        for(let i=0;i<list16.length;i++){
            const e=list16[i]
            list12.push([
                e[ 0],e[ 1],e[ 2],//0,//e[ 3],
                e[ 4],e[ 5],e[ 6],//0,//e[ 7],
                e[ 8],e[ 9],e[10],//0,//e[11],
                e[12],e[13],e[14],//1,//e[15],
            ])
        }
        return {
            matrix:list12,
            color:param.color,
            type:param.type}
    }
    static decoder12(code){//该编码方式计划废弃//通过12个数字来描述matrix的编码方式
        if(code.sim)geometryCylinder=geometryCylinder0
        else        geometryCylinder=geometryCylinder1
        const list2=code.matrix
        const type=code.type
        const color=code.color
        const geometry = type=='cube'?geometryCube:geometryCylinder
        let material = materialTest//new MeshBasicMaterial()
        if(false){
            material.color.r=1//color[0]
            material.color.g=0//color[1]
            material.color.b=0//color[2] 
        }else{
            material = new MeshBasicMaterial()
            material.color.r=color[0]
            material.color.g=color[1]
            material.color.b=color[2]
        }
        
        
        //type=='cube'?materialTest:new MeshBasicMaterial( {color: 0x00ff00} )
        const mesh = new InstancedMesh( geometry, material ,list2.length);
        for(let i=0;i<list2.length;i++){
            const e=list2[i]
            const matrix = new Matrix4();
            matrix.set(
                e[ 0],e[ 1],e[ 2],0,//e[ 3],
                e[ 3],e[ 4],e[ 5],0,//e[ 7],
                e[ 6],e[ 7],e[ 8],0,//e[11],
                e[ 9],e[10],e[11],1//e[15],
             )
            matrix.transpose ()
            mesh.setMatrixAt(i,matrix)
        }
        return mesh
    }
    static decoder9(code){//通过9个数字来描述matrix的编码方式
        if(code.sim)geometryCylinder=geometryCylinder0
        else        geometryCylinder=geometryCylinder1
        const list2=code.matrix
        const type=code.type
        const color=code.color
        const geometry = type=='cube'?geometryCube:geometryCylinder
        let material = materialTest//new MeshBasicMaterial()
        if(false){
            material.color.r=1//color[0]
            material.color.g=0//color[1]
            material.color.b=0//color[2] 
        }else{
            material = new MeshBasicMaterial()
            material.color.r=color[0]
            material.color.g=color[1]
            material.color.b=color[2]
        }
        function arr9ToMat(e){   
            // if(!(e[0]==0&e[1]==0&e[2]==0))   
            //     console.log(e)      
            const pos=new THREE.Vector3(e[0],e[1],e[2])
            const rot=new THREE.Euler(  e[3],e[4],e[5], 'XYZ')
            const sca=new THREE.Vector3(e[6],e[7],e[8])
            // console.log("r2",rot)

            const qua=new THREE.Quaternion().setFromEuler(rot)

            const matrix=new THREE.Matrix4()
			matrix.compose(
				pos,qua,sca
			)
            // console.log("m2",matrix.elements)
            // matrix.transpose()
            return matrix
        }
        
        //type=='cube'?materialTest:new MeshBasicMaterial( {color: 0x00ff00} )
        const mesh = new InstancedMesh( geometry, material ,list2.length);
        for(let i=0;i<list2.length;i++){
            const e=list2[i]
            const matrix = arr9ToMat(e)
            mesh.setMatrixAt(i,matrix)
        }
        return mesh
    }
    static encoder9(matrixList_,param){//通过9个数字来描述matrix的编码方式
        // if(param.r)
        function arr16ToArr9(e){
            // console.log("m1",e)
            const matrix=new THREE.Matrix4().set(
                e[ 0],e[ 1],e[ 2],0,//e[ 3],
                e[ 4],e[ 5],e[ 6],0,//e[ 7],
                e[ 8],e[ 9],e[10],0,//e[11],
                e[12],e[13],e[14],1,//e[15],
			)
            matrix.transpose()
            const pos=new THREE.Vector3()
            const qua=new THREE.Quaternion()
            const sca=new THREE.Vector3()
            
			matrix.decompose(//position : Vector3, quaternion : Quaternion, scale
					pos,
					qua,
					sca
			)
            
            // console.log(e[12],e[13],e[14])
            const rot=new THREE.Euler(0,0,0, 'XYZ')
			rot.setFromQuaternion(qua)
            // console.log("r1",rot)
            return [
                pos.x,pos.y,pos.z,
                rot.x,rot.y,rot.z,
                sca.x,sca.y,sca.z
            ]
        }
        function arr9ToMat(e){   
            // if(!(e[0]==0&e[1]==0&e[2]==0))   
            //     console.log(e)      
            const pos=new THREE.Vector3(e[0],e[1],e[2])
            const rot=new THREE.Euler(  e[3],e[4],e[5], 'XYZ')
            const sca=new THREE.Vector3(e[6],e[7],e[8])
            // console.log("r2",rot)

            const qua=new THREE.Quaternion().setFromEuler(rot)

            const matrix=new THREE.Matrix4()
			matrix.compose(
				pos,qua,sca
			)
            // console.log("m2",matrix.elements)
            // matrix.transpose()
            return matrix
        }
        // console.log("r",param.r)
        const list16=CoderDecoder.encoder16(matrixList_,param)
        const list09=[]
        for(let i=0;i<list16.length;i++){
            const e=list16[i]
            const code9=arr16ToArr9(e)
            // if(!(code9[7]==code9[9]))   
                // console.log(
                //     e,
                //     arr9ToMat(code9).elements
                // ) 
            list09.push(code9)
        }
        return {
            matrix:list09,
            color:param.color,
            type:param.type}
    }
    static encoder16(matrixList_,param){//通过16个数字来描述matrix的编码方式
        function matrix2arr(list){
            const list2=[]
            for(let i=0;i<list.length-1;i++){
                const m=list[i]
                let a=[]
                a=m.elements
                list2.push(a)
            }
            return list2
        }

        const list2=[]
        const matrixList=matrix2arr(matrixList_)

        const obj_matrix=CoderDecoder.paramToMat(param)

        for(let i=0;i<matrixList.length;i++){
            const elements=matrixList[i]
            const matrix = new Matrix4();
            matrix.set(
                elements[0],
                elements[1],
                elements[2],
                elements[3],

                elements[4],
                elements[5],
                elements[6],
                elements[7],

                elements[8],
                elements[9],
                elements[10],
                elements[11],

                elements[12],
                elements[13],
                elements[14],
                elements[15],
             )
            matrix.transpose ()
            matrix.multiply (obj_matrix)
            const e=matrix.elements
            // list2.push(matrix.elements)
            list2.push([
                e[ 0],e[ 1],e[ 2],0,//e[ 3],
                e[ 4],e[ 5],e[ 6],0,//e[ 7],
                e[ 8],e[ 9],e[10],0,//e[11],
                e[12],e[13],e[14],1,//e[15],
            ])
            // console.log(matrix.elements)
        }
        const matrix0=new Matrix4();
        matrix0.set(
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            0,0,0,1
        )
        matrix0.multiply (obj_matrix)
        // return matrix0//const matrix0=encoderMat(matrixList_,param)
        const e=matrix0.elements
        // list2.push(matrix0.elements)
        list2.push([
            e[ 0],e[ 1],e[ 2],0,//e[ 3],
            e[ 4],e[ 5],e[ 6],0,//e[ 7],
            e[ 8],e[ 9],e[10],0,//e[11],
            e[12],e[13],e[14],1,//e[15],
        ])
        return list2
    }

    static decoder16(list2){
        const geometry = new CylinderGeometry( 1, 1, 2, 4 )
        const mesh = new InstancedMesh( geometry, materialTest ,list2.length);
        for(let i=0;i<list2.length;i++){
            const e=list2[i]
            const matrix = new Matrix4();
            matrix.set(
                e[ 0],e[ 1],e[ 2],e[ 3],
                e[ 4],e[ 5],e[ 6],e[ 7],
                e[ 8],e[ 9],e[10],e[11],
                e[12],e[13],e[14],e[15],
            )
            // matrix.set(
            //     e[ 0],e[ 1],e[ 2],0,//e[ 3],
            //     e[ 3],e[ 4],e[ 5],0,//e[ 7],
            //     e[ 6],e[ 7],e[ 8],0,//e[11],
            //     e[ 9],e[10],e[11],1//e[15],
            //  )
            matrix.transpose ()
            mesh.setMatrixAt(i,matrix)
        }
        return mesh
    }
    static paramToMat(param){
        const obj=new Object3D()
        obj.position.set(param.pos.x,param.pos.y,param.pos.z)
        if(param.type=="cylinder"){
            if(param.direction==0)
                obj.rotation.set(0,0,Math.PI/2)
            else if(param.direction==1)
                obj.rotation.set(0,0,0)
            else
                obj.rotation.set(Math.PI/2,0,0)
            obj.scale.set(param.r,param.h_half,param.r)
        }else{//cube
            obj.scale.set(
                2*param.scale[0],
                2*param.scale[1],
                2*param.scale[2])
        }
        obj.updateMatrix ()
        return obj.matrix
    }

    static encoderParam(matrixList_,param){
        const listParam=[]
        const list=CoderDecoder.encoder16(matrixList_,param)
        // console.log(param.pos,"param2")
        for(let i=0;i<list.length;i++){
            const geometry = new CylinderGeometry( 1, 1, 2, 4 )
            const mesh = new Mesh( geometry, materialTest);
            const m=list[i]
            const array=mesh.geometry.attributes.position.array
            for(let j=0;j<array.length/3;j++){
                let x=array[3*j+0]
                let y=array[3*j+1]
                let z=array[3*j+2]
                // console.log(x,y,z,m)
                for(let k=0;k<3;k++)
                    array[3*j+k]=m[4*0+k]*x+m[4*1+k]*y+m[4*2+k]*z+m[4*3+k]
            }
            // console.log(array)
            // CoderDecoder.encoder16(matrixList_,param)
            let code=new Parameter(mesh,param.type).param
            // if(code.type=="cylinder")
            {
                code={
                    pos:code.pos,
                    direction:code.direction,
                    h_half:code.h_half,
                    r:code.r,
                }
            }
            // console.log("code",code)
            listParam.push(code)
        }
        // console.log(param,listParam[0])
        return listParam
    }
    static decoderParam(listParam){
        const useInstanced=true
        if(useInstanced){
            const geometry = new CylinderGeometry( 1, 1, 2, 4 )
            const mesh = new InstancedMesh( geometry, materialTest ,listParam.length);
            for(let i=0;i<listParam.length;i++){
                const param=listParam[i]
                const matrix=CoderDecoder.paramToMat(param)//.elements
                mesh.setMatrixAt(i,matrix)
            }
            return mesh
        }else{
            const group=new Group()
            for(let d=0;d<listParam.length;d++){
                const param=listParam[d]
                const geometry = new CylinderGeometry( 1, 1, 2, 4 )
                const mesh = new Mesh( geometry, materialTest);
                const matrix=CoderDecoder.paramToMat(param)//.elements
                mesh.applyMatrix4(matrix)
                group.add(mesh)
            }
            return group
        }
    }

    static encoderParam2(matrixList_,param){
        const list=CoderDecoder.encoderParam(matrixList_,param)
        const list2=[]
        for(let i=0;i<list.length;i++){
            const code=list[i]
            const code2=[
                code.pos.x,
                code.pos.y,
                code.pos.z,
                code.direction,
                code.h_half,
                code.r
            ]
            for(let j=0;j<6;j++)
                list2.push(code2[j])
        }
        return list2
    }
    static decoderParam2(list2){
        const list=[]
        for(let i=0;i<list2.length/6;i++){
            const code={
                pos:{
                    x:list2[i*6+0],
                    y:list2[i*6+1],
                    z:list2[i*6+2],
                },
                direction:list2[i*6+3],
                h_half:   list2[i*6+4],
                r:        list2[i*6+5],
            }
            list.push(code)
        }
        return CoderDecoder.decoderParam(list)
    }
}

