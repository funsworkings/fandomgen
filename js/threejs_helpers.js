import * as THREE from './three/build/three.module.js';

const update_object_material = function(obj, mat)
{
    obj.traverse(function(child) 
    {
        if (child instanceof THREE.Mesh) {
            child.material = mat;
        }
    });
}

const normalize_object_scale = function(scale, obj){
    var mesh = null;
    obj.traverse(function(child) 
    {
        if (child instanceof THREE.Mesh) 
            mesh = child;
    });

    if(mesh)
    {
        var box = new THREE.Box3();
        mesh.geometry.computeBoundingBox();
        console.log( mesh.geometry.boundingBox );

        //mesh.updateMatrixWorld( true ); // ensure world matrix is up to date
        //box.applyMatrix4( mesh.matrixWorld );

        var sc = new THREE.Vector3();
        mesh.geometry.boundingBox.getSize(sc);
        //box.getSize(scale);

        console.log(sc);

        var normal_scale = (new THREE.Vector3(sc.x, sc.y, sc.z)).normalize();
        normal_scale.divide(sc);

        var diff = new THREE.Vector3(normal_scale.x, normal_scale.y, normal_scale.z);
        console.log(`scale multiplier= ${diff.x}, ${diff.y}, ${diff.z}`);

        obj.scale.set(diff.x, diff.y, diff.z);
    }
}

export { update_object_material, normalize_object_scale };