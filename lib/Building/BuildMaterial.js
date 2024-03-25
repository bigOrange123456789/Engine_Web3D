import * as THREE from "three"
// 170 612  使用normalmap的构件
// 167 165
// 171 612
// 180 165
// 181 375
// 417 165
// 474 165
export class BuildMaterial{
    #needProcess
    constructor(opt){
        this.config=window.configALL.BuildMaterial //this.config={}
        this.#needProcess=this.config?true:false
        if(!this.#needProcess)return
        this.config.path=opt.path
        this.meshes=opt.meshes
        // this.instance_info=opt.instance_info
        this.getInstancedMeshById=opt.getInstancedMeshById

        this.materialList={}
        this.textureMap=this.config.textureMap
        this.materialListIndex=this.config.materialListIndex
        this.mapId2mapFile=this.config.mapId2mapFile

        this.normalMap=new THREE.TextureLoader().load(this.config.path+this.textureMap+"GroundGrassGreen002_NRM_0_5K.jpg" )
        this.normalMap.repeat.x=this.normalMap.repeat.y=1/1000 //0.0008 
        this.normalMap.wrapS=this.normalMap.wrapT=THREE.RepeatWrapping
    }
    checkMaterial(id,meshOld){
        if(!this.#needProcess)return
        const materialId=this.materialListIndex[id]
        if(this.materialList[materialId]){
            meshOld.material=this.materialList[materialId]
        }else{
            this.materialList[materialId]=meshOld.material
        }
    }
    loadTexture(meshId){
        if(!this.#needProcess)return
        const materialId=this.materialListIndex[meshId]
        const mapName=this.mapId2mapFile[materialId]
        if(!mapName)return
        if(!this.textureList)this.textureList={}
        if(this.textureList[materialId])return
        else this.textureList[materialId]=true
        const path=this.config.path+this.textureMap+mapName
        // const self=this
        // new THREE.TextureLoader().load( path ,texture=>{
        //     // var materailId=null
        //     // for()
        //     self.addMaterial(materialId,texture)
        // })
        const self=this
        const texture=new THREE.TextureLoader().load( path ,()=>{
            self.#addMaterial(materialId,texture)
        })
        
    }
    #addMaterial(materialId,texture){
        // console.log(materialId,texture)
        for(let meshId=0;meshId<this.materialListIndex.length;meshId++){
            if(this.materialListIndex[meshId]==materialId){
                const m=self.meshes[meshId]
                if(m){
                    let j=0
                    // for(let j=0;j<2;j++){
                        m.lod[j].visible=false

                        if(m.lod[j].material.map){
                            for(let tag in texture){
                                if(tag!=="source")texture[tag]=m.lod[j].material.map[tag]
                            }
                            m.lod[j].material.map=texture// m.lod[j].material.map.source=texture.source
                        }

                        if(this.normalMap)
                        if(m.lod[j].material.normalMap){
                            m.lod[j].material.normalMap=this.normalMap
                        }

                        if(materialId==282)//草地 [274砖墙 278人行道 282草地]
                        if(m.lod[j].material.normalMap)
                            if(this.normalMap){
                                // m.lod[j].material.normalMap=this.normalMap
                                console.log(
                                    m.lod[j].material.normalMap,this.normalMap
                                )
                                const m1=m.lod[j].material.normalMap
                                const m2=this.normalMap
                                for(let tag in m1){
                                    if(m1[tag]!=m2[tag]){
                                        console.log(tag,)
                                    }
                                }
                                window.t1=m1
                                window.t2=m2
                                window.m=m.lod[j].material
                            }
                                
                        
                        // m.lod[j]=new THREE.Mesh(m.lod[j].geometry,m.lod[j].material)
                        if(false){
                            m.lod[j].material.needsUpdate=true
                            if(this.csm)this.csm.setupMaterial(m.lod[j].material);
                        }else{
                            // m.lod[j]=this.getInstancedMesh(
                            //     m.lod[j].geometry,
                            //     m.lod[j].material,
                            //     this.instance_info[meshId]
                            // )
                            m.lod[j]=this.getInstancedMeshById(
                                m.lod[j].geometry,
                                m.lod[j].material,
                                meshId
                            )
                            m.lod[j].castShadow =true// false//
                            m.lod[j].receiveShadow = true//false//
                            m.add(m.lod[j])
                            m.lod[1].visible=false
                        }
                        m.lod[1]=m.lod[0]
                        
                    // }
                    
                    this.textureList[materialId]=m.lod[0].material
                }
                
            }
        }
    }
}