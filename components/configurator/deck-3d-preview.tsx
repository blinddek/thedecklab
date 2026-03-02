"use client";

import { useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { Checkbox } from "@/components/ui/checkbox";
import { getBounds } from "@/lib/canvas/geometry";
import { getMaterial3DColours } from "@/lib/deck/material-colours";
import type { BoardLayoutResult, BoardPiece, DeckDesign } from "@/types/deck";

/* ─── Props ────────────────────────────────────────────── */

interface Props {
  readonly boardLayout: BoardLayoutResult;
  readonly design: DeckDesign;
  readonly materialSlug: string;
  readonly finishHex: string | null;
}

/* ─── Board Mesh (handles rotation) ────────────────────── */

function BoardMesh({
  board,
  yOffset,
  material,
}: {
  board: BoardPiece;
  yOffset: number;
  material: THREE.MeshStandardMaterial;
}) {
  const lm = board.length_mm / 1000;
  const wm = board.width_mm / 1000;
  const tm = board.thickness_mm / 1000;

  if (board.rotation !== 0) {
    return (
      <group
        position={[board.x / 1000, yOffset, board.y / 1000]}
        rotation={[0, (board.rotation * Math.PI) / 180, 0]}
      >
        <mesh position={[lm / 2, tm / 2, wm / 2]} material={material}>
          <boxGeometry args={[lm, tm, wm]} />
        </mesh>
      </group>
    );
  }

  return (
    <mesh
      position={[board.x / 1000 + lm / 2, yOffset + tm / 2, board.y / 1000 + wm / 2]}
      material={material}
    >
      <boxGeometry args={[lm, tm, wm]} />
    </mesh>
  );
}

/* ─── Deck Scene ───────────────────────────────────────── */

function DeckScene({
  boardLayout,
  design,
  colours,
  showBoards,
  showJoists,
  showBearers,
}: {
  boardLayout: BoardLayoutResult;
  design: DeckDesign;
  colours: ReturnType<typeof getMaterial3DColours>;
  showBoards: boolean;
  showJoists: boolean;
  showBearers: boolean;
}) {
  // Shared materials (memoised on colour changes)
  const boardMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: colours.boardColour }),
    [colours.boardColour]
  );
  const offcutMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: colours.offcutColour }),
    [colours.offcutColour]
  );
  const joistMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: colours.joistColour }),
    [colours.joistColour]
  );
  const bearerMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: colours.bearerColour }),
    [colours.bearerColour]
  );

  // Derive structural heights
  const bearerThickness = boardLayout.bearers[0]?.thickness_mm ?? 100;
  const joistThickness = boardLayout.joists[0]?.thickness_mm ?? 50;
  const boardY = (bearerThickness + joistThickness) / 1000;
  const joistY = bearerThickness / 1000;

  // Camera framing from deck bounds
  const bounds = getBounds(design.polygon);
  const cx = (bounds.minX + bounds.maxX) / 2 / 1000;
  const cz = (bounds.minY + bounds.maxY) / 2 / 1000;
  const deckW = (bounds.maxX - bounds.minX) / 1000;
  const deckD = (bounds.maxY - bounds.minY) / 1000;
  const maxDim = Math.max(deckW, deckD, 1);

  return (
    <>
      <PerspectiveCamera
        makeDefault
        fov={50}
        position={[cx + maxDim * 0.5, maxDim * 0.7, cz + maxDim * 0.8]}
      />
      <OrbitControls target={[cx, 0.05, cz]} enableDamping dampingFactor={0.1} />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 15, 10]} intensity={0.8} />
      <hemisphereLight args={["#b1e1ff", "#8B7355", 0.3]} />

      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, -0.01, cz]}>
        <planeGeometry args={[maxDim * 2, maxDim * 2]} />
        <meshStandardMaterial color="#7C9A5E" />
      </mesh>

      {/* Bearers layer */}
      <group visible={showBearers}>
        {boardLayout.bearers.map((bearer) => {
          const lm = bearer.length_mm / 1000;
          const wm = bearer.width_mm / 1000;
          const tm = bearer.thickness_mm / 1000;
          return (
            <mesh
              key={bearer.id}
              position={[
                bearer.x / 1000 + lm / 2,
                tm / 2,
                bearer.y / 1000 + wm / 2,
              ]}
              material={bearerMat}
            >
              <boxGeometry args={[lm, tm, wm]} />
            </mesh>
          );
        })}
      </group>

      {/* Joists layer */}
      <group visible={showJoists}>
        {boardLayout.joists.map((joist) => {
          const wm = joist.width_mm / 1000;
          const tm = joist.thickness_mm / 1000;
          const lm = joist.length_mm / 1000;
          return (
            <mesh
              key={joist.id}
              position={[
                joist.x / 1000 + wm / 2,
                joistY + tm / 2,
                joist.y / 1000 + lm / 2,
              ]}
              material={joistMat}
            >
              <boxGeometry args={[wm, tm, lm]} />
            </mesh>
          );
        })}
      </group>

      {/* Boards layer */}
      <group visible={showBoards}>
        {boardLayout.boards.map((board) => (
          <BoardMesh
            key={board.id}
            board={board}
            yOffset={boardY}
            material={board.source === "offcut" ? offcutMat : boardMat}
          />
        ))}
      </group>
    </>
  );
}

/* ─── Main Component ───────────────────────────────────── */

export function Deck3DPreview({ boardLayout, design, materialSlug, finishHex }: Props) {
  const [showBoards, setShowBoards] = useState(true);
  const [showJoists, setShowJoists] = useState(true);
  const [showBearers, setShowBearers] = useState(true);

  const colours = useMemo(
    () => getMaterial3DColours(materialSlug, finishHex),
    [materialSlug, finishHex]
  );

  return (
    <div
      className="relative w-full overflow-hidden rounded-lg border bg-background"
      style={{ aspectRatio: "16 / 10", minHeight: "300px" }}
    >
      <Canvas>
        <DeckScene
          boardLayout={boardLayout}
          design={design}
          colours={colours}
          showBoards={showBoards}
          showJoists={showJoists}
          showBearers={showBearers}
        />
      </Canvas>

      {/* Layer toggles */}
      <div className="absolute right-2 top-2 flex flex-col gap-1.5 rounded-lg border bg-background/90 p-2 backdrop-blur-sm">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Layers
        </span>
        <label className="flex cursor-pointer items-center gap-2 text-xs">
          <Checkbox
            checked={showBoards}
            onCheckedChange={(c) => setShowBoards(c === true)}
          />
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-sm"
              style={{ backgroundColor: colours.boardColour }}
            />
            Boards
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-xs">
          <Checkbox
            checked={showJoists}
            onCheckedChange={(c) => setShowJoists(c === true)}
          />
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-sm"
              style={{ backgroundColor: colours.joistColour }}
            />
            Joists
          </span>
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-xs">
          <Checkbox
            checked={showBearers}
            onCheckedChange={(c) => setShowBearers(c === true)}
          />
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block size-2.5 rounded-sm"
              style={{ backgroundColor: colours.bearerColour }}
            />
            Bearers
          </span>
        </label>
      </div>
    </div>
  );
}
