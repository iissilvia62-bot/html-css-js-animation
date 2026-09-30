// 1. Setup Dasar: Scene, Kamera, dan Renderer
const scene = new THREE.Scene();

// Kamera perspektif 3D
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 5000);
camera.position.set(0, 400, 800); // Posisi awal kamera (x, y, z)

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Kontrol agar pengguna bisa memutar dan melakukan zoom pada pemandangan
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; 
controls.dampingFactor = 0.05;

// 2. Pencahayaan
// Cahaya redup ke semua arah agar sisi gelap planet masih sedikit terlihat
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// Cahaya utama dari Matahari memancar ke segala arah
const pointLight = new THREE.PointLight(0xffffff, 2.5, 3000);
scene.add(pointLight);

// 3. Membuat Bintang (Galaksi Latar Belakang)
const starsGeometry = new THREE.BufferGeometry();
const starsCount = 3000;
const posArray = new Float32Array(starsCount * 3);

for (let i = 0; i < starsCount * 3; i++) {
    // Menyebarkan bintang secara acak dalam ruang 3D yang luas
    posArray[i] = (Math.random() - 0.5) * 4000;
}
starsGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
const starsMaterial = new THREE.PointsMaterial({
    size: 2,
    color: 0xffffff,
    transparent: true,
    opacity: 0.8
});
const starMesh = new THREE.Points(starsGeometry, starsMaterial);
scene.add(starMesh);

// 4. Membuat Matahari
const sunGeometry = new THREE.SphereGeometry(35, 32, 32);
// Menggunakan MeshBasicMaterial agar matahari selalu terang dan tidak butuh cahaya lain
const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffcc00 });
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
scene.add(sun);

// 5. Data Planet
const planetsData = [
    { name: "Merkurius", color: 0x8c8c8c, radius: 4, distance: 70, speed: 0.02 },
    { name: "Venus", color: 0xe3bb76, radius: 7, distance: 110, speed: 0.015 },
    { name: "Bumi", color: 0x4b90e2, radius: 8, distance: 160, speed: 0.01 },
    { name: "Mars", color: 0xe27b4b, radius: 6, distance: 210, speed: 0.008 },
    { name: "Jupiter", color: 0xc88b3a, radius: 18, distance: 290, speed: 0.005 },
    { name: "Saturnus", color: 0xf2d299, radius: 14, distance: 380, speed: 0.003, hasRings: true },
    { name: "Uranus", color: 0x74d3e8, radius: 10, distance: 450, speed: 0.002 },
    { name: "Neptunus", color: 0x4276d4, radius: 9, distance: 520, speed: 0.0015 }
];

const planets = [];

// Membuat Planet dan Garis Orbit
planetsData.forEach(data => {
    // Objek induk untuk mempermudah rotasi mengelilingi matahari
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    // Membuat Garis Orbit
    const orbitPathGeom = new THREE.BufferGeometry();
    const orbitPathPoints = [];
    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        orbitPathPoints.push(new THREE.Vector3(Math.cos(angle) * data.distance, 0, Math.sin(angle) * data.distance));
    }
    orbitPathGeom.setFromPoints(orbitPathPoints);
    const orbitPathMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
    const orbitLine = new THREE.Line(orbitPathGeom, orbitPathMat);
    scene.add(orbitLine);

    // Membuat Planet
    const planetGeom = new THREE.SphereGeometry(data.radius, 32, 32);
    // MeshStandardMaterial bereaksi terhadap pencahayaan (satu sisi terang, sisi lain gelap)
    const planetMat = new THREE.MeshStandardMaterial({ color: data.color, roughness: 0.8, metalness: 0.2 });
    const planet = new THREE.Mesh(planetGeom, planetMat);
    
    planet.position.x = data.distance; // Posisikan berdasarkan jarak orbit

    // Tambahkan cincin jika itu Saturnus
    if (data.hasRings) {
        const ringGeom = new THREE.RingGeometry(data.radius + 3, data.radius + 12, 32);
        const ringMat = new THREE.MeshStandardMaterial({ 
            color: 0xe3bb76, 
            side: THREE.DoubleSide, 
            transparent: true, 
            opacity: 0.7 
        });
        const ring = new THREE.Mesh(ringGeom, ringMat);
        ring.rotation.x = Math.PI / 2; // Baringkan cincinnya
        planet.add(ring);
    }

    orbitGroup.add(planet);

    // Memberikan sudut awal rotasi acak
    orbitGroup.rotation.y = Math.random() * Math.PI * 2;

    // Simpan referensi untuk dianimasikan
    planets.push({
        group: orbitGroup,
        mesh: planet,
        speed: data.speed
    });
});

// Menyesuaikan ukuran saat jendela diperbesar/diperkecil
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// 6. Loop Animasi
function animate() {
    requestAnimationFrame(animate);

    // Memutar bintang secara perlahan
    starMesh.rotation.y += 0.0002;

    // Menggerakkan setiap planet
    planets.forEach(p => {
        // Rotasi mengelilingi matahari (orbit)
        p.group.rotation.y += p.speed;
        
        // Rotasi planet pada sumbunya sendiri
        p.mesh.rotation.y += 0.01;
    });

    controls.update(); // Update orbit controls (untuk damping)
    renderer.render(scene, camera);
}

// Memulai animasi
animate();
