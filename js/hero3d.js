/**
 * ===================================================================
 * 3D HERO WEBGL EXPERIENCE (Three.js)
 * Minimalist, Center Stage Interactive 3D Geometry
 * Supports Mouse Parallax, Drag-to-Rotate, Scroll Morph, and Presets
 * ===================================================================
 */

class Hero3D {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
      console.warn(`Hero3D: Canvas #${canvasId} not found`);
      return;
    }

    this.container = this.canvas.parentElement;
    this.currentPreset = 'knot'; // 'knot' | 'core' | 'poly'
    
    // Physics & Interaction variables
    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.isDragging = false;
    this.previousPointerPosition = { x: 0, y: 0 };
    this.rotationVelocity = { x: 0, y: 0 };
    this.scrollProgress = 0;
    this.time = 0;

    this.initScene();
    this.createLights();
    this.createObjects();
    this.createParticles();
    this.setupEventListeners();
    this.animate = this.animate.bind(this);
    this.animate();
  }

  initScene() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    this.camera.position.z = 6.2;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });

    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // Main 3D group container for lerp rotations
    this.mainGroup = new THREE.Group();
    this.scene.add(this.mainGroup);
  }

  createLights() {
    // Ambient light for base visibility
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // Key directional light (cool white)
    this.keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    this.keyLight.position.set(5, 5, 6);
    this.scene.add(this.keyLight);

    // Cyan accent rim light
    this.rimLightCyan = new THREE.PointLight(0x5eead4, 3.5, 15);
    this.rimLightCyan.position.set(-5, -2, 3);
    this.scene.add(this.rimLightCyan);

    // Soft Purple accent fill light
    this.rimLightPurple = new THREE.PointLight(0xc084fc, 3.0, 15);
    this.rimLightPurple.position.set(4, -4, -2);
    this.scene.add(this.rimLightPurple);
  }

  createObjects() {
    // Shared materials
    this.materials = {
      // Sleek semi-translucent frosted glass
      glass: new THREE.MeshPhysicalMaterial({
        color: 0x181824,
        roughness: 0.15,
        metalness: 0.25,
        transmission: 0.6,
        transparent: true,
        opacity: 0.85,
        reflectivity: 0.8,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2
      }),
      // Sleek luminescent wireframe
      wireframe: new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.28
      }),
      // Accent cyan wireframe
      wireframeAccent: new THREE.MeshBasicMaterial({
        color: 0x5eead4,
        wireframe: true,
        transparent: true,
        opacity: 0.45
      }),
      // Inner glowing core
      coreGlow: new THREE.MeshStandardMaterial({
        color: 0x5eead4,
        emissive: 0x14b8a6,
        emissiveIntensity: 0.6,
        roughness: 0.4,
        metalness: 0.1
      }),
      // Subtle orbit rings
      ringMat: new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
      })
    };

    // Active geometry mesh holder
    this.meshGroup = new THREE.Group();
    this.mainGroup.add(this.meshGroup);

    // Orbit Ring 1
    const ringGeo1 = new THREE.TorusGeometry(2.8, 0.012, 16, 120);
    this.ring1 = new THREE.Mesh(ringGeo1, this.materials.ringMat);
    this.ring1.rotation.x = Math.PI / 3;
    this.mainGroup.add(this.ring1);

    // Orbit Ring 2
    const ringGeo2 = new THREE.TorusGeometry(3.2, 0.008, 16, 120);
    this.ring2 = new THREE.Mesh(ringGeo2, this.materials.ringMat);
    this.ring2.rotation.y = Math.PI / 4;
    this.mainGroup.add(this.ring2);

    // Load initial geometry
    this.switchPreset('knot', false);
  }

  createParticles() {
    const particleCount = 280;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const scales = new Float32Array(particleCount);

    const radius = 3.8;
    for (let i = 0; i < particleCount; i++) {
      // Golden spiral distribution on sphere
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = radius * (0.6 + Math.random() * 0.5);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      scales[i] = Math.random() * 2 + 1;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const particleMat = new THREE.PointsMaterial({
      color: 0x9a9aa8,
      size: 0.035,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(geometry, particleMat);
    this.mainGroup.add(this.particles);
  }

  switchPreset(presetName, animate = true) {
    this.currentPreset = presetName;

    // Clear previous mesh group children
    while (this.meshGroup.children.length > 0) {
      const obj = this.meshGroup.children[0];
      this.meshGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
    }

    if (presetName === 'knot') {
      // Torus Knot with outer wireframe
      const knotGeo = new THREE.TorusKnotGeometry(1.4, 0.4, 128, 28, 2, 3);
      const solidMesh = new THREE.Mesh(knotGeo, this.materials.glass);
      const wireMesh = new THREE.Mesh(knotGeo, this.materials.wireframeAccent);
      wireMesh.scale.set(1.002, 1.002, 1.002);

      this.meshGroup.add(solidMesh);
      this.meshGroup.add(wireMesh);

    } else if (presetName === 'core') {
      // Multi-layer Icosahedron with inner pulsating core
      const innerGeo = new THREE.SphereGeometry(0.75, 32, 32);
      const innerMesh = new THREE.Mesh(innerGeo, this.materials.coreGlow);

      const midGeo = new THREE.IcosahedronGeometry(1.5, 1);
      const midMesh = new THREE.Mesh(midGeo, this.materials.glass);

      const outerGeo = new THREE.IcosahedronGeometry(1.85, 1);
      const outerMesh = new THREE.Mesh(outerGeo, this.materials.wireframe);

      this.meshGroup.add(innerMesh);
      this.meshGroup.add(midMesh);
      this.meshGroup.add(outerMesh);

    } else if (presetName === 'poly') {
      // Octahedron / Cyber Polyhedron
      const octGeo = new THREE.OctahedronGeometry(1.6, 2);
      const solidMesh = new THREE.Mesh(octGeo, this.materials.glass);
      const wireMesh = new THREE.Mesh(octGeo, this.materials.wireframe);
      wireMesh.scale.set(1.01, 1.01, 1.01);

      // Inner glowing octahedron
      const innerGeo = new THREE.OctahedronGeometry(0.9, 0);
      const innerMesh = new THREE.Mesh(innerGeo, this.materials.coreGlow);

      this.meshGroup.add(solidMesh);
      this.meshGroup.add(wireMesh);
      this.meshGroup.add(innerMesh);
    }

    if (animate && window.gsap) {
      this.meshGroup.scale.set(0.6, 0.6, 0.6);
      gsap.to(this.meshGroup.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 0.8,
        ease: 'elastic.out(1, 0.75)'
      });
    }
  }

  setupEventListeners() {
    // Resize handling
    window.addEventListener('resize', () => this.onResize());

    // Mouse movement parallax
    window.addEventListener('mousemove', (e) => {
      const halfW = window.innerWidth / 2;
      const halfH = window.innerHeight / 2;
      this.mouse.targetX = (e.clientX - halfW) / halfW;
      this.mouse.targetY = (e.clientY - halfH) / halfH;
    });

    // Drag to rotate on canvas
    this.canvas.addEventListener('pointerdown', (e) => {
      this.isDragging = true;
      this.previousPointerPosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointermove', (e) => {
      if (!this.isDragging) return;
      const deltaX = e.clientX - this.previousPointerPosition.x;
      const deltaY = e.clientY - this.previousPointerPosition.y;

      this.rotationVelocity.y += deltaX * 0.005;
      this.rotationVelocity.x += deltaY * 0.005;

      this.previousPointerPosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('pointerup', () => {
      this.isDragging = false;
    });

    // Preset selector buttons
    const presetButtons = document.querySelectorAll('[data-preset]');
    presetButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const preset = btn.getAttribute('data-preset');
        presetButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.switchPreset(preset, true);
      });
    });

    // Update HUD coordinate indicator
    this.coordElement = document.getElementById('hud-coords');
  }

  onResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  updateScroll(progress) {
    this.scrollProgress = progress;
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.time += 0.01;

    // Smooth mouse lerp
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Apply rotation velocity from dragging with damping
    this.mainGroup.rotation.y += this.rotationVelocity.y;
    this.mainGroup.rotation.x += this.rotationVelocity.x;
    this.rotationVelocity.x *= 0.92;
    this.rotationVelocity.y *= 0.92;

    // Base subtle idle rotation + parallax
    this.meshGroup.rotation.y += 0.006;
    this.meshGroup.rotation.x = Math.sin(this.time * 0.5) * 0.15 + (this.mouse.y * 0.35);
    this.meshGroup.rotation.z = Math.cos(this.time * 0.4) * 0.1;

    // Parallax on group position
    this.mainGroup.position.x = this.mouse.x * 0.25;
    this.mainGroup.position.y = -this.mouse.y * 0.25;

    // Revolving orbit rings
    if (this.ring1) {
      this.ring1.rotation.z += 0.004;
      this.ring1.rotation.y = Math.sin(this.time * 0.3) * 0.3 + 0.4;
    }
    if (this.ring2) {
      this.ring2.rotation.z -= 0.005;
      this.ring2.rotation.x = Math.cos(this.time * 0.25) * 0.3 + 0.5;
    }

    // Particle swirl
    if (this.particles) {
      this.particles.rotation.y += 0.002;
      this.particles.rotation.x = Math.sin(this.time * 0.2) * 0.1;
    }

    // Floating breathing effect on camera distance
    this.camera.position.z = 6.2 + Math.sin(this.time * 0.7) * 0.08 - (this.scrollProgress * 1.5);

    // Update Telemetry HUD if present
    if (this.coordElement && Math.random() < 0.2) {
      const rotX = (this.mainGroup.rotation.x % (Math.PI * 2)).toFixed(2);
      const rotY = (this.mainGroup.rotation.y % (Math.PI * 2)).toFixed(2);
      this.coordElement.textContent = `X: ${rotX} | Y: ${rotY} | Z: 1.00`;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Global initialization helper
window.Hero3D = Hero3D;
