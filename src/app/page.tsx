"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { useSpaceGameStore } from "@/store/useSpaceGameStore";
import SpaceshipHangar from "@/components/game/SpaceshipHangar";

const SpaceCombatGame = dynamic(() => import("@/components/game/SpaceCombatGame"), {
  ssr: false,
});

export default function Home() {
  const { gameState } = useSpaceGameStore();

  if (gameState === "hangar") {
    return <SpaceshipHangar />;
  }

  return <SpaceCombatGame />;
}
