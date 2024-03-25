import * as THREE from "three"
export class Tool{
    constructor(opt){
        this.meshes=opt.meshes
        this.parentGroup=opt.parentGroup
        this.createFloor()
        this.doorTwinkle()

    }
    static getSampleMaterial(id){
        const r=id>>16
        const g=(id&0x00ff00)>>8
        const b=id&0x0000ff
        const material=new THREE.MeshBasicMaterial()
        material.color.r=r/255
        material.color.g=g/255
        material.color.b=b/255
        material.color.convertSRGBToLinear()
        return material
    }
    createFloor(){
        const geometry = new THREE.BoxGeometry( 1000000, 500, 50000 );
        const material = new THREE.MeshPhongMaterial( {color: 0x654321} );
        const floor = new THREE.Mesh( geometry, material );
        window.floor=floor
        this.parentGroup.add( floor );
    }
    doorTwinkle(){
        const self=this
        let flag=false
        setInterval(()=>{
            for(let id in self.meshes){
                if(self.meshes[id].visible)
                if(self.meshes[id].name.split("FM甲").length>1){//if(self.config.isdoor[""+id]==1){
                    const color=self.meshes[id].material?self.meshes[id].material.color:self.meshes[id].lod[1].material.color
                    if(flag){
                        if(color.r>0.6)color.r-=0.5
                        if(color.g>0.6)color.g-=0.5
                        if(color.b>0.6)color.b-=0.5
                    }else{
                        color.r+=0.5
                        color.g+=0.5
                        color.b+=0.5
                    }
                    // self.meshes[id].visible=!self.meshes[id].visible
                }                  
            }
            flag=!flag 
        },500)
    }
    static rayCaster(camera,arr,cb){
        //视点拾取
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        window.posList00="["
        window.addEventListener( 'mousemove', event=>{//鼠标移动事件
                mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
                mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1 ;
        }, false );
        window.addEventListener('click',()=>{
                raycaster.setFromCamera( mouse, camera )
                const intersects = raycaster.intersectObjects( arr )
                if (intersects.length > 0) {
                    if(cb)cb(intersects[0].object,intersects[0])
                    // console.log(intersects[0])
                    const p=intersects[0].point
                    window.posList00+=("["+p.x+","+p.z+"],")
                }

        },false)
    }
    static saveJson(data,name){
        const jsonData = JSON.stringify(data);
        const myBlob = new Blob([jsonData], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(myBlob)
        link.download = name
        link.click()
    }
    static saveStr(str,name){
        var myBlob=new Blob([str], { type: 'text/plain' })
        let link = document.createElement('a')
        link.href = URL.createObjectURL(myBlob)
        link.download = name
        link.click()
    }
}