let canvas = document.querySelector('canvas');
let webgl = canvas.getContext('webgl');

webgl.clearColor(1.0, 0.0, 0.0, 1.0);
webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);
webgl.enable(webgl.DEPTH_TEST);

let vertices = new Float32Array([
    //X,Y,Z
    //Front Face
    -0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, -0.5, 0.5,

    //Back View
    -0.5, 0.5, -0.5,
    -0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
]);

let buffer = webgl.createBuffer();
webgl.bindBuffer(webgl.ARRAY_BUFFER, buffer);
webgl.bufferData(webgl.ARRAY_BUFFER, vertices, webgl.STATIC_DRAW);
let vsShader = `
precision highp float;
attribute vec3 vecposition;
uniform mat4 matx;
uniform mat4 maty;
uniform mat4 proj;
uniform mat4 camera;
uniform mat4 tranlocation;
// mat4 pos;
void main()
{
    gl_Position = proj*camera*tranlocation*maty*matx*vec4(vecposition, 1.0);
    // gl_Position = tranlocation*vec4(vec?position, 1.0);
    gl_PointSize = 5.0;
}
`;

let fsShader = `
void main()
{
    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
}
`;

let vShader = webgl.createShader(webgl.VERTEX_SHADER);
webgl.shaderSource(vShader, vsShader);
webgl.compileShader(vShader);
// if(!webgl.)
console.log(webgl.getShaderInfoLog(vShader));
let fShader = webgl.createShader(webgl.FRAGMENT_SHADER);
webgl.shaderSource(fShader, fsShader);
webgl.compileShader(fShader);
// if(!webgl.)
console.log(webgl.getShaderInfoLog(vShader));

let program = webgl.createProgram();
webgl.attachShader(program, vShader);
webgl.attachShader(program, fShader);
webgl.linkProgram(program);
webgl.useProgram(program);

let Position = webgl.getAttribLocation(program, 'vecposition');
webgl.enableVertexAttribArray(Position);
webgl.vertexAttribPointer(Position, 3, webgl.FLOAT, false, 0, 0);
webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4);
let matxloc = webgl.getUniformLocation(program, 'matx');
let matyloc = webgl.getUniformLocation(program, 'maty');
let proj = webgl.getUniformLocation(program, 'proj');
let cams = webgl.getUniformLocation(program, 'camera');
let tranlocation = webgl.getUniformLocation(program, 'tranlocation');
let angle = Math.PI/500;

function rotateX(angle)
{
    let Sintheta = Math.sin(angle);
    let Costheta = Math.cos(angle);
    return( new Float32Array([
        1, 0, 0, 0,
        0, Costheta, Sintheta, 0,
        0, -Sintheta, Costheta, 0,
        0, 0, 0, 1
    ]));
}
function rotateY(angle)
{
    let Sine = Math.sin(angle);
    let Cosine = Math.cos(angle);
    return(new Float32Array([
        Cosine, 0, 0, 0,
        0, 1, 0, 0,
        Sine, 0, Cosine, 0,
        0, 0, 0, 1
    ]));
}

function Projection(fov, near, far) {
    const f = 1.0 / Math.tan(fov / 2);
    const rangeInv = 1 / (near - far);

    return new Float32Array([
        f, 0, 0, 0,
        0, f, 0, 0,
        0, 0, (near + far) * rangeInv, -1,
        0, 0, near * far * rangeInv * 2, 0,
    ]);
}

function translate(tx, ty, tz)
{
    return(new Float32Array([
        1, 0, 0, tx,
        0, 1, 0, ty,
        0, 0, 1, tz,
        0, 0, 0, 1
    ]));
}
function Camera(eye, target, up) {
    const zAxis = normalize(subtract(eye, target));
    const xAxis = normalize(cross(up, zAxis));
    const yAxis = cross(zAxis, xAxis);

    return new Float32Array([
        xAxis[0], yAxis[0], zAxis[0], 0,
        xAxis[1], yAxis[1], zAxis[1], 0,
        xAxis[2], yAxis[2], zAxis[2], 0,
        -dot(xAxis, eye), -dot(yAxis, eye), -dot(zAxis, eye), 1,
    ]);
}

function subtract(a, b) {
    return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function normalize(v) {
    const length = Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
    return [v[0] / length, v[1] / length, v[2] / length];
}

function cross(a, b) {
    return [
        a[1] * b[2] - a[2] * b[1],
        a[2] * b[0] - a[0] * b[2],
        a[0] * b[1] - a[1] * b[0]
    ];
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

let x,y,z;
 x = y = z = 0;
 function draw() {
    webgl.clear(webgl.COLOR_BUFFER_BIT | webgl.DEPTH_BUFFER_BIT);

    let matX = rotateX(angle);
    let matY = rotateY(angle);
    let trans = translate(x, y, z);
    let projec = Projection(Math.PI / 4, 0.1, 100);
    let cam = Camera([1, 10, 0], [0, 0, 0], [0, 1, 0]);

    webgl.uniformMatrix4fv(matxloc, false, matX);
    webgl.uniformMatrix4fv(matyloc, false, matY);
    webgl.uniformMatrix4fv(cams, false, cam);
    webgl.uniformMatrix4fv(tranlocation, false, trans);
    webgl.uniformMatrix4fv(proj, false, projec);

    webgl.drawArrays(webgl.TRIANGLE_STRIP, 0, 4);
    webgl.drawArrays(webgl.TRIANGLE_STRIP, 4, 4);

    angle += 0.01;
    requestAnimationFrame(draw);
}

draw();

