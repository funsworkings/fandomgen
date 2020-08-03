import * as THREE from './three/build/three.module.js';

import { FBXLoader } from './three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader as ObjLoader } from './three/examples/jsm/loaders/OBJLoader.js';
import { ColladaLoader } from './three/examples/jsm/loaders/ColladaLoader.js';
import { MTLLoader } from './three/examples/jsm/loaders/MTLLoader.js'

import { update_object_material, normalize_object_scale } from './threejs_helpers.js';

import { Avatar, Avatar_Info } from './index.js';

var scene;
var camera;
var renderer;
var spotlight;
var ambientlight;
var floor;

const radius = 1;
const height = 1;
const speed = 45;
var angle = 0.0;

const init = function(container) 
{
    scene = new THREE.Scene();

    var width = $(container).width();
    var height = $(container).height()

    camera = new THREE.PerspectiveCamera( 75, width / height, 0.1, 1000 );
        camera.position.set(0, 2, 2);

    spotlight = new THREE.DirectionalLight( 0xffffff, 1.0 );
        spotlight.position.set(5, 10, 5);

        spotlight.shadow.camera.near = 0.1;       
        spotlight.shadow.camera.far = 25;      
        spotlight.castShadow = true;
        spotlight.shadow.mapSize.width = 2048;
        spotlight.shadow.mapSize.height = 2048;

    scene.add(spotlight);

    var helper = new THREE.CameraHelper( spotlight.shadow.camera );
    scene.add(helper);

    ambientlight = new THREE.AmbientLight( 0x404040 );
    scene.add(ambientlight);

    var geometry = new THREE.BoxGeometry();
    var material = new THREE.MeshLambertMaterial( { color: 0xffffff } );
    var cube = new THREE.Mesh( geometry, material );
        cube.receiveShadow = true;
        cube.castShadow = true;

        cube.position.set(0, -.5, 0);
        cube.scale.set(10, 1, 10);

    scene.add( cube );

    renderer = new THREE.WebGLRenderer();
    renderer.setSize( width, height );
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    animate();

    return (renderer.domElement);
}

const import_avatar = function(avatar)
{
    var thumbnail = avatar.thumbnail;

    if(thumbnail)
    {
        THREE.ImageUtils.crossOrigin = '';
        var tex = THREE.ImageUtils.loadTexture(thumbnail);

        //var loader = new THREE.TextureLoader();
        //loader.setCrossOrigin("");

        var geometry = new THREE.PlaneGeometry( 5, 20, 32 );
        var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, map: tex} );
        var plane = new THREE.Mesh( geometry, material );

        scene.add(plane);

        /*
        loader.load(thumbnail, function(tex){
            var geometry = new THREE.PlaneGeometry( 5, 20, 32 );
            var material = new THREE.MeshBasicMaterial( {color: 0xffffff, side: THREE.DoubleSide, map: tex} );
            var plane = new THREE.Mesh( geometry, material );

            scene.add(plane);
        })*/
    }
}

const import_mesh = function(path, material = null)
{
    var LOADER;

    if(path.includes(".fbx"))
    {
        LOADER = new FBXLoader();
        LOADER.load(path, function(mesh)
        {
            mesh.castShadow = true;

            var mat =  new THREE.MeshLambertMaterial({ color: 0xff0000 });
            update_object_material(mesh, mat);
            normalize_object_scale(1.0, mesh);

            scene.add(mesh);
            console.log("success load= " + path);
        });
    }
    else if(path.includes(".dae"))
    {
        LOADER = new ColladaLoader();
        LOADER.load(path, function colladaReady( collada )
        {
            var mesh = collada.scene;
            mesh.castShadow = true;

            var mat =  new THREE.MeshLambertMaterial({ color: 0xff0000 });
            update_object_material(mesh, mat);
            normalize_object_scale(1.0, mesh);

            scene.add( mesh );
            console.log("success load= " + path);
        });
    }
    else if(path.includes("obj"))
    {
        var load_obj = function(path, _material)
        {
            LOADER = new ObjLoader();
            if(_material)
                LOADER.setMaterials(_material);

            LOADER.load(path, function(mesh)
            {
                mesh.position.set(0, 0, 0);
                mesh.castShadow = true;

                if(!_material) {
                    var mat =  new THREE.MeshLambertMaterial({ color: 0xff0000 });
                    update_object_material(mesh, mat);
                }

                normalize_object_scale(1.0, mesh);
                scene.add(mesh);

                console.log("success load= " + path);
            });
        }


        if(material)
        {
            var MTL_LOADER = new MTLLoader();
            MTL_LOADER.load(material, function(mat){
                mat.preload();

                console.log(mat);
                load_obj(path, mat);
            });
        }
        else
            load_obj(path, null);
    }
}


var last_t = Date.now();
var curr_t = Date.now();
var DT = 0.0;

const animate = function () 
{
    requestAnimationFrame( animate );

    curr_t = Date.now();
    DT = (curr_t - last_t) / 1000.0;
    last_t = curr_t;

    angle += speed * DT;

    var ang = THREE.Math.degToRad(angle);

    var x = Math.cos(ang) * radius;
    var y = height;
    var z = Math.sin(ang) * radius;

    camera.position.set(x, y, z);
    camera.lookAt(0, 0, 0);

    renderer.render( scene, camera );
};


export { init, animate, import_mesh, import_avatar };