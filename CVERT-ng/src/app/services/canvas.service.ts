import * as THREE from 'three';
import { Injectable, ElementRef, OnDestroy, NgZone } from '@angular/core';

import { GisService } from '../services/gis.service';

@Injectable({
  providedIn: 'root'
})
export class CanvasService implements OnDestroy {

  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private light: THREE.AmbientLight;

  private grid: THREE.GridHelper;
  private ground: THREE.Mesh;
  private helper: THREE.Mesh;
  private marker: THREE.Mesh;

  private frameId: number = null;

  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();

  private altitude = 20;
  private pitch = -90;
  private fov = 94; // P3 diagonal FOV

  public constructor(private ngZone: NgZone,
                     private gisService: GisService) {}

  public ngOnDestroy() {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      preserveDrawingBuffer: true,
      alpha: true,    // transparent background
      antialias: true // smooth edges
    });
    this.renderer.setSize(this.canvas.width, this.canvas.height);

    // create the scene
    this.scene = new THREE.Scene();

    // create the camera
    var ratio = this.canvas.width /this.canvas.height;
    this.camera = new THREE.PerspectiveCamera(
      this.getVertFovDeg(this.fov, ratio),
      ratio,
      0.1,
      500
    );
    this.camera.position.y = this.altitude;
    this.camera.rotation.x = this.pitch * Math.PI / 180; // pitch angle (randians)
    this.scene.add(this.camera);

    // soft white light
    this.light = new THREE.AmbientLight( 0x404040 );
    this.light.position.z = 10;
    this.scene.add(this.light);

    // ground plane (transparent, just for the intersection)
    var geometry = new THREE.PlaneBufferGeometry( 2000, 2000 );
    var material = new THREE.MeshBasicMaterial({
      opacity: 0,
      transparent: true,
      depthWrite: false });
    this.ground = new THREE.Mesh( geometry, material );
		this.ground.rotation.x = - Math.PI / 2;
		this.scene.add( this.ground );

    // position helper
    var coneGeometry = new THREE.ConeBufferGeometry(1, 1, 8);
		coneGeometry.rotateX( Math.PI / 2 );
    var helperMaterial = new THREE.MeshNormalMaterial();
		this.helper = new THREE.Mesh( coneGeometry, helperMaterial );
    this.helper.name = "helper";
    this.helper.rotation.x = - Math.PI / 2;
		this.scene.add(this.helper);

    // position marker
    var markerMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000
    });
		this.marker = new THREE.Mesh( coneGeometry, markerMaterial );
    this.marker.rotation.x = - Math.PI / 2;
    this.marker.name = "marker";
		this.scene.add(this.marker);

    this.canvas.addEventListener( 'mousemove', this.onMouseMove.bind(this), false );
    this.canvas.addEventListener( 'mousedown', this.onMouseDown.bind(this), false);

    // grid helper
    this.grid = new THREE.GridHelper( 1000, 100, 0x000000, 0x888888 );
    this.grid.name = "grid";
    this.scene.add( this.grid );
  }

  isPresent(object: any): boolean {
    return !!this.scene.getObjectByName(object.name);
  }

  onMouseMove( event ) {
    if (this.isPresent(this.helper)) {
      var intersects = this.getIntersect( event );
  		if ( intersects.length > 0 ) {
  			this.helper.position.copy( intersects[ 0 ].point );
  		}
    }
  }

  onMouseDown( event ) {
    if (this.isPresent(this.marker)) {
      var intersects = this.getIntersect( event );
      if ( intersects.length > 0 ) {
        this.marker.position.copy(intersects[0].point);
        this.gisService.getGPS(intersects[0].point.x, intersects[0].point.z);
      }
    }
  }

  getIntersect( event ) {
    this.mouse.x = ( (event.offsetX) / this.renderer.domElement.width ) * 2 - 1;
		this.mouse.y = - ( (event.offsetY) / this.renderer.domElement.height ) * 2 + 1;
    this.raycaster.setFromCamera( this.mouse, this.camera );
		// See if the ray from the camera into the world hits the ground
		return(this.raycaster.intersectObject( this.ground ));
  }

  animate(): void {
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }
      window.addEventListener('resize', () => {
        this.resize();
      });
    });
  }

  render() {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    const width = this.canvas.width;
    const height = this.canvas.height;
    var ratio = width / height;
    this.camera.aspect = ratio;
    this.camera.fov = this.getVertFovDeg(this.fov, ratio);
    this.camera.updateProjectionMatrix();

    this.renderer.setSize( width, height );
  }

  updateGIS(property: string, value: number) {
    if (this.isInit()) {
      // renderer initialized, we update the scene objects
      switch(property) {
        case 'altitude':
          this.camera.position.y = value;
          break;
        case 'pitch':
          this.camera.rotation.x = value * Math.PI / 180;
          break;
        case 'fov':
          var ratio = this.canvas.width /this.canvas.height;
          this.camera.fov = this.getVertFovDeg(value, ratio);
          this.camera.updateProjectionMatrix();
          break;
        default:
          console.log('not a known canvas update property');
      }
    } else {
      // if renderer not initialized, update default properties
      switch(property) {
        case 'altitude':
          this.altitude = value;
          break;
        case 'pitch':
          this.pitch = value;
          break;
        case 'fov':
          this.fov = value;
          break;
        default:
          console.log('not a known canvas update property');
      }
    }
  }

  getVertFovDeg(diagFovDeg: number, ratio: number) {
    var fov = 2 * Math.atan2(Math.tan(diagFovDeg*Math.PI/180/2), Math.sqrt(1+ratio*ratio));
    return fov*180/Math.PI;
  }

  displayGrid(toggle: boolean) {
    this.toggleInScene(toggle, this.grid);
  }

  displayMarkers(toggle: boolean) {
    this.toggleInScene(toggle, this.marker);
    this.toggleInScene(toggle, this.helper);
  }

  toggleInScene(toggle: boolean, object: any) {
    if (toggle) {
      if (!this.isPresent(object)) {
        this.scene.add(object);
      }
    } else {
      if (this.isPresent(object)) {
        this.scene.remove(this.scene.getObjectByName(object.name));
      }
    }
  }

  isInit() {
    return(typeof this.renderer !== "undefined");
  }
}
