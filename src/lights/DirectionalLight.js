class DirectionalLight {

    constructor(lightIntensity, lightColor, lightPos, focalPoint, lightUp, hasShadowMap, gl) {
        this.mesh = Mesh.cube(setTransform(0, 0, 0, 0.2, 0.2, 0.2, 0));
        this.mat = new EmissiveMaterial(lightIntensity, lightColor);
        this.lightPos = lightPos;
        this.focalPoint = focalPoint;
        this.lightUp = lightUp

        this.hasShadowMap = hasShadowMap;
        this.fbo = new FBO(gl);
        if (!this.fbo) {
            console.log("无法设置帧缓冲区对象");
            return;
        }
    }

    CalcLightMVP(translate, scale) {
        let lightMVP = mat4.create();
        let modelMatrix = mat4.create();
        let viewMatrix = mat4.create();
        let projectionMatrix = mat4.create();

        // Model transform
        mat4.translate(modelMatrix,modelMatrix,translate);
        mat4.scale(modelMatrix,modelMatrix,scale);

        // View transform
        //lightPos为(0,8,8) focalPoint为(0,0,0) lightUp为(0,1,0) 右手坐标系
        //let zDir = this.Normalize(this.lightPos - this.focalPoint);
        let zDir = this.Normalize([this.lightPos[0]-this.focalPoint[0], this.lightPos[1]-this.focalPoint[1], this.lightPos[2]-this.focalPoint[2]]);
        let xDir = this.Normalize(this.Vec3CrossVec3(this.lightUp, zDir));
        let yDir = this.Normalize(this.Vec3CrossVec3(zDir, xDir));
        //view->world 按列，world->view 按行。按下面的矩阵的排列注释，048为xDir 159为yDir 2610为zDir
        let rotationMat = [            
            xDir[0], yDir[0], zDir[0], 0,
            xDir[1], yDir[1], zDir[1], 0,
            xDir[2], yDir[2], zDir[2], 0,
            0      , 0      , 0      , 1];
        //最后一列为lightPos的反方向
        let translation = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            -this.lightPos[0],-this.lightPos[1],-this.lightPos[2],1
        ];
        //两个矩阵相乘。一个物体先平移，再旋转
        viewMatrix = this.MatMultiplyMat(rotationMat, translation);

        // Projection transform
        console.log("------------------");
        console.log(viewMatrix);
        console.log("+++++++++++++++++++")
        //正交投影，投影的参数决定了shadow map所覆盖的范围
        

        mat4.multiply(lightMVP, projectionMatrix, viewMatrix);
        mat4.multiply(lightMVP, lightMVP, modelMatrix);

        return lightMVP;
    }

    //自己定义一下mat4的函数，方便观察
    //mat4是按列定义,mat4.create()生成一个4x4的单位矩阵
    //0 4 8  12
    //1 5 9  13 
    //2 6 10 14
    //3 7 11 15

    MatMultiplyMat(matA,matB)
    {
        var result = mat4.create();
        for(var i=0; i<=15; i++)
        {
            var rowBegin = i%4;
            var colBegin = i;
            while(colBegin%4 != 0)
                colBegin--;

            for(var k=0; k<4; k++)
                result[i] += matA[rowBegin + k*4] * matB[colBegin + k];
        }
        return result;
    }

    Vec3CrossVec3(vec3A,vec3B)
    {
        return [vec3A[1]*vec3B[2]-vec3A[2]*vec3B[1], vec3A[2]*vec3B[0]-vec3A[0]*vec3B[2], vec3A[0]*vec3B[1]-vec3A[1]*vec3B[0]];
    }

    Normalize(vec3)
    {
        var length = Math.sqrt(vec3[0]*vec3[0]+vec3[1]*vec3[1]+vec3[2]*vec3[2]);
        var reciprocal = 1 / length;
        return [vec3[0] * reciprocal, vec3[1] * reciprocal, vec3[2] * reciprocal];
    }
}
