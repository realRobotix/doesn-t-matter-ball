#version 300 es
precision highp float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec3 iColor;
uniform vec3 iBall[6];
uniform float iThreshold;
out vec4 fragColor;

vec3 hsv2rgb(vec3 c){
    vec4 K=vec4(1.,2./3.,1./3.,3.);
    vec3 p=abs(fract(c.xxx+K.xyz)*6.-K.www);
    return c.z*mix(K.xxx,clamp(p-K.xxx,0.,1.),c.y);
}

vec3 channel_mix(vec3 a,vec3 b,vec3 w){
    return vec3(mix(a.r,b.r,w.r),mix(a.g,b.g,w.g),mix(a.b,b.b,w.b));
}

float gaussian(float z,float u,float o){
    return(1./(o*sqrt(2.*3.1415)))*exp(-(((z-u)*(z-u))/(2.*(o*o))));
}

vec3 overlay(vec3 a,vec3 b,float w){
    return mix(a,channel_mix(
        2.*a*b,
        vec3(1.)-2.*(vec3(1.)-a)*(vec3(1.)-b),
        step(vec3(.5),a)
    ),w);
}

void main(){
    vec2 uv=gl_FragCoord.xy/iResolution.xy;
    
    float value=0.;

    for (int i = 0; i < iBall.length(); i++) {
        vec3 ball = iBall[i];
        float d = distance(ball.xy, gl_FragCoord.xy);
        float x = (ball.z/d);
        value += x;
        //value+=1./(1.+pow(1.5,-30.*(x-.57)));
    }

    vec4 color;

    if (value > iThreshold) {
        color = vec4(iColor, 1.0);
    } else {
        color = vec4(0.0, 0.0, 0.0, 1.0);
    }
    
    // add film grain
    
    float variance=.8;
    float t=iTime*.5;
    float grainSeed=dot(uv,vec2(12.9898,78.233));
    float noise=fract(sin(grainSeed)*43758.5453+t*2.);
    noise=gaussian(noise,0.,variance*variance);
    
    float w=.1;
    
    vec3 grain=vec3(noise)*(1.-color.rgb);
    
    color.rgb=overlay(color.rgb,grain,w);
    
    //color = vec4(vec3(noise), 1.0);
    
    fragColor=color*min(iTime,1.);
}
