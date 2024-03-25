const getParam=id=>{
    id=id+"="
        return window.location.search.split(id).length>1?
            window.location.search.split(id)[1].split("&")[0]:
            null
}
export class Param{
    constructor(config){        
        config.useGPU=getParam('useGPU')?getParam('useGPU'):true

        config.main.speed       =getParam('speed')?getParam('speed'):config.main.speed
        config.main.autoMove    =getParam('autoMove')
        config.main.render      =getParam('render')
        config.main.useIndirectMaterial = config.Building.useIndirectMaterial

        if(getParam('NUMBER'))
        config.Building.NUMBER=getParam('NUMBER')
        config.Building.TIME=getParam('TIME')

        config.Building.useP2P=
            !new URLSearchParams(window.location.search).has("useP2P")?false:
            new URLSearchParams(window.location.search).get('useP2P')=="true"
        config.Building.onlyP2P=
            !new URLSearchParams(window.location.search).has("onlyP2P")?false:
            new URLSearchParams(window.location.search).get('onlyP2P')=="true"
        
        if(getParam('list2Len'))
            config.Visibility.list2Len=parseFloat(getParam('list2Len'))

        if(getParam('testTime'))
            config.Detection.testTime=parseFloat(getParam('testTime'))
        if(getParam('maxBackDelay'))
            config.Detection.maxBackDelay=parseFloat(getParam('maxBackDelay'))

        config.Detection.backURL=getParam('backURL')
        if(getParam('backURL')!==null){//backURL需要将autoMove参数传回
            let backURL=getParam('backURL')
            const add=(tag)=>{
                const value=getParam(tag)
                if(value!==null){
                    if(backURL.split('?').length>1)backURL+="&"
                    else backURL+="?"
                    backURL=backURL+tag+"="+value
                }
            }
            add('autoMove')
            add('userId') 
            config.Detection.backURL=backURL    
        }
        
        
    
        window.configALL=config
        this.config=config
    }
}