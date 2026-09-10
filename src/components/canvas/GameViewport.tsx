"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useGameStore } from "@/store/useGameStore";
import { LENA_WEAPONS } from "@/lib/constants/weapons";
import {
  ARENA_OBSTACLES,
  ARENA_BOUNDS,
  JUMP_PADS,
  checkObstacleCollision,
} from "@/lib/game/arenaMap";
import { BotController, BotState } from "@/lib/game/botController";
import { lenaAudio } from "@/lib/audio/soundEngine";

interface Projectile {
  id: string;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  isPlayer: boolean;
  damage: number;
  splashRadius: number;
  color: string;
  mesh: THREE.Mesh;
}

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  maxLife: number;
  color: THREE.Color;
  size: number;
}

export default function GameViewport() {
  const containerRef = useRef<HTMLDivElement>(null);

  // Zustand Store
  const {
    matchStatus,
    currentTier,
    currentWeapon,
    health,
    ammo,
    isReloading,
    settings,
    botCount,
    difficulty,
    fireShot,
    takeDamage,
    registerHit,
    recordKill,
    recordBotKill,
    tickGameTime,
    pauseMatch,
  } = useGameStore();

  // Internal mutable game state refs
  const stateRef = useRef({
    matchStatus,
    currentTier,
    currentWeapon,
    health,
    ammo,
    isReloading,
    settings,
    difficulty,
  });

  useEffect(() => {
    stateRef.current = {
      matchStatus,
      currentTier,
      currentWeapon,
      health,
      ammo,
      isReloading,
      settings,
      difficulty,
    };
  }, [matchStatus, currentTier, currentWeapon, health, ammo, isReloading, settings, difficulty]);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- THREE.JS INITIALIZATION ---
    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#05070B");
    scene.fog = new THREE.FogExp2("#05070B", 0.015);

    const camera = new THREE.PerspectiveCamera(
      settings.fov || 75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 2.0, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0x0c1424, 1.2);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 0.8);
    mainLight.position.set(20, 40, 20);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 1024;
    mainLight.shadow.mapSize.height = 1024;
    scene.add(mainLight);

    // Blue & Red Cyber Point Lights
    const blueLight = new THREE.PointLight(0x00e5ff, 3.5, 60);
    blueLight.position.set(-20, 8, -20);
    scene.add(blueLight);

    const redLight = new THREE.PointLight(0xff0055, 3.5, 60);
    redLight.position.set(20, 8, 20);
    scene.add(redLight);

    // --- ARENA ENVIRONMENT BUILDING ---
    // Floor Grid
    const floorGeo = new THREE.PlaneGeometry(100, 100, 40, 40);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x080c14,
      roughness: 0.65,
      metalness: 0.4,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(100, 50, 0x00e5ff, 0x1e293b);
    gridHelper.position.y = 0.02;
    scene.add(gridHelper);

    // Build Arena Obstacles & Neon Borders
    const obstacleMeshes: THREE.Mesh[] = [];
    ARENA_OBSTACLES.forEach((obs) => {
      const geo = new THREE.BoxGeometry(obs.size[0], obs.size[1], obs.size[2]);
      const mat = new THREE.MeshStandardMaterial({
        color: 0x111622,
        roughness: 0.4,
        metalness: 0.8,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(obs.position[0], obs.position[1], obs.position[2]);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
      obstacleMeshes.push(mesh);

      // Neon Edges
      if (obs.glow) {
        const edgeGeo = new THREE.EdgesGeometry(geo);
        const edgeMat = new THREE.LineBasicMaterial({
          color: obs.color === "#FF0055" ? 0xff0055 : 0x00e5ff,
          linewidth: 2,
        });
        const edge = new THREE.LineSegments(edgeGeo, edgeMat);
        edge.position.copy(mesh.position);
        scene.add(edge);
      }
    });

    // Jump Pads
    const jumpPadMeshes: THREE.Mesh[] = [];
    JUMP_PADS.forEach((jp) => {
      const padGeo = new THREE.CylinderGeometry(jp.radius, jp.radius + 0.3, 0.2, 24);
      const padMat = new THREE.MeshStandardMaterial({
        color: 0x00e5ff,
        emissive: 0x00e5ff,
        emissiveIntensity: 0.8,
        metalness: 0.9,
      });
      const pad = new THREE.Mesh(padGeo, padMat);
      pad.position.set(jp.position[0], jp.position[1], jp.position[2]);
      scene.add(pad);
      jumpPadMeshes.push(pad);
    });

    // --- WEAPON VIEW-MODEL RIGGING ---
    const weaponHolder = new THREE.Group();
    camera.add(weaponHolder);
    scene.add(camera);

    let weaponMeshGroup: THREE.Group = new THREE.Group();
    weaponHolder.add(weaponMeshGroup);

    const buildWeaponMesh = (tier: number) => {
      while (weaponMeshGroup.children.length > 0) {
        weaponMeshGroup.remove(weaponMeshGroup.children[0]);
      }

      const currentWp = LENA_WEAPONS[tier - 1] || LENA_WEAPONS[0];
      const isRed = currentWp.color === "#FF0055";
      const primaryHex = isRed ? 0xff0055 : 0x00e5ff;

      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x151821,
        metalness: 0.9,
        roughness: 0.2,
      });
      const glowMat = new THREE.MeshBasicMaterial({ color: primaryHex });

      if (currentWp.category === "melee") {
        // Neon Katana
        const bladeGeo = new THREE.BoxGeometry(0.04, 0.95, 0.08);
        const blade = new THREE.Mesh(bladeGeo, glowMat);
        blade.position.set(0.28, -0.1, -0.6);
        blade.rotation.set(0.4, 0.2, -0.5);

        const hiltGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.35, 12);
        const hilt = new THREE.Mesh(hiltGeo, bodyMat);
        hilt.position.set(0.28, -0.55, -0.4);
        hilt.rotation.x = Math.PI / 4;

        weaponMeshGroup.add(blade);
        weaponMeshGroup.add(hilt);
      } else if (currentWp.category === "dual") {
        // Dual Blasters
        [-0.25, 0.25].forEach((offset) => {
          const gunGroup = new THREE.Group();
          const mainBody = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.14, 0.36), bodyMat);
          const neonStripe = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.02, 0.34), glowMat);
          neonStripe.position.y = 0.06;
          const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.12, 12), glowMat);
          barrel.rotation.x = Math.PI / 2;
          barrel.position.set(0, 0.03, -0.22);

          gunGroup.add(mainBody);
          gunGroup.add(neonStripe);
          gunGroup.add(barrel);
          gunGroup.position.set(offset, -0.25, -0.55);
          weaponMeshGroup.add(gunGroup);
        });
      } else {
        // Standard Gun Form (Pistol, SMG, AR, Shotgun, Sniper, Launcher)
        const isSniper = currentWp.category === "sniper";
        const isShotgun = currentWp.category === "shotgun";
        const isLauncher = currentWp.category === "launcher";

        const length = isSniper ? 0.75 : isLauncher ? 0.65 : isShotgun ? 0.55 : 0.42;
        const width = isLauncher ? 0.2 : 0.1;
        const height = isLauncher ? 0.2 : 0.16;

        const mainBody = new THREE.Mesh(new THREE.BoxGeometry(width, height, length), bodyMat);
        mainBody.position.set(0.26, -0.24, -0.6);

        const stripe = new THREE.Mesh(new THREE.BoxGeometry(width + 0.01, 0.025, length * 0.8), glowMat);
        stripe.position.set(0.26, -0.24 + height / 2, -0.6);

        const barrel = new THREE.Mesh(
          new THREE.CylinderGeometry(width * 0.28, width * 0.28, length * 0.4, 16),
          glowMat
        );
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0.26, -0.22, -0.6 - length / 2);

        weaponMeshGroup.add(mainBody);
        weaponMeshGroup.add(stripe);
        weaponMeshGroup.add(barrel);

        if (isSniper) {
          // Scope mesh
          const scope = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.32, 16), bodyMat);
          scope.rotation.x = Math.PI / 2;
          scope.position.set(0.26, -0.12, -0.6);
          weaponMeshGroup.add(scope);
        }
      }
    };

    buildWeaponMesh(currentTier);

    // --- BOT CONTROLLER & 3D BOT MESHES ---
    const botController = new BotController(botCount);
    const botMeshMap = new Map<string, THREE.Group>();

    const createBotMesh = (bot: BotState) => {
      const group = new THREE.Group();
      const isRed = bot.team === "red";
      const teamColor = isRed ? 0xff0055 : 0x00e5ff;

      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x11141c,
        metalness: 0.8,
        roughness: 0.3,
      });
      const teamMat = new THREE.MeshBasicMaterial({ color: teamColor });

      // Torso
      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.9, 1.3, 0.6), bodyMat);
      torso.position.y = 1.65;
      group.add(torso);

      // Neon Armor Core
      const core = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.65), teamMat);
      core.position.y = 1.7;
      group.add(core);

      // Head
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), bodyMat);
      head.position.y = 2.65;
      group.add(head);

      // Visor
      const visor = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.16, 0.25), teamMat);
      visor.position.set(0, 2.65, 0.25);
      group.add(visor);

      // Legs
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.35), bodyMat);
      legL.position.set(-0.25, 0.5, 0);
      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.0, 0.35), bodyMat);
      legR.position.set(0.25, 0.5, 0);
      group.add(legL);
      group.add(legR);

      // Floating Health Bar
      const hpBg = new THREE.Mesh(
        new THREE.PlaneGeometry(1.2, 0.12),
        new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide })
      );
      hpBg.position.set(0, 3.2, 0);
      const hpFill = new THREE.Mesh(
        new THREE.PlaneGeometry(1.15, 0.08),
        new THREE.MeshBasicMaterial({ color: teamColor, side: THREE.DoubleSide })
      );
      hpFill.position.set(0, 3.2, 0.01);
      group.add(hpBg);
      group.add(hpFill);

      group.position.copy(bot.position);
      scene.add(group);
      botMeshMap.set(bot.id, group);
    };

    botController.bots.forEach(createBotMesh);

    // --- PARTICLES & PROJECTILES ---
    const projectiles: Projectile[] = [];
    const particles: Particle[] = [];
    const particleGeo = new THREE.BufferGeometry();
    const maxParticles = 600;
    const particlePositions = new Float32Array(maxParticles * 3);
    const particleColors = new Float32Array(maxParticles * 3);
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(particleColors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.18,
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    const spawnSparks = (pos: THREE.Vector3, colorHex: number, count: number = 15) => {
      const col = new THREE.Color(colorHex);
      for (let i = 0; i < count; i++) {
        if (particles.length >= maxParticles) particles.shift();
        particles.push({
          position: pos.clone(),
          velocity: new THREE.Vector3(
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.2) * 8,
            (Math.random() - 0.5) * 8
          ),
          life: 0,
          maxLife: 0.3 + Math.random() * 0.4,
          color: col,
          size: 0.15,
        });
      }
    };

    // --- PLAYER CONTROLS & PHYSICS STATE ---
    const keys = { w: false, a: false, s: false, d: false, shift: false, space: false };
    const playerVelocity = new THREE.Vector3();
    let isGrounded = true;
    let cameraPitch = 0;
    let cameraYaw = 0;
    let isPointerLocked = false;
    let lastShotTimestamp = 0;
    let recoilOffset = 0;
    let bobTime = 0;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === "KeyW") keys.w = true;
      if (e.code === "KeyA") keys.a = true;
      if (e.code === "KeyS") keys.s = true;
      if (e.code === "KeyD") keys.d = true;
      if (e.code === "ShiftLeft") keys.shift = true;
      if (e.code === "Space" && isGrounded) {
        playerVelocity.y = 11;
        isGrounded = false;
        lenaAudio.playJump();
      }
      if (e.code === "KeyR") {
        useGameStore.getState().reloadWeapon();
      }
      if (e.code === "Escape") {
        document.exitPointerLock();
        pauseMatch();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "KeyW") keys.w = false;
      if (e.code === "KeyA") keys.a = false;
      if (e.code === "KeyS") keys.s = false;
      if (e.code === "KeyD") keys.d = false;
      if (e.code === "ShiftLeft") keys.shift = false;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isPointerLocked || stateRef.current.matchStatus !== "playing") return;
      const sens = (stateRef.current.settings.sensitivity || 1.5) * 0.002;
      cameraYaw -= e.movementX * sens;
      cameraPitch -= e.movementY * sens;
      cameraPitch = Math.max(-Math.PI / 2.1, Math.min(Math.PI / 2.1, cameraPitch));
    };

    const performPlayerShoot = () => {
      if (stateRef.current.matchStatus !== "playing") return;
      const curWp = stateRef.current.currentWeapon;
      const now = Date.now();
      if (now - lastShotTimestamp < curWp.fireRate) return;

      const fired = fireShot();
      if (!fired) return;

      lastShotTimestamp = now;
      recoilOffset = curWp.recoil.pitch;

      const raycaster = new THREE.Raycaster();
      const shootDir = new THREE.Vector3();
      camera.getWorldDirection(shootDir);

      if (curWp.isHitscan) {
        // Hitscan Raycast
        const pellets = curWp.pellets || 1;
        for (let p = 0; p < pellets; p++) {
          const spread = curWp.spread;
          const spreadDir = shootDir.clone().add(
            new THREE.Vector3(
              (Math.random() - 0.5) * spread,
              (Math.random() - 0.5) * spread,
              (Math.random() - 0.5) * spread
            )
          ).normalize();

          raycaster.set(camera.position, spreadDir);

          // Check hit on bots
          let closestHitDist = 200;
          let hitBotId: string | null = null;
          let hitHead = false;

          for (const bot of botController.bots) {
            if (bot.isDead) continue;
            const botDist = camera.position.distanceTo(bot.position);
            if (botDist < closestHitDist) {
              const headPos = bot.position.clone().add(new THREE.Vector3(0, 2.65, 0));
              const bodyPos = bot.position.clone().add(new THREE.Vector3(0, 1.65, 0));

              // Bounding sphere checks
              const headHit = raycaster.ray.distanceToPoint(headPos) < 0.45;
              const bodyHit = raycaster.ray.distanceToPoint(bodyPos) < 0.85;

              if (headHit || bodyHit) {
                closestHitDist = botDist;
                hitBotId = bot.id;
                hitHead = headHit;
              }
            }
          }

          if (hitBotId) {
            const finalDamage = hitHead ? curWp.damage * curWp.headshotMultiplier : curWp.damage;
            registerHit(hitHead);
            const { died, bot } = botController.damageBot(
              hitBotId,
              finalDamage,
              hitHead,
              true,
              "LENA_PLAYER"
            );

            if (died && bot) {
              recordKill(bot.name, hitHead);
            }

            spawnSparks(
              camera.position.clone().addScaledVector(spreadDir, closestHitDist),
              0x00e5ff,
              20
            );
          } else {
            // Check wall collision
            const intersects = raycaster.intersectObjects(obstacleMeshes);
            if (intersects.length > 0) {
              spawnSparks(intersects[0].point, 0x00e5ff, 12);
            }
          }
        }
      } else {
        // Projectile Weapon (Plasma / Micro-Launcher)
        const projGeo = new THREE.SphereGeometry(curWp.category === "launcher" ? 0.35 : 0.25, 12, 12);
        const projMat = new THREE.MeshBasicMaterial({
          color: curWp.color === "#FF0055" ? 0xff0055 : 0x00e5ff,
        });
        const projMesh = new THREE.Mesh(projGeo, projMat);
        projMesh.position.copy(camera.position);
        scene.add(projMesh);

        projectiles.push({
          id: Math.random().toString(),
          position: camera.position.clone(),
          velocity: shootDir.clone().multiplyScalar(curWp.bulletSpeed),
          isPlayer: true,
          damage: curWp.damage,
          splashRadius: curWp.splashRadius,
          color: curWp.color,
          mesh: projMesh,
        });
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        if (!isPointerLocked && stateRef.current.matchStatus === "playing") {
          container.requestPointerLock();
        } else {
          performPlayerShoot();
        }
      }
    };

    const onPointerLockChange = () => {
      isPointerLocked = document.pointerLockElement === container;
    };

    container.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("pointerlockchange", onPointerLockChange);

    // --- GAME LOOP ---
    let animationFrameId: number;
    let lastTime = performance.now();

    const gameLoop = (now: number) => {
      animationFrameId = requestAnimationFrame(gameLoop);
      const delta = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      if (stateRef.current.matchStatus === "playing") {
        tickGameTime(delta);

        // Update Weapon mesh if tier changed
        if (stateRef.current.currentTier !== currentTier) {
          buildWeaponMesh(stateRef.current.currentTier);
        }

        // Automatic Firing
        if (stateRef.current.currentWeapon.isAutomatic && keys.w && false) {
          // handled on mouse hold if needed
        }

        // Player Movement Calculation
        const speed = keys.shift ? 14 : 9;
        const moveVector = new THREE.Vector3();

        if (keys.w) moveVector.z -= 1;
        if (keys.s) moveVector.z += 1;
        if (keys.a) moveVector.x -= 1;
        if (keys.d) moveVector.x += 1;
        moveVector.normalize();

        // Rotate movement to match camera yaw
        moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);

        playerVelocity.x = moveVector.x * speed;
        playerVelocity.z = moveVector.z * speed;

        // Apply Gravity
        playerVelocity.y -= 28 * delta;

        // Apply Position & Collision
        const nextPos = camera.position.clone().addScaledVector(playerVelocity, delta);

        // Floor collision
        if (nextPos.y <= 2.0) {
          nextPos.y = 2.0;
          playerVelocity.y = 0;
          isGrounded = true;
        }

        // Jump pad trigger
        for (const jp of JUMP_PADS) {
          const padPos = new THREE.Vector3(jp.position[0], 0, jp.position[2]);
          if (nextPos.distanceTo(padPos) < jp.radius && nextPos.y <= 2.2) {
            playerVelocity.y = jp.boost;
            isGrounded = false;
            lenaAudio.playJump();
            spawnSparks(nextPos, 0x00e5ff, 25);
          }
        }

        const col = checkObstacleCollision(nextPos, 0.9);
        if (!col.collided) {
          camera.position.copy(nextPos);
        } else {
          // Slide along collision normal
          playerVelocity.projectOnPlane(col.normal);
          camera.position.addScaledVector(playerVelocity, delta);
        }

        // Apply Camera Rotation
        camera.rotation.set(0, 0, 0);
        camera.rotation.y = cameraYaw;
        camera.rotation.x = cameraPitch + recoilOffset;

        // Decay recoil
        recoilOffset = THREE.MathUtils.lerp(recoilOffset, 0, delta * 12);

        // Weapon Bobbing
        if (moveVector.length() > 0 && isGrounded) {
          bobTime += delta * 10;
          weaponHolder.position.x = Math.sin(bobTime) * 0.02;
          weaponHolder.position.y = Math.cos(bobTime * 2) * 0.015;
        } else {
          weaponHolder.position.lerp(new THREE.Vector3(0, 0, 0), delta * 8);
        }

        // --- UPDATE AI BOTS ---
        botController.update(
          delta,
          camera.position,
          stateRef.current.health > 0,
          stateRef.current.difficulty,
          (bot, targetPos, isPlayerTarget) => {
            // Bot Shoot Event
            const shootDir = new THREE.Vector3().subVectors(targetPos, bot.position).normalize();
            if (bot.currentWeapon.isHitscan) {
              if (isPlayerTarget && Math.random() < 0.65) {
                takeDamage(bot.currentWeapon.damage);
                lenaAudio.playPistol();
              }
              spawnSparks(targetPos, 0xff0055, 10);
            } else {
              // Projectile
              const projGeo = new THREE.SphereGeometry(0.25, 8, 8);
              const projMat = new THREE.MeshBasicMaterial({ color: 0xff0055 });
              const projMesh = new THREE.Mesh(projGeo, projMat);
              projMesh.position.copy(bot.position).add(new THREE.Vector3(0, 1.6, 0));
              scene.add(projMesh);

              projectiles.push({
                id: Math.random().toString(),
                position: projMesh.position.clone(),
                velocity: shootDir.multiplyScalar(bot.currentWeapon.bulletSpeed || 40),
                isPlayer: false,
                damage: bot.currentWeapon.damage,
                splashRadius: bot.currentWeapon.splashRadius,
                color: "#FF0055",
                mesh: projMesh,
              });
            }
          },
          (killer, victim, wpName, headshot) => {
            recordBotKill(killer, victim, wpName, headshot);
          }
        );

        // Update Bot 3D Meshes
        botController.bots.forEach((bot) => {
          const mesh = botMeshMap.get(bot.id);
          if (mesh) {
            mesh.visible = !bot.isDead;
            mesh.position.copy(bot.position);
            mesh.rotation.y = bot.rotationY;

            // Update health fill bar scaling
            const hpRatio = Math.max(0, bot.health / bot.maxHealth);
            const hpFillMesh = mesh.children[5] as THREE.Mesh;
            if (hpFillMesh) {
              hpFillMesh.scale.x = hpRatio;
            }
          }
        });

        // --- UPDATE PROJECTILES ---
        for (let i = projectiles.length - 1; i >= 0; i--) {
          const p = projectiles[i];
          p.position.addScaledVector(p.velocity, delta);
          p.mesh.position.copy(p.position);

          let hit = false;

          // Check hit on player
          if (!p.isPlayer && p.position.distanceTo(camera.position) < 1.5) {
            takeDamage(p.damage);
            hit = true;
          }

          // Check hit on bots
          if (p.isPlayer) {
            for (const bot of botController.bots) {
              if (bot.isDead) continue;
              if (p.position.distanceTo(bot.position) < 2.0) {
                const { died } = botController.damageBot(bot.id, p.damage, false, true, "LENA_PLAYER");
                if (died) recordKill(bot.name, false);
                registerHit(false);
                hit = true;
                break;
              }
            }
          }

          // Check obstacle collision
          const colCheck = checkObstacleCollision(p.position, 0.4);
          if (colCheck.collided || p.position.y <= 0.2 || hit) {
            spawnSparks(p.position, p.color === "#FF0055" ? 0xff0055 : 0x00e5ff, 35);
            scene.remove(p.mesh);
            projectiles.splice(i, 1);
          }
        }

        // --- UPDATE PARTICLES ---
        for (let i = particles.length - 1; i >= 0; i--) {
          const pt = particles[i];
          pt.life += delta;
          if (pt.life >= pt.maxLife) {
            particles.splice(i, 1);
            continue;
          }
          pt.position.addScaledVector(pt.velocity, delta);
        }

        // Update particle buffer
        for (let i = 0; i < maxParticles; i++) {
          if (i < particles.length) {
            const pt = particles[i];
            particlePositions[i * 3] = pt.position.x;
            particlePositions[i * 3 + 1] = pt.position.y;
            particlePositions[i * 3 + 2] = pt.position.z;

            particleColors[i * 3] = pt.color.r;
            particleColors[i * 3 + 1] = pt.color.g;
            particleColors[i * 3 + 2] = pt.color.b;
          } else {
            particlePositions[i * 3 + 1] = -999;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;
        particleGeo.attributes.color.needsUpdate = true;
      }

      renderer.render(scene, camera);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", onResize);
      container.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("pointerlockchange", onPointerLockChange);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [botCount]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full cursor-crosshair overflow-hidden select-none"
    />
  );
}
