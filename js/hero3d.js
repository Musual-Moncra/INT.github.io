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
    this.currentPreset = 'logo';
    
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
    this.cameraDistance = width <= 768 ? 5.5 : 6.2;
    this.camera.position.z = this.cameraDistance;

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
    const ambientLight = new THREE.AmbientLight(0xfff4d2, 0.75);
    this.scene.add(ambientLight);

    // Key directional light (cool white)
    this.keyLight = new THREE.DirectionalLight(0xfff0c1, 1.8);
    this.keyLight.position.set(5, 5, 6);
    this.scene.add(this.keyLight);

    // Cyan accent rim light
    this.rimLightCyan = new THREE.PointLight(0x2b9b60, 3.5, 15);
    this.rimLightCyan.position.set(-5, -2, 3);
    this.scene.add(this.rimLightCyan);

    // Soft Purple accent fill light
    this.rimLightPurple = new THREE.PointLight(0xe4aa37, 2.2, 15);
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
    this.switchPreset('logo', false);
  }

  loadLogoTexture() {
    const image = new Image();
    image.onload = () => {
      const size = 1024;
      const canvas = document.createElement('canvas');
      canvas.width = canvas.height = size;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      const cropSize = Math.min(image.naturalWidth, image.naturalHeight);
      // The source file has a wide white margin, so centering its square crop
      // centers the canvas instead of the emblem. Find the colored artwork
      // bounds first, then center the crop on the emblem itself.
      const sourceCanvas = document.createElement('canvas');
      sourceCanvas.width = image.naturalWidth;
      sourceCanvas.height = image.naturalHeight;
      const sourceContext = sourceCanvas.getContext('2d', { willReadFrequently: true });
      sourceContext.drawImage(image, 0, 0);
      const sourcePixels = sourceContext.getImageData(0, 0, image.naturalWidth, image.naturalHeight).data;
      let minX = image.naturalWidth;
      let maxX = -1;
      let minY = image.naturalHeight;
      let maxY = -1;
      for (let y = 0; y < image.naturalHeight; y++) {
        for (let x = 0; x < image.naturalWidth; x++) {
          const i = (y * image.naturalWidth + x) * 4;
          const r = sourcePixels[i];
          const g = sourcePixels[i + 1];
          const b = sourcePixels[i + 2];
          if (Math.min(r, g, b) >= 232 && Math.max(r, g, b) - Math.min(r, g, b) <= 28) continue;
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
      sourceCanvas.width = 0;
      const artworkCenterX = maxX >= minX ? (minX + maxX) / 2 : image.naturalWidth / 2;
      const artworkCenterY = maxY >= minY ? (minY + maxY) / 2 : image.naturalHeight / 2;
      const cropX = Math.max(0, Math.min(image.naturalWidth - cropSize, artworkCenterX - cropSize / 2));
      const cropY = Math.max(0, Math.min(image.naturalHeight - cropSize, artworkCenterY - cropSize / 2));
      // CircleGeometry uses direct planar UVs, so preserve the source artwork's
      // orientation. The old cylinder-cap UVs needed this quarter-turn.
      context.drawImage(image, cropX, cropY, cropSize, cropSize, 0, 0, size, size);

      // Remove only the white background connected to the image edges. White
      // lettering and illustration details inside the badge remain visible.
      const imageData = context.getImageData(0, 0, size, size);
      const pixels = imageData.data;
      const queue = new Int32Array(size * size);
      let queueStart = 0;
      let queueEnd = 0;
      const enqueueBackgroundPixel = (pixelIndex) => {
        const i = pixelIndex * 4;
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const brightest = Math.max(r, g, b);
        const darkest = Math.min(r, g, b);
        if (pixels[i + 3] === 0 || darkest < 232 || brightest - darkest > 28) return;
        pixels[i + 3] = 0;
        queue[queueEnd++] = pixelIndex;
      };

      for (let x = 0; x < size; x++) {
        enqueueBackgroundPixel(x);
        enqueueBackgroundPixel((size - 1) * size + x);
      }
      for (let y = 1; y < size - 1; y++) {
        enqueueBackgroundPixel(y * size);
        enqueueBackgroundPixel(y * size + size - 1);
      }

      while (queueStart < queueEnd) {
        const pixelIndex = queue[queueStart++];
        const x = pixelIndex % size;
        const y = (pixelIndex - x) / size;
        if (x > 0) enqueueBackgroundPixel(pixelIndex - 1);
        if (x < size - 1) enqueueBackgroundPixel(pixelIndex + 1);
        if (y > 0) enqueueBackgroundPixel(pixelIndex - size);
        if (y < size - 1) enqueueBackgroundPixel(pixelIndex + size);
      }
      context.putImageData(imageData, 0, 0);

      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      texture.anisotropy = Math.min(8, this.renderer.capabilities.getMaxAnisotropy());
      this.logoFaceMaterial.map = texture;
      this.logoFaceMaterial.needsUpdate = true;
    };
    image.src = 'assets/Logo%20final.png';
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
      color: 0xd9c68b,
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

    if (presetName === 'logo') {
      const side = new THREE.MeshStandardMaterial({ color: 0x075735, metalness: 0.82, roughness: 0.24 });
      this.logoFaceMaterial = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.34,
        metalness: 0.38,
        transparent: true,
        alphaTest: 0.04,
        side: THREE.DoubleSide,
        toneMapped: false,
        depthWrite: true
      });
      const badge = new THREE.Mesh(
        new THREE.CylinderGeometry(1.56, 1.56, 0.16, 96, 1, true),
        side
      );
      badge.rotation.x = Math.PI / 2;
      this.meshGroup.add(badge);

      // One double-sided logo face avoids registration drift between duplicated
      // front and back artwork while the medallion turns.
      const faceGeometry = new THREE.CircleGeometry(1.56, 96);
      const frontFace = new THREE.Mesh(faceGeometry, this.logoFaceMaterial);
      frontFace.position.z = 0.081;
      this.meshGroup.add(frontFace);

      const goldRim = new THREE.Mesh(
        new THREE.TorusGeometry(1.56, 0.035, 12, 120),
        new THREE.MeshStandardMaterial({ color: 0xe5a923, metalness: 0.9, roughness: 0.2 })
      );
      this.meshGroup.add(goldRim);
      this.loadLogoTexture();
    } else if (presetName === 'knot') {
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
      this.canvas.setPointerCapture?.(e.pointerId);
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
    window.addEventListener('pointercancel', () => {
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
  }

  onResize() {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;

    this.camera.aspect = width / height;
    this.cameraDistance = width <= 768 ? 5.5 : 6.2;
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

    // The badge makes a full, steady turn whenever the user is not dragging.
    if (!this.isDragging) this.meshGroup.rotation.y += 0.005;
    this.meshGroup.rotation.x = Math.sin(this.time * 0.35) * 0.07 + (this.mouse.y * 0.2);
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
    this.camera.position.z = this.cameraDistance + Math.sin(this.time * 0.7) * 0.08 - (this.scrollProgress * 1.5);

    this.renderer.render(this.scene, this.camera);
  }
}

// Global initialization helper
window.Hero3D = Hero3D;
