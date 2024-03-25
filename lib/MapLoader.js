import * as THREE from "three";
export class MapLoader{
    constructor(){}
    static getCubeMapTexture(path,renderer) {
        return new Promise((resolve, reject) => {//'.exr'
            new THREE.TextureLoader()
            //.setDataType(THREE.FloatType)
            .load(
                path,
                texture => {
                    const pmremGenerator = new THREE.PMREMGenerator(renderer)
                    pmremGenerator.compileEquirectangularShader()

                    const envMap =//texture
                        pmremGenerator.fromEquirectangular(texture).texture
                    pmremGenerator.dispose()

                    resolve({ envMap })
                },
                undefined,
                reject
            )
        })
    }
}