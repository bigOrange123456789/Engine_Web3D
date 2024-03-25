// import { Parameter } from './parametric/Parameter.js'
import { Classification } from './parametric/Classification.js'

import * as THREE from "./electron/three.module.js"
import { GLTFLoader } from './electron/GLTFLoader.js'//
import { GLTFExporter } from './electron/GLTFExporter.js'//'three/examples/jsm/exporters/GLTFExporter';
export class Engine3D{
    static versionId="2023.12.15;16:45"
    //start.js
    // static Parameter=Parameter
    static Classification=Classification

    static THREE=THREE
    static GLTFLoader=GLTFLoader
    static GLTFExporter=GLTFExporter
}