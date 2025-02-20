'use client'
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const HeroAnimation = () => {
    const canvasRef = useRef(null);
    const animationRef = useRef<number | null>(null);

    useEffect(() => {
        // Initialize Three.js scene
        const canvas = canvasRef.current;
        if (!canvas) return;

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: true,
        });

        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Camera position
        camera.position.z = 30;

        // Create particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 2000;

        const posArray = new Float32Array(particlesCount * 3);
        const colorArray = new Float32Array(particlesCount * 3);

        // Position and color for each particle
        for (let i = 0; i < particlesCount * 3; i += 3) {
            // Position (spread across a 3D space)
            posArray[i] = (Math.random() - 0.5) * 80;
            posArray[i + 1] = (Math.random() - 0.5) * 80;
            posArray[i + 2] = (Math.random() - 0.5) * 80;

            // Color (blue to purple gradient)
            const ratio = Math.random();
            colorArray[i] = 0.2 + ratio * 0.2; // r: 0.2-0.4 (minimal red for blue-purple)
            colorArray[i + 1] = 0.3 + ratio * 0.3; // g: 0.3-0.6 (some green for blue tones)
            colorArray[i + 2] = 0.8 - ratio * 0.2; // b: 0.6-0.8 (heavy blue)
        }

        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));

        // Particle material
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.08,
            transparent: true,
            opacity: 0.6,
            vertexColors: true,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });

        // Create particle system
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);

        // Add connection lines between particles
        const linesMaterial = new THREE.LineBasicMaterial({
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.1,
        });

        // Create lines between closest particles (simplified for performance)
        const connectParticles = () => {
            const positions = particlesGeometry.attributes.position?.array;
            if (!positions) return null;
            
            const lineGeometry = new THREE.BufferGeometry();
            const linePositions: number[] = [];

            // Connect some particles with lines (not all - that would be too many)
            const connectionCount = 300; // Limit connections for performance

            for (let i = 0; i < connectionCount; i++) {
                const idx1 = Math.floor(Math.random() * particlesCount) * 3;
                const idx2 = Math.floor(Math.random() * particlesCount) * 3;

                // Type assertion to ensure positions array access is safe
                const pos1x = positions[idx1] as number;
                const pos1y = positions[idx1 + 1] as number;
                const pos1z = positions[idx1 + 2] as number;
                const pos2x = positions[idx2] as number;
                const pos2y = positions[idx2 + 1] as number;
                const pos2z = positions[idx2 + 2] as number;

                // Add line vertices (from point a to point b)
                linePositions.push(
                    pos1x, pos1y, pos1z,
                    pos2x, pos2y, pos2z
                );
            }

            lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
            const lines = new THREE.LineSegments(lineGeometry, linesMaterial);
            scene.add(lines);

            return lines;
        };

        const lines = connectParticles();

        // Mouse interaction
        const mouse = {
            x: 0,
            y: 0,
        };

        function onMouseMove(event: MouseEvent) {
            // Normalized coordinates (-1 to +1)
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        }

        window.addEventListener('mousemove', onMouseMove);

        // Handle window resize
        function onWindowResize() {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        }

        window.addEventListener('resize', onWindowResize);

        // Animation
        const animate = () => {
            const frameId = requestAnimationFrame(animate);
            animationRef.current = frameId;

            // Rotate particle system slowly
            particlesMesh.rotation.x += 0.0003;
            particlesMesh.rotation.y += 0.0005;

            // Move particles subtly based on mouse position
            particlesMesh.position.x = mouse.x * 0.1;
            particlesMesh.position.y = mouse.y * 0.1;

            // Lines follow the particles - only if lines exist
            if (lines) {
                lines.rotation.x = particlesMesh.rotation.x;
                lines.rotation.y = particlesMesh.rotation.y;
                lines.position.x = particlesMesh.position.x;
                lines.position.y = particlesMesh.position.y;
            }

            // Render scene
            renderer.render(scene, camera);
        };

        animate();

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('resize', onWindowResize);

            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }

            // Dispose resources
            particlesGeometry.dispose();
            particlesMaterial.dispose();
            scene.remove(particlesMesh);
            if (lines) {
                scene.remove(lines);
            }
            renderer.dispose();
        };
    }, []);

    return <canvas ref={canvasRef} className="w-full h-full" />;
};

export default HeroAnimation;