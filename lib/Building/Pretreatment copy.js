import * as THREE from "three"
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter'
import {OBJExporter} from "three/examples/jsm/exporters/OBJExporter"
import { saveAs } from 'file-saver';
import { Obstacle } from './Pretreatment/Obstacle.js'
export class Pretreatment{
    constructor(building){
        new Obstacle(building)
        this.count=3577//529
        this.building=building
        window.test=this

        const self=this
        window.saveMatrix=()=>{
            const instance_info=building.instance_info
            const a=[]
            for(let i=0;i<529;i++){
                a.push(instance_info[i])
            }
            self.saveJson(a,"matrix.json")
        }

        window.downloadAll=()=>{
            const scene=new THREE.Scene()
            for(let i in meshes){
                const o=meshes[i]
                if(o instanceof THREE.Mesh&&o.visible){
                    // o.geometry.attributes={position:o.geometry.attributes.position}
                    scene.add(o)
                }
            }
            const objData = new OBJExporter().parse(scene);
            const blob = new Blob([objData], { type: 'textain' });
            saveAs(blob, "all.obj");
        }
        console.log(window.downloadAll)

        const save2obj = function(index){
            console.log(index,index+".obj")
            self.saveMesh(meshes[index],index+".obj")
            if(index+1>=Object.keys(meshes).length) {
                console.log("finish!")
            }else{
                setTimeout(()=>{
                    save2obj(index+1)
                },100)
            }
        }
        window.save2obj=()=>{
            save2obj(0)
        }
        window.getMatrix=()=>{
            self.getMatrix()
        }



    }
    getMatrix(){
        const self=this
        const matrix2str=instanceMatrix=>{
            let str=""
            console.log(instanceMatrix.length,"instanceMatrix.length")
            for(let i=0;i<Object.keys(instanceMatrix).length;i++){
                const group=instanceMatrix[""+i]
                str+="["
                for(let j=0;j<group.length;j++){
                    const mesh=group[j]
                    str+=("[")
                    for(let k=0;k<12;k++){
                        str+=(mesh[k])
                        if(k<12-1)str+=(", ")
                    }
                    str+=("]")
                    if(j<group.length-1)str+=(", ")
                }
                str+="], "
            }
            console.log(str)
            self.saveStr(str,"matrices_all.json")
        }
        matrix2str(self.building.config.instanceMatrix)
    }
    start(){
        const self=this
        self.loadAll(()=>{
            setTimeout(()=>{
                if(Object.keys(self.building.meshes).length==self.count){
                    self.saveAll()
                }else{
                    console.log("等待时间不足")
                    alert("等待时间不足，请修改代码中的等待时间！")
                }
            },500)
        })
    }
    loadAll(cb){
        const self=this
        function l(i){
            console.log(i,self.count)
            self.building.loadZip(i)
            if(i==self.count){console.log("加载完成");if(cb)cb()}//alert("加载完成！")
            else setTimeout(()=>{l(i+1);},100)
        }
        l(0)
    }
    saveAll1(){
        const self=this
        function s(i){
            console.log(i,self.count)
            const mesh=self.building.meshes[i].lod[0]
            self.saveGLTF(mesh,i)
            if(i+1==self.count)alert("下载完成！")
            else setTimeout(()=>{s(i+1);},1000)
        }
        s(0)
    }
    saveGLTF(mesh,id){
        const scene=new THREE.Scene()
        const name=id+".gltf"
        scene.add(mesh)
        mesh.visible=true
        delete mesh.geometry.attributes.normal
        // scene.traverse(o=>{
        //     if(o instanceof THREE.Mesh)
        //         o.geometry.attributes={position:o.geometry.attributes.position}
        // })
        const self=this
        new GLTFExporter().parse(scene, function (result) {
            self.saveJson(result,name);
        });
    }
    saveMesh(mesh,name){
        const scene=new THREE.Scene()
        scene.add(mesh)
        scene.traverse(o=>{
            if(o instanceof THREE.Mesh)
                o.geometry.attributes={position:o.geometry.attributes.position}
        })
        const objData = new OBJExporter().parse(scene, { includeNormals: false });

        // 将数据保存为OBJ文件
        const blob = new Blob([objData], { type: 'textain' });
        saveAs(blob, name);
    }
    saveAll2(){
        const scene=new THREE.Scene()
        const name=id+".gltf"
        scene.add(mesh)
        // const meshes=self.building.meshes
        
        // mesh.visible=true
        // delete mesh.geometry.attributes.normal
        // scene.traverse(o=>{
        //     if(o instanceof THREE.Mesh)
        //         o.geometry.attributes={position:o.geometry.attributes.position}
        // })
        const self=this
        new GLTFExporter().parse(scene, function (result) {
            self.saveJson(result,name);
        });
    }
    saveJson(data,name){
        const jsonData = JSON.stringify(data);//JSON.stringify(data, null, 2); // Convert JSON object to string with indentation
        
        const myBlob = new Blob([jsonData], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(myBlob)
        link.download = name
        link.click()
    }
    saveStr(str,name){
        var myBlob=new Blob([str], { type: 'text/plain' })
        let link = document.createElement('a')
        link.href = URL.createObjectURL(myBlob)
        link.download = name
        link.click()
    }
    saveJson(data,name){
        const jsonData = JSON.stringify(data);//JSON.stringify(data, null, 2); // Convert JSON object to string with indentation
        
        const myBlob = new Blob([jsonData], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(myBlob)
        link.download = name
        link.click()
    }
    load0(){
        const self=this
        loadAll(0)
        function loadAll(index){
            self.loadZip(index,()=>{
                setTimeout(()=>{
                    if(index+1<self.NumberOfComponents)
                        loadAll(index+1)
                },100)
            })
        }
    }
}