import * as THREE from "three"
export class Tool{
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
    static loadJson(path,cb){
        var xhr = new XMLHttpRequest()
        xhr.open('GET', path, true)
        xhr.send()
        xhr.onreadystatechange = ()=> {
            if (xhr.readyState == 4 && xhr.status == 200) {
                var json_data = JSON.parse(xhr.responseText)
                cb(json_data)
            }
        }
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