"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { Weapon } from "@/lib/constants/weapons";

interface ArmoryInspectorProps {
  weapon: Weapon;
}

export default function ArmoryInspector({ weapon }: ArmoryInspectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    scene.background = null; // transparent

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.set(0, 0.4, 2.4);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambient);

    const blueSpot = new THREE.PointLight(0x00e5ff, 4.0, 10);
    blueSpot.position.set(-2, 2, 2);
    scene.add(blueSpot);

    const redSpot = new THREE.PointLight(0xff0055, 4.0, 10);
    redSpot.position.set(2, -1, 2);
    scene.add(redSpot);

    // Weapon 3D Rig
    const weaponGroup = new THREE.Group();
    scene.add(weaponGroup);

    const isRed = weapon.color === "#FF0055";
    const primaryHex = isRed ? 0xff0055 : 0x00e5ff;

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x181c26,
      metalness: 0.9,
      roughness: 0.2,
    });
    const glowMat = new THREE.MeshBasicMaterial({ color: primaryHex });

    if (weapon.category === "melee") {
      // Katana
      const bladeGeo = new THREE.BoxGeometry(0.04, 1.2, 0.08);
      const blade = new THREE.Mesh(bladeGeo, glowMat);
      blade.position.y = 0.2;

      const hiltGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.4, 16);
      const hilt = new THREE.Mesh(hiltGeo, bodyMat);
      hilt.position.y = -0.55;

      const guardGeo = new THREE.BoxGeometry(0.18, 0.03, 0.12);
      const guard = new THREE.Mesh(guardGeo, glowMat);
      guard.position.y = -0.35;

      weaponGroup.add(blade);
      weaponGroup.add(hilt);
      weaponGroup.add(guard);
      weaponGroup.rotation.z = -Math.PI / 4;
    } else if (weapon.category === "dual") {
      // Dual Pistols
      [-0.4, 0.4].forEach((xOff) => {
        const subG = new THREE.Group();
        const b = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.22, 0.6), bodyMat);
        const st = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.03, 0.55), glowMat);
        st.position.y = 0.09;
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.2, 16), glowMat);
        bar.rotation.x = Math.PI / 2;
        bar.position.set(0, 0.04, -0.35);

        subG.add(b);
        subG.add(st);
        subG.add(bar);
        subG.position.x = xOff;
        weaponGroup.add(subG);
      });
    } else {
      const isSniper = weapon.category === "sniper";
      const isLauncher = weapon.category === "launcher";
      const length = isSniper ? 1.4 : isLauncher ? 1.0 : 0.85;
      const width = isLauncher ? 0.3 : 0.16;
      const height = isLauncher ? 0.3 : 0.24;

      const mainBody = new THREE.Mesh(new THREE.BoxGeometry(width, height, length), bodyMat);
      const neonStripe = new THREE.Mesh(new THREE.BoxGeometry(width + 0.02, 0.03, length * 0.85), glowMat);
      neonStripe.position.y = height / 2;

      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(width * 0.3, width * 0.3, length * 0.4, 16),
        glowMat
      );
      barrel.rotation.x = Math.PI / 2;
      barrel.position.set(0, 0.02, -length * 0.6);

      weaponGroup.add(mainBody);
      weaponGroup.add(neonStripe);
      weaponGroup.add(barrel);

      if (isSniper) {
        const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.55, 16), bodyMat);
        scope.rotation.x = Math.PI / 2;
        scope.position.set(0, 0.2, 0);
        weaponGroup.add(scope);
      }
    }

    // Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      weaponGroup.rotation.y += 0.012;
      weaponGroup.position.y = Math.sin(Date.now() * 0.002) * 0.05;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [weapon]);

  return <div ref={containerRef} className="w-full h-full min-h-[320px]" />;
}
