import { Component, ViewChild, ElementRef, OnInit, OnDestroy } from '@angular/core';
import * as THREE from 'three';

@Component({
  selector: 'app-sphere',
  standalone: true,
  templateUrl: './sphere.component.html',
  styleUrls: ['./sphere.component.css']
})
export class SphereComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private renderer!: THREE.WebGLRenderer;
  private sphere!: THREE.Mesh;
  private animationId: number | null = null;

  ngOnInit() {
    this.initScene();
    this.createSphere();
    this.animate();
    window.addEventListener('resize', () => this.onWindowResize());
  }

  private initScene() {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0e27);

    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.z = 3;

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.shadowMap.enabled = true;

    this.setupLights();
  }

  private setupLights() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x00d4ff, 1.5);
    pointLight.position.set(5, 5, 5);
    pointLight.castShadow = true;
    this.scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xff00ff, 1.2);
    pointLight2.position.set(-5, -5, 5);
    this.scene.add(pointLight2);
  }

  private createSphere() {
    const geometry = new THREE.IcosahedronGeometry(1, 20);
    const material = new THREE.MeshPhongMaterial({
      color: 0x00d4ff,
      emissive: 0x004080,
      shininess: 100,
      wireframe: false
    });

    this.sphere = new THREE.Mesh(geometry, material);
    this.sphere.castShadow = true;
    this.sphere.receiveShadow = true;
    this.scene.add(this.sphere);

    const wireframeGeometry = new THREE.IcosahedronGeometry(1.01, 20);
    const wireframeMaterial = new THREE.MeshPhongMaterial({
      color: 0x00ffff,
      emissive: 0x0088ff,
      wireframe: true,
      transparent: true,
      opacity: 0.3
    });
    const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
    this.sphere.add(wireframe);
  }

  private animate = () => {
    this.animationId = requestAnimationFrame(this.animate);

    this.sphere.rotation.x += 0.002;
    this.sphere.rotation.y += 0.003;

    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize() {
    const canvas = this.canvasRef.nativeElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    this.renderer.dispose();
  }
}
