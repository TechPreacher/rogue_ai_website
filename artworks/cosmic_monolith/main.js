// Initialize WebGL context
const canvas = document.getElementById('webglCanvas');
const gl = canvas.getContext('webgl', { alpha: false });

if (!gl) {
    console.error('WebGL not supported');
    throw new Error('WebGL not supported');
}

// Vertex shader for space background
const spaceVertexShader = `
    attribute vec4 position;
    varying vec2 vUv;
    void main() {
        vUv = position.xy * 0.5 + 0.5;
        gl_Position = position;
    }
`;

// Fragment shader for space background
const spaceFragmentShader = `
    precision highp float;
    varying vec2 vUv;
    uniform float time;

    float random(vec2 st) {
        return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float noise(vec2 st) {
        vec2 i = floor(st);
        vec2 f = fract(st);
        float a = random(i);
        float b = random(i + vec2(1.0, 0.0));
        float c = random(i + vec2(0.0, 1.0));
        float d = random(i + vec2(1.0, 1.0));
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(a, b, u.x) + (c - a)* u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
    }

    void main() {
        vec2 uv = vUv;
        vec3 color = vec3(0.0, 0.0, 0.1); // Dark blue base
        
        // Create moving nebula effect
        float nebula = 0.0;
        for(float i = 1.0; i < 4.0; i++) {
            nebula += noise(uv * 3.0 * i + time * 0.1) / i;
        }
        
        color += vec3(0.2, 0.0, 0.3) * nebula;
        
        // Add stars
        for(float i = 1.0; i < 8.0; i++) {
            vec2 starPos = vec2(
                random(vec2(i, 1.0)) + sin(time * 0.2 + i) * 0.1,
                random(vec2(i, 2.0)) + cos(time * 0.15 + i) * 0.1
            );
            float star = 1.0 - smoothstep(0.0, 0.05, length(uv - starPos));
            color += vec3(1.0) * star * 0.5;
        }

        gl_FragColor = vec4(color, 1.0);
    }
`;

// Vertex shader for rhombus
const rhombusVertexShader = `
    attribute vec4 position;
    attribute vec3 normal;
    uniform mat4 modelViewMatrix;
    uniform mat4 projectionMatrix;
    varying vec3 vNormal;
    varying vec3 vPosition;
    
    void main() {
        vPosition = position.xyz;
        vNormal = (modelViewMatrix * vec4(normal, 0.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * position;
    }
`;

// Fragment shader for rhombus
const rhombusFragmentShader = `
    precision highp float;
    varying vec3 vNormal;
    varying vec3 vPosition;
    uniform float time;
    
    void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));
        
        // Environment reflection
        vec3 reflection = reflect(viewDir, normal);
        
        // Create a metallic black color with slight reflection
        vec3 baseColor = vec3(0.02);
        float fresnel = pow(1.0 - abs(dot(normal, viewDir)), 3.0);
        
        vec3 finalColor = mix(baseColor, vec3(0.3), fresnel);
        
        gl_FragColor = vec4(finalColor, 1.0);
    }
`;

// Utility function to create and compile shaders
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

// Create shader program
function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Program link error:', gl.getProgramInfoLog(program));
        return null;
    }
    return program;
}

// Create space background program
const spaceVertexShaderCompiled = createShader(gl, gl.VERTEX_SHADER, spaceVertexShader);
const spaceFragmentShaderCompiled = createShader(gl, gl.FRAGMENT_SHADER, spaceFragmentShader);
const spaceProgram = createProgram(gl, spaceVertexShaderCompiled, spaceFragmentShaderCompiled);

// Create rhombus program
const rhombusVertexShaderCompiled = createShader(gl, gl.VERTEX_SHADER, rhombusVertexShader);
const rhombusFragmentShaderCompiled = createShader(gl, gl.FRAGMENT_SHADER, rhombusFragmentShader);
const rhombusProgram = createProgram(gl, rhombusVertexShaderCompiled, rhombusFragmentShaderCompiled);

// Create quad for space background
const quadVertices = new Float32Array([
    -1, -1,
     1, -1,
    -1,  1,
     1,  1,
]);

const spaceVao = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, spaceVao);
gl.bufferData(gl.ARRAY_BUFFER, quadVertices, gl.STATIC_DRAW);

// Create rhombus vertices
function createRhombusGeometry() {
    // Create a proper rhombus with equal edges
    const vertices = [];
    const normals = [];

    // Define the four vertices of a rhombus
    const height = 1.2;  // Vertical distance from center to top/bottom points
    const width = 0.4;   // Horizontal distance from center to side points
    const depth = 0.2;   // Depth (z-axis) for the side points

    // Center points (front and back)
    const frontCenter = [0, 0, depth];
    const backCenter = [0, 0, -depth];
    
    // Top and bottom points
    const top = [0, height, 0];
    const bottom = [0, -height, 0];
    
    // Side points
    const right = [width, 0, 0];
    const left = [-width, 0, 0];

    // Front faces
    vertices.push(
        // Top front triangle
        ...top, ...frontCenter, ...right,
        // Bottom front triangle
        ...bottom, ...right, ...frontCenter,
        // Top front left triangle
        ...top, ...left, ...frontCenter,
        // Bottom front left triangle
        ...bottom, ...frontCenter, ...left
    );

    // Back faces
    vertices.push(
        // Top back triangle
        ...top, ...right, ...backCenter,
        // Bottom back triangle
        ...bottom, ...backCenter, ...right,
        // Top back left triangle
        ...top, ...backCenter, ...left,
        // Bottom back left triangle
        ...bottom, ...left, ...backCenter
    );

    // Calculate normals for each triangle
    for(let i = 0; i < vertices.length; i += 9) {
        const v0 = [vertices[i], vertices[i+1], vertices[i+2]];
        const v1 = [vertices[i+3], vertices[i+4], vertices[i+5]];
        const v2 = [vertices[i+6], vertices[i+7], vertices[i+8]];

        // Calculate vectors
        const vec1 = [
            v1[0] - v0[0],
            v1[1] - v0[1],
            v1[2] - v0[2]
        ];
        const vec2 = [
            v2[0] - v0[0],
            v2[1] - v0[1],
            v2[2] - v0[2]
        ];

        // Calculate cross product for normal
        const normal = [
            vec1[1] * vec2[2] - vec1[2] * vec2[1],
            vec1[2] * vec2[0] - vec1[0] * vec2[2],
            vec1[0] * vec2[1] - vec1[1] * vec2[0]
        ];

        // Normalize
        const length = Math.sqrt(normal[0] * normal[0] + normal[1] * normal[1] + normal[2] * normal[2]);
        normal[0] /= length;
        normal[1] /= length;
        normal[2] /= length;

        // Add the same normal for all three vertices of this face
        normals.push(...normal, ...normal, ...normal);
    }

    return {
        vertices: new Float32Array(vertices),
        normals: new Float32Array(normals)
    };
}

const rhombusGeometry = createRhombusGeometry();
const rhombusVertexBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rhombusVertexBuffer);
gl.bufferData(gl.ARRAY_BUFFER, rhombusGeometry.vertices, gl.STATIC_DRAW);

const rhombusNormalBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, rhombusNormalBuffer);
gl.bufferData(gl.ARRAY_BUFFER, rhombusGeometry.normals, gl.STATIC_DRAW);

// Animation variables
let time = 0;
let rotation = 0;

// Resize canvas to match window size
function resize() {
    const pixelRatio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * pixelRatio;
    canvas.height = window.innerHeight * pixelRatio;
    canvas.style.width = window.innerWidth + 'px';
    canvas.style.height = window.innerHeight + 'px';
    gl.viewport(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', resize);
resize();

// Render loop
function render() {
    time += 0.016;
    rotation += 0.005;
    
    // Clear canvas
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    // Render space background
    gl.useProgram(spaceProgram);
    gl.bindBuffer(gl.ARRAY_BUFFER, spaceVao);
    
    const positionLocation = gl.getAttribLocation(spaceProgram, 'position');
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    
    const timeLocation = gl.getUniformLocation(spaceProgram, 'time');
    gl.uniform1f(timeLocation, time);
    
    gl.disable(gl.DEPTH_TEST);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    
    // Render rhombus
    gl.useProgram(rhombusProgram);
    
    // Set up vertices
    gl.bindBuffer(gl.ARRAY_BUFFER, rhombusVertexBuffer);
    const rhombusPositionLocation = gl.getAttribLocation(rhombusProgram, 'position');
    gl.enableVertexAttribArray(rhombusPositionLocation);
    gl.vertexAttribPointer(rhombusPositionLocation, 3, gl.FLOAT, false, 0, 0);
    
    // Set up normals
    gl.bindBuffer(gl.ARRAY_BUFFER, rhombusNormalBuffer);
    const normalLocation = gl.getAttribLocation(rhombusProgram, 'normal');
    gl.enableVertexAttribArray(normalLocation);
    gl.vertexAttribPointer(normalLocation, 3, gl.FLOAT, false, 0, 0);
    
    // Set up matrices for rhombus
    const aspect = canvas.width / canvas.height;
    const fov = Math.PI / 3;
    const near = 0.1;
    const far = 100.0;
    
    const f = 1.0 / Math.tan(fov / 2);
    const projectionMatrix = new Float32Array([
        f/aspect, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (far+near)/(near-far), -1,
        0, 0, (2*far*near)/(near-far), 0
    ]);
    
    const modelViewMatrix = new Float32Array([
        Math.cos(rotation), 0, -Math.sin(rotation), 0,
        0, 1, 0, 0,
        Math.sin(rotation), 0, Math.cos(rotation), 0,
        0, 0, -4, 1
    ]);
    
    const modelViewLocation = gl.getUniformLocation(rhombusProgram, 'modelViewMatrix');
    const projectionLocation = gl.getUniformLocation(rhombusProgram, 'projectionMatrix');
    const rhombusTimeLocation = gl.getUniformLocation(rhombusProgram, 'time');
    
    gl.uniformMatrix4fv(modelViewLocation, false, modelViewMatrix);
    gl.uniformMatrix4fv(projectionLocation, false, projectionMatrix);
    gl.uniform1f(rhombusTimeLocation, time);
    
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.drawArrays(gl.TRIANGLES, 0, rhombusGeometry.vertices.length / 3);
    
    requestAnimationFrame(render);
}

// Start animation
render();
