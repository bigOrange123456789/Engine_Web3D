export class vs_anim_sim{
    static shader=/* glsl */`
	//////////////////////////////////////
	uniform sampler2D animationTexture;
	uniform float boneCount, animationFrameCount, animationTextureLength;
	uniform float time;

	in vec4 skinIndex, skinWeight; // 仅使用了绑定的第一个骨骼
	in float textureType;//in vec4 textureType;

	in float speed;//float speed=1.;//
	in float animationStartTime;
	in float animationIndex; // float animationIndex=0.; // 动画类型// in float animationIndex; // 动画类型//
	struct Vertex{
		vec3 position;
		vec3 normal;
	};
	vec4 getAnimationItem(float index) { // 从texture中提取矩阵元素
		float v = floor(index / animationTextureLength);
		float u = index - v * animationTextureLength;
		return texture(
			animationTexture, 
			vec2( (0.5 + u) / animationTextureLength, (0.5 + v) / animationTextureLength )
		);
	}
	mat4 computeAnimationMatrix(float boneIndex, float frameIndex) { // 计算一个骨骼的变换矩阵
		float startPos = //4. * boneCount +
				3. * (boneCount * (animationIndex  * (animationFrameCount-1.) + frameIndex) + boneIndex);
		vec4 a=getAnimationItem(startPos + 0.);
		vec4 b=getAnimationItem(startPos + 1.);
		vec4 c=getAnimationItem(startPos + 2.);
		
		return mat4(
			vec4(a.x,a.y,a.z, 0.),
			vec4(a.a,b.x,b.y, 0.),
			vec4(b.z,b.a,c.x, 0.),
			vec4(c.y,c.z,c.a, 1.)
		);
	}
	mat3 mat4_mat3(mat4 m){
		return mat3(
			m[0].xyz,
			m[1].xyz,
			m[2].xyz
		);
	}
	Vertex computeAnimationPos(float boneIndex, float frameIndex,Vertex vertex) { // 计算一个骨骼的变换矩阵
		vec4 position=vec4(vertex.position, 1.);
		mat4 m=computeAnimationMatrix( boneIndex,  frameIndex);
		vertex.position=(m*position).xyz;
		return vertex;
	}
	Vertex vertexBlending(Vertex vertex, float frameIndex) { // 动画形变, 计算4个骨骼的影响
		if ( animationTextureLength < 0.5) return vertex; // 动画未加载 //点集渲染的时候可以用到
		Vertex vertexResult;
		vertexResult.position=vec3(0.,0.,0.);
		// vertexResult.normal=vec3(0.,0.,0.);
		for(int i=0;i<4;i++){
			Vertex v=computeAnimationPos(skinIndex[i], frameIndex,vertex) ;
			vertexResult.position+=skinWeight[i] * v.position;
			// vertexResult.normal+=skinWeight[i] * v.normal;
		}
		return vertexResult;
	}
	Vertex frameInterpolation(Vertex vertex) { // 点坐标插值, 考虑优化:变换矩阵插值
		float m = floor((time + animationStartTime) * speed / (animationFrameCount-2.));
		float temp = (time + animationStartTime) * speed - m * (animationFrameCount-2.);
		float frameIndex1 = floor(temp);
		float weight = temp - frameIndex1; // 插值权重
		float frameIndex2 = float(int(frameIndex1 + 1.) % int(animationFrameCount-1.));
		if(frameIndex2>=animationFrameCount-2.)frameIndex2=0.;
		Vertex vertex1 = vertexBlending(vertex, frameIndex1);
		Vertex vertex2 = vertexBlending(vertex, frameIndex2);
		vertex.position = (1. - weight) * vertex1.position + weight * vertex2.position;
	
		// float max=moveMaxLength;//移动路线的长度
		// if(max>0.){
		// 	float direction=1.;
		// 	float x=0.25*(time + animationStartTime) * speed;
		// 	x=x-max*2.*floor(x/(max*2.));
		// 	if(x>max){
		// 		x=2.*max-x;
		// 		direction=-1.;
		// 	}
		// 	x-=max/2.;
		// 	vertex.position.x*=direction;
		// 	vertex.position.z*=direction;
		// 	vertex.position.z-=x;
	
		// 	vertex.normal.x*=direction;
		// 	vertex.normal.z*=direction;
		// }
		// vertex.position.y+=5.;
		return vertex;
	}
	//////////////////////////////////////
	`
}