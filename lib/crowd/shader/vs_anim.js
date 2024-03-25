export class vs_anim{
    static shader=/* glsl */`
	in vec3 instanceColorIn;
	out vec3 instanceColorOut;
	//////////////////////////////////////
	uniform sampler2D animationTexture;
	uniform float boneCount, animationFrameCount, animationTextureLength;
	uniform float time;
	
	in vec4 skinIndex;
	in vec4  skinWeight; // 仅使用了绑定的第一个骨骼
	in float speed;//=1.;//float speed=1.;//
	in float obesity;
	in float moveMaxLength;
	in float animationStartTime;
	in float animationIndex; // float animationIndex=0.; // 动画类型// in float animationIndex; // 动画类型//
	in vec4 bodyScale; // 0:身体 1:头部 2:上肢 3:下肢   //layout(location = 15) 
	// layout(location = 8) in vec4 bodyScale10;
	// in float a1;
	// in vec4 bodyScale2;  
	struct Vertex{
		vec3 position;
		vec3 normal;
	};
	float getBoneScale(float bone) { // 身体形变
		float b=round(bone);
		float A=bodyScale[0],B=bodyScale[1],C=bodyScale[2],D=bodyScale[3];
		if(bone > 30.5)return B;//手臂
		else if((27.<=b&&b<=46.)||(55.<=b&&b<=74.))return B;//手部
		else if(bone > 25.5)return A;//头
		// else if(b==19.||b==47.)return B;//肩部
		// else if((20.<=b&&b<=22.)||(48.<=b&&b<=50.))return B;//肩部
		
		
		else if((5.<=b&&b<=7.)||(78.<=b&&b<=80.))return D;//膝盖

		else if ( bone < 3.5 || (bone > 5.5 && bone < 6.5) )return C; // 肚子

		else if(bone > 15.5 && bone < 16.5)return D;//膝盖
		else if(12.5<bone && bone < 16.5)return D;//膝盖

		// // float A1=bodyScale1[0],B1=bodyScale1[1],C1=bodyScale1[2],D1=bodyScale1[3];
		// // float A2=bodyScale2[0],B2=bodyScale2[1],C2=bodyScale2[2],D2=bodyScale2[3];
		
		// // if((2.<=b&&b<=4.)||(75.<=b&&b<=77.))return A;//臀部
		else if((5.<=b&&b<=7.)||(78.<=b&&b<=80.))return D;//膝盖
		else if(b==8.||b==81.)return D;//踝关节
		else if((9.<=b&&b<=10.)||(82.<=b&&b<=83.))return D;//脚趾

		// // else if(12.<=b&&b<=13.)return A1;//脊柱
		// // else if(b==14.)return B1;//胸部
		// // else if(15.<=b&&b<=16.)return C1;//脖子
		// // else if(17.<=b&&b<=18.)return D1;//头
		
		// // else if(b==19.||b==47.)return A2;//肩部
		// // else if((20.<=b&&b<=22.)||(48.<=b&&b<=50.))return A2;//肩部
		// // else if((23.<=b&&b<=25.)||(51.<=b&&b<=53.))return B2;//眉毛
		// // else if(b==26.||b==54.)return C2;//手腕
		// // else if((27.<=b&&b<=46.)||(55.<=b&&b<=74.))return D2;//手部
		
		// else return 0.;

		// if ( bone < 3.5 || (bone > 5.5 && bone < 6.5) || (bone > 15.5 && bone < 16.5) ) // 身体
		// 	return bodyScale[0];
		// if ( bone > 3.5 && bone < 5.5 ) // 头部
		// 	return bodyScale[1];
		// if ( bone > 6.5 && bone < 15.5 || (bone > 16.5 && bone < 25.5) ) // 上肢
		// 	return bodyScale[2];
		// if ( bone > 25.5 ) // 下肢
		// 	return bodyScale[3];
	}
	float computeBodyScale() {
		return (
			skinWeight[0] * getBoneScale(skinIndex[0]) + 
			skinWeight[1] * getBoneScale(skinIndex[1]) +
			skinWeight[2] * getBoneScale(skinIndex[2]) +
			skinWeight[3] * getBoneScale(skinIndex[3])
		);
	}
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
				3. * (boneCount * (animationIndex  * animationFrameCount + frameIndex) + boneIndex);
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
		mat4 m1=computeAnimationMatrix( boneIndex,  0.);
		float s=computeBodyScale()+1.;//obesity;//
		mat4 test=mat4(
			vec4(s ,0.,0., 0.),
			vec4(0.,1.,0., 0.),
			vec4(0.,0.,s , 0.),
			vec4(0.,0.,0., 1.)
		);
		mat4 m2=computeAnimationMatrix( boneIndex,  frameIndex+1.);
		vertex.position=(m2*test*m1*position).xyz;
	
		vec3 normal=vertex.normal;
		mat3 m3=mat4_mat3(m1);
		mat3 test2=mat4_mat3(test);
		mat3 m4=mat4_mat3(m2);
		vertex.normal= m4*test2*m3*normal;
		return vertex;
	}
	Vertex vertexBlending(Vertex vertex, float frameIndex) { // 动画形变, 计算4个骨骼的影响
		if ( animationTextureLength < 0.5) return vertex; // 动画未加载
		Vertex vertexResult;
		vertexResult.position=vec3(0.,0.,0.);
		vertexResult.normal=vec3(0.,0.,0.);
		for(int i=0;i<4;i++){
			Vertex v=computeAnimationPos(skinIndex[i], frameIndex,vertex) ;
			vertexResult.position+=skinWeight[i] * v.position;
			vertexResult.normal+=skinWeight[i] * v.normal;
		}
		return vertexResult;
	}
	Vertex frameInterpolation(Vertex vertex) { // 点坐标插值, 考虑优化:变换矩阵插值
		float m = floor((time + animationStartTime) * speed / (animationFrameCount-1.));
		float temp = (time + animationStartTime) * speed - m * (animationFrameCount-1.);
		float frameIndex1 = floor(temp);
		float weight = temp - frameIndex1; // 插值权重
		float frameIndex2 = float(int(frameIndex1 + 1.) % int(animationFrameCount));
		if(frameIndex2>=animationFrameCount-1.)frameIndex2=0.;
		Vertex vertex1 = vertexBlending(vertex, frameIndex1);
		Vertex vertex2 = vertexBlending(vertex, frameIndex2);
		vertex.position = (1. - weight) * vertex1.position + weight * vertex2.position;
		vertex.normal = (1. - weight) * vertex1.normal + weight * vertex2.normal;
	
		float max=moveMaxLength;//移动路线的长度
		// float f=1.;
		if(max>0.){
			float direction=1.;
			float x=0.25*(time + animationStartTime) * speed;
			x=x-max*2.*floor(x/(max*2.));
			if(x>max){
				x=2.*max-x;
				direction=-1.;
			}
			x-=max/2.;
			vertex.position.x*=direction;
			vertex.position.z*=direction;
			vertex.position.z-=x;
	
			vertex.normal.x*=direction;
			vertex.normal.z*=direction;
		}
		return vertex;
	}
	//////////////////////////////////////
	`;
}