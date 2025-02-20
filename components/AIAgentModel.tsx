'use client'
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

// Define types for our data structures
interface DataPoint extends THREE.Mesh {
    userData: {
        originalPos: THREE.Vector3;
        orbitSpeed: number;
        orbitRadius: number;
        orbitAxis: THREE.Vector3;
    };
}

interface Connection {
    line: THREE.Line;
    point1: DataPoint;
    point2: DataPoint | THREE.Mesh;
    update: () => void;
}

const AIAgentModel = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!containerRef.current) return;

        // Get container dimensions
        const container = containerRef.current;
        const width = container.clientWidth;
        const height = container.clientHeight;

        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
        camera.position.z = 5;

        // Renderer
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // Create AI Core (sphere with glowing effect)
        const coreGeometry = new THREE.SphereGeometry(1, 32, 32);
        const coreMaterial = new THREE.MeshBasicMaterial({
            color: 0x4b6bff,
            transparent: true,
            opacity: 0.8
        });
        const core = new THREE.Mesh(coreGeometry, coreMaterial);
        scene.add(core);

        // Outer glow
        const glowGeometry = new THREE.SphereGeometry(1.2, 32, 32);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x7b5cff,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        scene.add(glow);

        // Create data points orbiting around
        const dataPoints: DataPoint[] = [];
        const createDataPoint = (radius: number, color: number): DataPoint => {
            const geometry = new THREE.SphereGeometry(0.08, 16, 16);
            const material = new THREE.MeshBasicMaterial({ color });
            const point = new THREE.Mesh(geometry, material);
            
            // Initialize userData before casting to DataPoint
            point.userData = {
                originalPos: new THREE.Vector3(),  // Will be set properly below
                orbitSpeed: 0.002 + Math.random() * 0.003,
                orbitRadius: radius,
                orbitAxis: new THREE.Vector3(
                    Math.random() - 0.5,
                    Math.random() - 0.5,
                    Math.random() - 0.5
                ).normalize()
            };

            // Random position on a sphere
            const phi = Math.acos(-1 + Math.random() * 2);
            const theta = Math.random() * Math.PI * 2;

            point.position.x = radius * Math.sin(phi) * Math.cos(theta);
            point.position.y = radius * Math.sin(phi) * Math.sin(theta);
            point.position.z = radius * Math.cos(phi);

            // Now set the originalPos after position is set
            point.userData.originalPos = point.position.clone();
            scene.add(point);
            return point as unknown as DataPoint;
        };

        // Create orbital rings
        const createRing = (radius: number, color: number, opacity: number) => {
            const geometry = new THREE.RingGeometry(radius - 0.02, radius + 0.02, 64);
            const material = new THREE.MeshBasicMaterial({
                color,
                transparent: true,
                opacity,
                side: THREE.DoubleSide
            });
            const ring = new THREE.Mesh(geometry, material);

            // Tilt the ring slightly for visual interest
            ring.rotation.x = Math.PI / 2 + Math.random() * 0.4;
            ring.rotation.y = Math.random() * 0.4;

            scene.add(ring);
            return ring;
        };

        // Create data connections
        const createConnection = (point1: DataPoint, point2: DataPoint | THREE.Mesh): Connection => {
            const material = new THREE.LineBasicMaterial({
                color: 0x4b6bff,
                transparent: true,
                opacity: 0.3
            });

            const geometry = new THREE.BufferGeometry().setFromPoints([
                point1.position,
                point2.position
            ]);

            const line = new THREE.Line(geometry, material);
            scene.add(line);

            return {
                line,
                point1,
                point2,
                update: () => {
                    const positions = line.geometry.attributes.position;
                    if (!positions) return;

                    const posArray = positions.array as Float32Array;
                    posArray[0] = point1.position.x;
                    posArray[1] = point1.position.y;
                    posArray[2] = point1.position.z;
                    posArray[3] = point2.position.x;
                    posArray[4] = point2.position.y;
                    posArray[5] = point2.position.z;

                    positions.needsUpdate = true;
                }
            };
        };

        // Create orbital rings
        const rings = [
            createRing(1.8, 0x3b82f6, 0.3),
            createRing(2.2, 0x8b5cf6, 0.2),
            createRing(2.6, 0x6366f1, 0.1)
        ];

        // Create data points
        const pointCount = 20;
        for (let i = 0; i < pointCount; i++) {
            // Alternating colors between blue and purple
            const color = i % 2 === 0 ? 0x3b82f6 : 0xa78bfa;
            const radius = 1.9 + Math.random() * 0.8;
            dataPoints.push(createDataPoint(radius, color));
        }

        // Create connections between some points
        const connections: Connection[] = [];
        const connectionCount = 15;

        for (let i = 0; i < connectionCount; i++) {
            const point1Index = Math.floor(Math.random() * dataPoints.length);
            const point2Index = Math.floor(Math.random() * dataPoints.length);
            
            if (point1Index !== point2Index && dataPoints[point1Index] && dataPoints[point2Index]) {
                connections.push(createConnection(dataPoints[point1Index], dataPoints[point2Index]));
            }
        }

        // Connect some points to the core
        for (let i = 0; i < 8; i++) {
            const pointIndex = Math.floor(Math.random() * dataPoints.length);
            const point = dataPoints[pointIndex];
            
            if (point) {
                connections.push(createConnection(point, core));
            }
        }

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);

        // Animation
        const clock = new THREE.Clock();

        const animate = () => {
            const frameId = requestAnimationFrame(animate);
            animationRef.current = frameId;
            const elapsedTime = clock.getElapsedTime();

            // Rotate core slowly
            core.rotation.y = elapsedTime * 0.1;
            glow.rotation.y = elapsedTime * 0.05;

            // Rotate rings
            rings.forEach((ring, i) => {
                ring.rotation.z = elapsedTime * (0.05 + i * 0.01);
            });

            // Animate data points
            dataPoints.forEach(point => {
                const userData = point.userData;

                // Create orbital movement
                const axis = userData.orbitAxis;
                const speed = userData.orbitSpeed;

                // Rotate around the axis
                const quaternion = new THREE.Quaternion();
                quaternion.setFromAxisAngle(axis, speed);

                // Apply rotation to position
                const position = new THREE.Vector3().copy(point.position);
                position.applyQuaternion(quaternion);
                point.position.copy(position);

                // Pulsing effect
                const scaleFactor = 1 + Math.sin(elapsedTime * 2 + point.position.x) * 0.1;
                point.scale.set(scaleFactor, scaleFactor, scaleFactor);
            });

            // Update connections
            connections.forEach(connection => connection.update());

            // Render
            renderer.render(scene, camera);

            // Once first frame is rendered, remove loading state
            if (isLoading) setIsLoading(false);
        };

        // Start animation
        animate();

        // Handle window resize
        const handleResize = () => {
            const width = container.clientWidth;
            const height = container.clientHeight;

            camera.aspect = width / height;
            camera.updateProjectionMatrix();

            renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);

        // Cleanup function
        return () => {
            window.removeEventListener('resize', handleResize);

            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }

            // Dispose of Three.js resources
            scene.traverse((object: THREE.Object3D) => {
                const obj = object as THREE.Mesh;
                if (obj.geometry) {
                    obj.geometry.dispose();
                }
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach((material: THREE.Material) => material.dispose());
                    } else {
                        obj.material.dispose();
                    }
                }
            });

            if (renderer) {
                renderer.dispose();
                if (renderer.domElement && container.contains(renderer.domElement)) {
                    container.removeChild(renderer.domElement);
                }
            }
        };
    }, [isLoading]);

    return (
        <div className="relative w-full h-full" >
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-10" >
                    <div className="text-blue-400" > Loading visualization...</div>
                </div>
            )}
            <div
                ref={containerRef}
                className="w-full h-full"
                style={{
                    minHeight: '400px',
                    position: 'relative'
                }}
            />
        </div>
    );
};

export default AIAgentModel;