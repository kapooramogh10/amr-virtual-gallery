import {
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { CameraControls, useProgress, useTexture } from '@react-three/drei'
import { AnimatePresence, motion } from 'motion/react'
import * as THREE from 'three'
import './App.css'
import paintings from './data/paintings'
import catMeowUrl from './assets/cat-meow.mp3'

const HOME_CAMERA = {
  position: [0, 1, 8],
  target: [0, 1, -4],
}

// Camera Z position when viewing a piece head-on (see openArtwork) and the
// Canvas camera's vertical FOV.
const ARTWORK_VIEW_Z = 0.9
const CAMERA_FOV = 50

const ARTWORK_POSITIONS = [
  [-3.4, 1, -3.8],
  [0, 1, -3.8],
  [3.4, 1, -3.8],
]

const ARTWORK_TEXTURE_URLS = paintings.map((painting) => painting.image)

const PAINTINGS_PER_PAGE = 3
const PAGE_SLIDE_DISTANCE = 8.5

// Envelope the image is fit inside, leaving room around it for the mat.
const IMAGE_MAX_WIDTH = 2.26
const IMAGE_MAX_HEIGHT = 2.61

// Uniform white-mat border added around the image on every side.
const MAT_MARGIN = 0.22

// Safety bound so three mats side by side never crowd the spotlights.
const MAT_MAX_WIDTH = 2.7
const MAT_MAX_HEIGHT = 3.05

// Dark wood frame border added around the mat on every side.
const FRAME_BORDER = 0.15

// How much larger the drop shadow is than the mat it sits behind.
const SHADOW_EXPANSION = 0.28

// Proportions of the shadow's blurred rectangle, carried over from the
// original fixed 512x640 canvas (76,62 inset on a 360x516 fill rect).
const SHADOW_CANVAS_WIDTH = 512
const SHADOW_INSET_X_RATIO = 76 / 512
const SHADOW_INSET_Y_RATIO = 62 / 640

const PLANT_BASE_SCALE = 0.92
const CAT_BASE_SCALE = 0.92

const PLANT_LEAVES = [
  {
    position: [0, 1.85, 0],
    rotation: [0.05, 0, 0],
    scale: [0.76, 1.15, 0.55],
    color: '#6f9982',
  },
  {
    position: [-0.3, 1.58, 0.03],
    rotation: [0.05, -0.25, 0.45],
    scale: [0.68, 1.05, 0.5],
    color: '#789f88',
  },
  {
    position: [0.3, 1.6, 0.08],
    rotation: [-0.02, 0.25, -0.45],
    scale: [0.68, 1.05, 0.5],
    color: '#648d77',
  },
  {
    position: [-0.18, 1.42, 0.28],
    rotation: [0.35, 0.15, 0.22],
    scale: [0.62, 0.95, 0.46],
    color: '#82a78f',
  },
  {
    position: [0.18, 1.38, -0.25],
    rotation: [-0.32, -0.12, -0.2],
    scale: [0.62, 0.94, 0.46],
    color: '#5f8872',
  },
  {
    position: [-0.42, 1.25, -0.12],
    rotation: [-0.18, -0.28, 0.62],
    scale: [0.56, 0.86, 0.42],
    color: '#739b84',
  },
  {
    position: [0.42, 1.25, 0.12],
    rotation: [0.18, 0.28, -0.62],
    scale: [0.56, 0.86, 0.42],
    color: '#688f79',
  },
]

function LoadingScreen({ assetsReady, entered, onEnter }) {
  const { active, progress, errors } = useProgress()

  const displayedProgress = assetsReady
    ? 100
    : Math.min(100, Math.max(0, Math.round(progress)))

  const readyToEnter = assetsReady && !active

  return (
    <AnimatePresence>
      {!entered && (
        <motion.section
          className="loading-screen"
          aria-label="Virtual gallery title screen"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.025,
            filter: 'blur(8px)',
          }}
          transition={{
            duration: 0.75,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <motion.div
            className="loading-content"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <p className="loading-kicker">Digital Exhibition</p>

            <h1 className="loading-title">
              <span>AMR Virtual</span>
              <span>Gallery</span>
            </h1>

            <p className="loading-description">
              Exploring antimicrobial resistance through art
            </p>

            <div className="loading-progress" aria-hidden="true">
              <motion.div
                className="loading-progress-fill"
                animate={{
                  width: `${displayedProgress}%`,
                }}
                transition={{
                  duration: 0.35,
                  ease: 'easeOut',
                }}
              />
            </div>

            <div className="loading-action-area" aria-live="polite">
              <AnimatePresence mode="wait">
                {readyToEnter ? (
                  <motion.button
                    key="enter-gallery"
                    type="button"
                    className="loading-enter-button"
                    onClick={onEnter}
                    initial={{
                      opacity: 0,
                      y: 10,
                      scale: 0.96,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                    }}
                    transition={{
                      duration: 0.4,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    Enter Gallery
                    <span aria-hidden="true">→</span>
                  </motion.button>
                ) : (
                  <motion.p
                    key="loading-status"
                    className="loading-status"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    Preparing exhibition {displayedProgress}%
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {errors.length > 0 && (
              <p className="loading-error">
                One or more artwork files could not be loaded.
              </p>
            )}

            <p className="loading-credit">
              Built by Amogh Kapoor — 2026
            </p>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}

function IntroScreen({ visible, onContinue }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          className="intro-screen"
          aria-label="Exhibition introduction"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.025,
            filter: 'blur(8px)',
          }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <motion.div
            className="intro-content"
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.1,
            }}
          >
            <p className="intro-kicker">Curatorial Statement</p>

            <h1 className="intro-title">
              Art in the Age of Resistance
            </h1>

            <div className="intro-text">
              <p>
                Antibiotics have been widely used in medicine to
                treat common infections; however, ability to use
                antibiotics is now decreasing due to antimicrobial
                resistance. Bacteria evolve faster than we can
                develop new drugs and infections once considered
                routine are becoming harder to treat. We use art to
                close the gap in public understanding of
                antimicrobial resistance. This exhibition brings
                together artists from Columbia College of Art in
                Chicago who translate this invisible crisis into
                something we can see, feel, and sit with. These
                artists collaborated with clinicians from
                Midwestern University School of Pharmacy as well as
                Northwestern Medicine to depict this important
                public health concern. Our goal isn't just
                appreciation but also understanding of this
                understated crisis.
              </p>

              <p>
                We invite you to explore the works that follow.
                Some may be unsettling. Some may be surprising. We
                hope they resonate with you as deeply as they did
                with us and encourage you to consider both the
                power and the fragility of the medicines we so
                often take for granted.
              </p>
            </div>

            <button
              type="button"
              className="intro-continue-button"
              onClick={onContinue}
            >
              Enter Exhibition
              <span aria-hidden="true">→</span>
            </button>
          </motion.div>
        </motion.section>
      )}
    </AnimatePresence>
  )
}

function TexturePreloader({ onReady }) {
  useTexture(ARTWORK_TEXTURE_URLS)

  useEffect(() => {
    onReady(true)
  }, [onReady])

  return null
}

function getArtworksForPage(pageNumber) {
  const firstArtworkIndex = pageNumber * PAINTINGS_PER_PAGE

  return paintings
    .slice(firstArtworkIndex, firstArtworkIndex + PAINTINGS_PER_PAGE)
    .map((artwork, index) => ({
      ...artwork,
      position: ARTWORK_POSITIONS[index],
    }))
}

function setGroupOpacity(group, opacity) {
  if (!group) {
    return
  }

  group.traverse((child) => {
    if (!child.isMesh || !child.material) {
      return
    }

    const materials = Array.isArray(child.material)
      ? child.material
      : [child.material]

    materials.forEach((material) => {
      if (material.userData.originalDepthWrite === undefined) {
        material.userData.originalDepthWrite = material.depthWrite
      }

      material.transparent = true
      material.opacity = opacity
      material.depthWrite =
        material.userData.originalDepthWrite && opacity > 0.98
      material.needsUpdate = true
    })
  })
}

function MuseumSpotlight({ x }) {
  const lightRef = useRef(null)
  const targetRef = useRef(null)

  useEffect(() => {
    if (lightRef.current && targetRef.current) {
      lightRef.current.target = targetRef.current
    }
  }, [])

  return (
    <>
      <object3D ref={targetRef} position={[x, 0.9, -3.8]} />

      <spotLight
        ref={lightRef}
        position={[x, 3.85, -1.55]}
        color="#f8fcff"
        intensity={21}
        distance={9}
        angle={0.36}
        penumbra={0.9}
        decay={2}
      />

      <group
        position={[x, 3.88, -1.58]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <mesh>
          <cylinderGeometry args={[0.13, 0.17, 0.38, 32]} />

          <meshStandardMaterial
            color="#27333c"
            roughness={0.58}
            metalness={0.24}
          />
        </mesh>

        <mesh position={[0, -0.21, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.045, 32]} />

          <meshStandardMaterial
            color="#dcebf2"
            roughness={0.48}
            metalness={0.26}
          />
        </mesh>
      </group>
    </>
  )
}

function ArtworkShadow({ matWidth, matHeight }) {
  const shadowWidth = matWidth + SHADOW_EXPANSION
  const shadowHeight = matHeight + SHADOW_EXPANSION

  const shadowTexture = useMemo(() => {
    const canvas = document.createElement('canvas')

    canvas.width = SHADOW_CANVAS_WIDTH
    canvas.height = Math.round(
      SHADOW_CANVAS_WIDTH * (shadowHeight / shadowWidth),
    )

    const context = canvas.getContext('2d')

    if (context) {
      const insetX = canvas.width * SHADOW_INSET_X_RATIO
      const insetY = canvas.height * SHADOW_INSET_Y_RATIO

      context.clearRect(0, 0, canvas.width, canvas.height)
      context.shadowColor = 'rgba(39, 51, 60, 0.42)'
      context.shadowBlur = 42
      context.shadowOffsetX = 15
      context.shadowOffsetY = 19
      context.fillStyle = 'rgba(39, 51, 60, 0.18)'
      context.fillRect(
        insetX,
        insetY,
        canvas.width - insetX * 2,
        canvas.height - insetY * 2,
      )
    }

    const texture = new THREE.CanvasTexture(canvas)

    texture.colorSpace = THREE.SRGBColorSpace
    texture.needsUpdate = true

    return texture
  }, [shadowWidth, shadowHeight])

  useEffect(() => {
    return () => {
      shadowTexture.dispose()
    }
  }, [shadowTexture])

  return (
    <mesh position={[0.14, -0.16, -0.12]} renderOrder={0}>
      <planeGeometry args={[shadowWidth, shadowHeight]} />

      <meshBasicMaterial
        map={shadowTexture}
        transparent
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

function ArtworkImage({ url, dimensions, matWidth, matHeight }) {
  const { gl } = useThree()

  const configureTexture = useCallback(
    (loadedTexture) => {
      loadedTexture.colorSpace = THREE.SRGBColorSpace
      loadedTexture.anisotropy = gl.capabilities.getMaxAnisotropy()
      loadedTexture.magFilter = THREE.LinearFilter
      loadedTexture.minFilter = THREE.LinearMipmapLinearFilter
      loadedTexture.generateMipmaps = true
      loadedTexture.needsUpdate = true
    },
    [gl],
  )

  const texture = useTexture(url, configureTexture)

  return (
    <>
      <mesh position={[0, 0, 0.095]}>
        <planeGeometry args={[matWidth, matHeight]} />

        <meshStandardMaterial
          color="#ffffff"
          roughness={0.86}
        />
      </mesh>

      <mesh position={[0, 0, 0.105]}>
        <planeGeometry args={[dimensions.width, dimensions.height]} />

        <meshBasicMaterial
          map={texture}
          transparent
          toneMapped={false}
          alphaTest={0.01}
        />
      </mesh>
    </>
  )
}

function Artwork({ artwork, onSelect, disabled }) {
  const groupRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const texture = useTexture(artwork.image)

  const dimensions = useMemo(() => {
    const source = texture.image

    const imageWidth =
      source?.naturalWidth ||
      source?.videoWidth ||
      source?.width ||
      1

    const imageHeight =
      source?.naturalHeight ||
      source?.videoHeight ||
      source?.height ||
      1

    const imageAspect = imageWidth / imageHeight

    let width = IMAGE_MAX_WIDTH
    let height = width / imageAspect

    if (height > IMAGE_MAX_HEIGHT) {
      height = IMAGE_MAX_HEIGHT
      width = height * imageAspect
    }

    return {
      width,
      height,
    }
  }, [texture])

  const matWidth = Math.min(
    dimensions.width + MAT_MARGIN * 2,
    MAT_MAX_WIDTH,
  )

  const matHeight = Math.min(
    dimensions.height + MAT_MARGIN * 2,
    MAT_MAX_HEIGHT,
  )

  const frameWidth = matWidth + FRAME_BORDER * 2
  const frameHeight = matHeight + FRAME_BORDER * 2

  const [prevDisabled, setPrevDisabled] = useState(disabled)

  if (disabled !== prevDisabled) {
    setPrevDisabled(disabled)

    if (disabled) {
      setHovered(false)
    }
  }

  useEffect(() => {
    if (disabled) {
      document.body.style.cursor = 'default'
    }
  }, [disabled])

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return
    }

    const targetScale = hovered && !disabled ? 1.04 : 1
    const smoothing = 1 - Math.exp(-10 * delta)

    const nextScale = THREE.MathUtils.lerp(
      groupRef.current.scale.x,
      targetScale,
      smoothing,
    )

    groupRef.current.scale.setScalar(nextScale)
  })

  function handlePointerEnter(event) {
    event.stopPropagation()

    if (disabled) {
      return
    }

    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  function handlePointerLeave(event) {
    event.stopPropagation()

    setHovered(false)
    document.body.style.cursor = 'default'
  }

  function handleClick(event) {
    event.stopPropagation()

    if (disabled) {
      return
    }

    setHovered(false)
    document.body.style.cursor = 'default'
    onSelect(artwork)
  }

  return (
    <group
      ref={groupRef}
      position={artwork.position}
      onClick={handleClick}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <ArtworkShadow matWidth={matWidth} matHeight={matHeight} />

      <mesh>
        <boxGeometry args={[frameWidth, frameHeight, 0.16]} />

        <meshStandardMaterial
          color="#27333c"
          roughness={0.62}
          metalness={0.06}
        />
      </mesh>

      <ArtworkImage
        url={artwork.image}
        dimensions={dimensions}
        matWidth={matWidth}
        matHeight={matHeight}
      />
    </group>
  )
}

function ArtworkPage({
  artworks,
  mode,
  direction,
  disabled,
  onTransitionComplete,
  onSelect,
}) {
  const groupRef = useRef(null)
  const opacityRef = useRef(mode === 'enter' ? 0 : 1)
  const elapsedRef = useRef(0)
  const completionSentRef = useRef(false)

  useLayoutEffect(() => {
    if (!groupRef.current) {
      return
    }

    const startingX =
      mode === 'enter'
        ? direction * PAGE_SLIDE_DISTANCE
        : 0

    groupRef.current.position.x = startingX
    opacityRef.current = mode === 'enter' ? 0 : 1
    elapsedRef.current = 0
    completionSentRef.current = false

    setGroupOpacity(groupRef.current, opacityRef.current)
  }, [mode, direction])

  useFrame((_, delta) => {
    const group = groupRef.current

    if (!group || mode === 'static') {
      return
    }

    const targetX =
      mode === 'exit'
        ? -direction * PAGE_SLIDE_DISTANCE
        : 0

    const targetOpacity = mode === 'exit' ? 0 : 1
    const smoothing = 1 - Math.exp(-9 * delta)

    group.position.x = THREE.MathUtils.lerp(
      group.position.x,
      targetX,
      smoothing,
    )

    opacityRef.current = THREE.MathUtils.lerp(
      opacityRef.current,
      targetOpacity,
      smoothing,
    )

    setGroupOpacity(group, opacityRef.current)
    elapsedRef.current += delta

    if (
      mode === 'enter' &&
      !completionSentRef.current &&
      elapsedRef.current >= 0.55
    ) {
      completionSentRef.current = true
      group.position.x = 0
      opacityRef.current = 1

      setGroupOpacity(group, 1)
      onTransitionComplete?.()
    }
  })

  return (
    <group ref={groupRef}>
      {artworks.map((artwork) => (
        <Artwork
          key={artwork.id}
          artwork={artwork}
          onSelect={onSelect}
          disabled={disabled}
        />
      ))}
    </group>
  )
}

function InteractivePlant({ disabled }) {
  const groupRef = useRef(null)
  const leafRefs = useRef([])
  const rustleStrengthRef = useRef(0)

  const [hovered, setHovered] = useState(false)
  const [prevDisabled, setPrevDisabled] = useState(disabled)

  if (disabled !== prevDisabled) {
    setPrevDisabled(disabled)

    if (disabled) {
      setHovered(false)
    }
  }

  useEffect(() => {
    if (disabled) {
      document.body.style.cursor = 'default'
    }

    return () => {
      document.body.style.cursor = 'default'
    }
  }, [disabled])

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) {
      return
    }

    const targetScale =
      hovered && !disabled
        ? PLANT_BASE_SCALE * 1.06
        : PLANT_BASE_SCALE

    const scaleSmoothing = 1 - Math.exp(-10 * delta)

    const nextScale = THREE.MathUtils.lerp(
      groupRef.current.scale.x,
      targetScale,
      scaleSmoothing,
    )

    groupRef.current.scale.setScalar(nextScale)

    rustleStrengthRef.current = Math.max(
      0,
      rustleStrengthRef.current - delta * 0.72,
    )

    const rustleStrength = rustleStrengthRef.current
    const rotationSmoothing = 1 - Math.exp(-8 * delta)

    leafRefs.current.forEach((leaf, index) => {
      if (!leaf) {
        return
      }

      const leafSettings = PLANT_LEAVES[index]
      const baseRotation = leafSettings.rotation
      const phase = index * 1.13

      const swayZ =
        Math.sin(clock.elapsedTime * (8.5 + index * 0.35) + phase) *
        0.18 *
        rustleStrength

      const swayX =
        Math.cos(clock.elapsedTime * (7.5 + index * 0.25) + phase) *
        0.09 *
        rustleStrength

      const swayY =
        Math.sin(clock.elapsedTime * (10 + index * 0.2) + phase) *
        0.07 *
        rustleStrength

      leaf.rotation.x = THREE.MathUtils.lerp(
        leaf.rotation.x,
        baseRotation[0] + swayX,
        rotationSmoothing,
      )

      leaf.rotation.y = THREE.MathUtils.lerp(
        leaf.rotation.y,
        baseRotation[1] + swayY,
        rotationSmoothing,
      )

      leaf.rotation.z = THREE.MathUtils.lerp(
        leaf.rotation.z,
        baseRotation[2] + swayZ,
        rotationSmoothing,
      )
    })
  })

  function handlePointerEnter(event) {
    event.stopPropagation()

    if (disabled) {
      return
    }

    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  function handlePointerLeave(event) {
    event.stopPropagation()

    setHovered(false)
    document.body.style.cursor = 'default'
  }

  function handleClick(event) {
    event.stopPropagation()

    if (disabled) {
      return
    }

    rustleStrengthRef.current = 1
  }

  return (
    <group
      ref={groupRef}
      position={[-4.55, -2.08, -0.45]}
      scale={PLANT_BASE_SCALE}
    >
      <mesh
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.1, 0.72, 1]}
      >
        <circleGeometry args={[0.68, 24]} />

        <meshBasicMaterial
          color="#40535e"
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </mesh>

      <mesh position={[0, 0.38, 0]}>
        <cylinderGeometry args={[0.46, 0.62, 0.76, 8]} />

        <meshStandardMaterial
          color="#eaf3f7"
          roughness={0.74}
          metalness={0.02}
          flatShading
        />
      </mesh>

      <mesh position={[0, 0.73, 0]}>
        <cylinderGeometry args={[0.54, 0.54, 0.13, 8]} />

        <meshStandardMaterial
          color="#ffffff"
          roughness={0.68}
          flatShading
        />
      </mesh>

      <mesh position={[0, 0.785, 0]}>
        <cylinderGeometry args={[0.44, 0.44, 0.055, 12]} />

        <meshStandardMaterial
          color="#4c5d53"
          roughness={0.95}
          flatShading
        />
      </mesh>

      <mesh
        position={[0, 1.27, 0]}
        rotation={[0, 0, 0]}
      >
        <cylinderGeometry args={[0.045, 0.055, 1.05, 6]} />

        <meshStandardMaterial
          color="#587663"
          roughness={0.85}
          flatShading
        />
      </mesh>

      <mesh
        position={[-0.22, 1.15, 0.02]}
        rotation={[0, 0, 0.28]}
      >
        <cylinderGeometry args={[0.035, 0.045, 0.9, 6]} />

        <meshStandardMaterial
          color="#587663"
          roughness={0.85}
          flatShading
        />
      </mesh>

      <mesh
        position={[0.22, 1.15, 0.03]}
        rotation={[0, 0, -0.28]}
      >
        <cylinderGeometry args={[0.035, 0.045, 0.9, 6]} />

        <meshStandardMaterial
          color="#587663"
          roughness={0.85}
          flatShading
        />
      </mesh>

      {PLANT_LEAVES.map((leaf, index) => (
        <group
          key={`plant-leaf-${index}`}
          ref={(node) => {
            leafRefs.current[index] = node
          }}
          position={leaf.position}
          rotation={leaf.rotation}
        >
          <mesh scale={leaf.scale}>
            <coneGeometry args={[0.3, 1.02, 5]} />

            <meshStandardMaterial
              color={leaf.color}
              roughness={0.78}
              flatShading
            />
          </mesh>
        </group>
      ))}

      <mesh
        position={[0, 1.22, 0]}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        <boxGeometry args={[1.7, 2.5, 1.3]} />

        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function InteractiveCat({ disabled }) {
  const groupRef = useRef(null)
  const animatedBodyRef = useRef(null)
  const headRef = useRef(null)
  const leftEarRef = useRef(null)
  const rightEarRef = useRef(null)
  const tailRef = useRef(null)

  const audioRef = useRef(null)
  const lastMeowTimeRef = useRef(0)
  const animationTimeRef = useRef(0)
  const animationActiveRef = useRef(false)

  const [hovered, setHovered] = useState(false)
  const [prevDisabled, setPrevDisabled] = useState(disabled)

  if (disabled !== prevDisabled) {
    setPrevDisabled(disabled)

    if (disabled) {
      setHovered(false)
    }
  }

  useEffect(() => {
    const catAudio = new Audio(catMeowUrl)

    catAudio.preload = 'auto'
    catAudio.volume = 0.62

    audioRef.current = catAudio

    return () => {
      catAudio.pause()
      audioRef.current = null
      document.body.style.cursor = 'default'
    }
  }, [])

  useEffect(() => {
    if (disabled) {
      document.body.style.cursor = 'default'
    }
  }, [disabled])

  useFrame((_, delta) => {
    if (!groupRef.current) {
      return
    }

    const targetScale =
      hovered && !disabled
        ? CAT_BASE_SCALE * 1.06
        : CAT_BASE_SCALE

    const scaleSmoothing = 1 - Math.exp(-10 * delta)

    const nextScale = THREE.MathUtils.lerp(
      groupRef.current.scale.x,
      targetScale,
      scaleSmoothing,
    )

    groupRef.current.scale.setScalar(nextScale)

    if (!animationActiveRef.current) {
      if (animatedBodyRef.current) {
        animatedBodyRef.current.position.y = THREE.MathUtils.lerp(
          animatedBodyRef.current.position.y,
          0,
          1 - Math.exp(-12 * delta),
        )

        animatedBodyRef.current.rotation.z = THREE.MathUtils.lerp(
          animatedBodyRef.current.rotation.z,
          0,
          1 - Math.exp(-12 * delta),
        )
      }

      return
    }

    animationTimeRef.current += delta

    const duration = 1.15
    const progress = Math.min(animationTimeRef.current / duration, 1)
    const envelope = Math.sin(progress * Math.PI)

    if (animatedBodyRef.current) {
      animatedBodyRef.current.position.y =
        envelope * 0.07 +
        Math.sin(progress * Math.PI * 2) * envelope * 0.022

      animatedBodyRef.current.rotation.z =
        Math.sin(progress * Math.PI * 2) * envelope * 0.025
    }

    if (headRef.current) {
      headRef.current.rotation.y =
        Math.sin(progress * Math.PI * 4) * envelope * 0.1
    }

    if (leftEarRef.current) {
      leftEarRef.current.rotation.z =
        -0.16 +
        Math.sin(progress * Math.PI * 6) * envelope * 0.2
    }

    if (rightEarRef.current) {
      rightEarRef.current.rotation.z =
        0.16 -
        Math.sin(progress * Math.PI * 5) * envelope * 0.17
    }

    if (tailRef.current) {
      tailRef.current.rotation.y =
        Math.sin(progress * Math.PI * 4) * envelope * 0.28
    }

    if (progress >= 1) {
      animationActiveRef.current = false
      animationTimeRef.current = 0

      if (animatedBodyRef.current) {
        animatedBodyRef.current.position.y = 0
        animatedBodyRef.current.rotation.z = 0
      }

      if (headRef.current) {
        headRef.current.rotation.y = 0
      }

      if (leftEarRef.current) {
        leftEarRef.current.rotation.z = -0.16
      }

      if (rightEarRef.current) {
        rightEarRef.current.rotation.z = 0.16
      }

      if (tailRef.current) {
        tailRef.current.rotation.y = 0
      }
    }
  })

  function playMeow() {
    const currentTime = performance.now()

    if (currentTime - lastMeowTimeRef.current < 650) {
      return
    }

    lastMeowTimeRef.current = currentTime

    const catAudio = audioRef.current

    if (!catAudio) {
      return
    }

    catAudio.currentTime = 0

    const playPromise = catAudio.play()

    if (playPromise) {
      playPromise.catch(() => {
        // The animation still works even if the audio file is unavailable.
      })
    }
  }

  function handlePointerEnter(event) {
    event.stopPropagation()

    if (disabled) {
      return
    }

    setHovered(true)
    document.body.style.cursor = 'pointer'
  }

  function handlePointerLeave(event) {
    event.stopPropagation()

    setHovered(false)
    document.body.style.cursor = 'default'
  }

  function handleClick(event) {
    event.stopPropagation()

    if (disabled) {
      return
    }

    animationTimeRef.current = 0
    animationActiveRef.current = true
    playMeow()
  }

  return (
    <group
      ref={groupRef}
      position={[4.45, -2.07, -0.65]}
      rotation={[0, -0.18, 0]}
      scale={CAT_BASE_SCALE}
    >
      <mesh
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.35, 0.78, 1]}
      >
        <circleGeometry args={[0.88, 24]} />

        <meshBasicMaterial
          color="#40535e"
          transparent
          opacity={0.16}
          depthWrite={false}
        />
      </mesh>

      <group ref={animatedBodyRef}>
        <mesh
          position={[0.08, 0.42, -0.02]}
          scale={[1.2, 0.62, 0.9]}
        >
          <sphereGeometry args={[0.72, 8, 6]} />

          <meshStandardMaterial
            color="#d98236"
            roughness={0.82}
            flatShading
          />
        </mesh>

        <mesh
          position={[0.22, 0.48, -0.12]}
          scale={[0.7, 0.48, 0.65]}
        >
          <sphereGeometry args={[0.68, 8, 6]} />

          <meshStandardMaterial
            color="#e28b3d"
            roughness={0.82}
            flatShading
          />
        </mesh>

        <group
          ref={tailRef}
          position={[0.52, 0.34, -0.08]}
        >
          <mesh rotation={[Math.PI / 2, 0, 0.3]}>
            <torusGeometry
              args={[
                0.64,
                0.115,
                6,
                18,
                Math.PI * 1.62,
              ]}
            />

            <meshStandardMaterial
              color="#c86f2c"
              roughness={0.8}
              flatShading
            />
          </mesh>
        </group>

        <group
          ref={headRef}
          position={[-0.58, 0.52, 0.38]}
        >
          <mesh scale={[0.62, 0.56, 0.58]}>
            <sphereGeometry args={[0.58, 8, 6]} />

            <meshStandardMaterial
              color="#e28b3d"
              roughness={0.82}
              flatShading
            />
          </mesh>

          <group
            ref={leftEarRef}
            position={[-0.22, 0.34, -0.01]}
            rotation={[0.05, 0, -0.16]}
          >
            <mesh>
              <coneGeometry args={[0.15, 0.35, 4]} />

              <meshStandardMaterial
                color="#c96f30"
                roughness={0.82}
                flatShading
              />
            </mesh>
          </group>

          <group
            ref={rightEarRef}
            position={[0.22, 0.34, -0.01]}
            rotation={[0.05, 0, 0.16]}
          >
            <mesh>
              <coneGeometry args={[0.15, 0.35, 4]} />

              <meshStandardMaterial
                color="#c96f30"
                roughness={0.82}
                flatShading
              />
            </mesh>
          </group>

          <mesh position={[-0.15, 0.04, 0.34]}>
            <boxGeometry args={[0.17, 0.025, 0.035]} />

            <meshBasicMaterial color="#3b3029" />
          </mesh>

          <mesh position={[0.15, 0.04, 0.34]}>
            <boxGeometry args={[0.17, 0.025, 0.035]} />

            <meshBasicMaterial color="#3b3029" />
          </mesh>

          <mesh
            position={[0, -0.08, 0.37]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <coneGeometry args={[0.055, 0.08, 3]} />

            <meshBasicMaterial color="#6f4637" />
          </mesh>

          <mesh
            position={[-0.11, -0.19, 0.25]}
            scale={[0.42, 0.3, 0.3]}
          >
            <sphereGeometry args={[0.3, 7, 5]} />

            <meshStandardMaterial
              color="#f1b06d"
              roughness={0.8}
              flatShading
            />
          </mesh>

          <mesh
            position={[0.11, -0.19, 0.25]}
            scale={[0.42, 0.3, 0.3]}
          >
            <sphereGeometry args={[0.3, 7, 5]} />

            <meshStandardMaterial
              color="#f1b06d"
              roughness={0.8}
              flatShading
            />
          </mesh>
        </group>

        <mesh
          position={[-0.38, 0.19, 0.42]}
          rotation={[0.06, 0, -0.18]}
          scale={[0.58, 0.28, 0.34]}
        >
          <sphereGeometry args={[0.4, 7, 5]} />

          <meshStandardMaterial
            color="#dc8337"
            roughness={0.82}
            flatShading
          />
        </mesh>

        <mesh
          position={[-0.05, 0.18, 0.48]}
          rotation={[0.04, 0, 0.12]}
          scale={[0.58, 0.28, 0.34]}
        >
          <sphereGeometry args={[0.4, 7, 5]} />

          <meshStandardMaterial
            color="#dc8337"
            roughness={0.82}
            flatShading
          />
        </mesh>
      </group>

      <mesh
        position={[0, 0.55, 0]}
        onPointerEnter={handlePointerEnter}
        onPointerLeave={handlePointerLeave}
        onClick={handleClick}
      >
        <boxGeometry args={[2.45, 1.3, 1.9]} />

        <meshBasicMaterial
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}

function GalleryRoom({ decorInteractionDisabled }) {
  return (
    <>
      <color attach="background" args={['#dcebf2']} />

      <hemisphereLight args={['#ffffff', '#7f98a5', 0.95]} />
      <ambientLight intensity={0.48} />

      <directionalLight
        position={[4, 7, 5]}
        intensity={0.55}
        color="#fafdff"
      />

      <mesh position={[0, -2.2, -0.1]}>
        <boxGeometry args={[12, 0.2, 8.6]} />

        <meshStandardMaterial
          color="#9fb5c0"
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      <mesh position={[0, 1, -4.2]}>
        <boxGeometry args={[12, 6.5, 0.2]} />

        <meshBasicMaterial color="#d9e8ef" />
      </mesh>

      <mesh position={[-6, 1, -0.1]}>
        <boxGeometry args={[0.2, 6.5, 8.4]} />

        <meshBasicMaterial color="#d9e8ef" />
      </mesh>

      <mesh position={[6, 1, -0.1]}>
        <boxGeometry args={[0.2, 6.5, 8.4]} />

        <meshBasicMaterial color="#d9e8ef" />
      </mesh>

      <mesh position={[0, 4.25, -0.1]}>
        <boxGeometry args={[12, 0.2, 8.6]} />

        <meshStandardMaterial
          color="#f6fbfd"
          roughness={0.96}
        />
      </mesh>

      <mesh position={[0, -2.02, -4.02]}>
        <boxGeometry args={[12, 0.22, 0.16]} />

        <meshStandardMaterial
          color="#78909c"
          roughness={0.7}
        />
      </mesh>

      <mesh position={[0, 4.01, -1.58]}>
        <boxGeometry args={[9.5, 0.08, 0.08]} />

        <meshStandardMaterial
          color="#27333c"
          roughness={0.54}
          metalness={0.26}
        />
      </mesh>

      <MuseumSpotlight x={-3.4} />
      <MuseumSpotlight x={0} />
      <MuseumSpotlight x={3.4} />

      <InteractivePlant disabled={decorInteractionDisabled} />
      <InteractiveCat disabled={decorInteractionDisabled} />
    </>
  )
}

function GalleryScene({
  controlsRef,
  galleryPage,
  pageTransition,
  onPageTransitionComplete,
  onSelect,
  artworkSelectionDisabled,
}) {
  return (
    <>
      <GalleryRoom
        decorInteractionDisabled={artworkSelectionDisabled}
      />

      {pageTransition ? (
        <>
          <ArtworkPage
            key={`outgoing-${pageTransition.fromPage}`}
            artworks={getArtworksForPage(pageTransition.fromPage)}
            mode="exit"
            direction={pageTransition.direction}
            disabled
            onSelect={onSelect}
          />

          <ArtworkPage
            key={`incoming-${pageTransition.toPage}`}
            artworks={getArtworksForPage(pageTransition.toPage)}
            mode="enter"
            direction={pageTransition.direction}
            disabled
            onSelect={onSelect}
            onTransitionComplete={onPageTransitionComplete}
          />
        </>
      ) : (
        <ArtworkPage
          key={`page-${galleryPage}`}
          artworks={getArtworksForPage(galleryPage)}
          mode="static"
          direction={1}
          disabled={artworkSelectionDisabled}
          onSelect={onSelect}
        />
      )}

      <CameraControls
        ref={controlsRef}
        smoothTime={0.45}
        enabled={false}
      />
    </>
  )
}

function App() {
  const controlsRef = useRef(null)

  const [assetsReady, setAssetsReady] = useState(false)
  const [stage, setStage] = useState('title')
  const [galleryPage, setGalleryPage] = useState(0)
  const [pageTransition, setPageTransition] = useState(null)
  const [selectedArtwork, setSelectedArtwork] = useState(null)
  const [cameraMoving, setCameraMoving] = useState(false)
  const [returningHome, setReturningHome] = useState(false)
  const [controlsVisible, setControlsVisible] = useState(false)
  const [showInfo, setShowInfo] = useState(false)

  const galleryEntered = stage === 'gallery'

  const pageCount = Math.ceil(
    paintings.length / PAINTINGS_PER_PAGE,
  )

  const galleryTextVisible =
    galleryEntered &&
    (!selectedArtwork || returningHome)

  const galleryArrowsVisible =
    galleryEntered &&
    !selectedArtwork &&
    !cameraMoving &&
    !returningHome

  const galleryNavigationEnabled =
    galleryArrowsVisible &&
    !pageTransition

  const titleScreenButtonVisible =
    galleryEntered &&
    !selectedArtwork &&
    !cameraMoving &&
    !returningHome &&
    !pageTransition

  const displayedPage =
    pageTransition?.toPage ??
    galleryPage

  async function openArtwork(artwork) {
    if (
      !galleryEntered ||
      cameraMoving ||
      returningHome ||
      selectedArtwork ||
      pageTransition
    ) {
      return
    }

    setSelectedArtwork(artwork)
    setShowInfo(false)
    setControlsVisible(false)
    setCameraMoving(true)

    const [x, y, z] = artwork.position

    await controlsRef.current?.setLookAt(
      x,
      y,
      ARTWORK_VIEW_Z,
      x,
      y,
      z,
      true,
    )

    setCameraMoving(false)
    setControlsVisible(true)
  }

  async function closeArtwork() {
    if (cameraMoving || returningHome) {
      return
    }

    setControlsVisible(false)
    setShowInfo(false)
    setCameraMoving(true)
    setReturningHome(true)

    document.body.style.cursor = 'default'

    await controlsRef.current?.setLookAt(
      ...HOME_CAMERA.position,
      ...HOME_CAMERA.target,
      true,
    )

    setSelectedArtwork(null)
    setCameraMoving(false)
    setReturningHome(false)
  }

  function returnToTitleScreen() {
    if (!titleScreenButtonVisible) {
      return
    }

    document.body.style.cursor = 'default'

    controlsRef.current?.setLookAt(
      ...HOME_CAMERA.position,
      ...HOME_CAMERA.target,
      false,
    )

    setShowInfo(false)
    setControlsVisible(false)
    setSelectedArtwork(null)
    setCameraMoving(false)
    setReturningHome(false)
    setPageTransition(null)
    setGalleryPage(0)
    setStage('title')
  }

  function startPageTransition(direction) {
    if (!galleryNavigationEnabled) {
      return
    }

    const toPage =
      (galleryPage + direction + pageCount) %
      pageCount

    if (toPage === galleryPage) {
      return
    }

    setPageTransition({
      fromPage: galleryPage,
      toPage,
      direction,
    })
  }

  function showPreviousPage() {
    startPageTransition(-1)
  }

  function showNextPage() {
    startPageTransition(1)
  }

  function finishPageTransition() {
    if (!pageTransition) {
      return
    }

    setGalleryPage(pageTransition.toPage)
    setPageTransition(null)
  }

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.repeat || !galleryEntered) {
        return
      }

      if (
        event.key === 'Escape' &&
        selectedArtwork &&
        controlsVisible &&
        !cameraMoving &&
        !returningHome
      ) {
        event.preventDefault()
        closeArtwork()
        return
      }

      if (
        selectedArtwork ||
        cameraMoving ||
        returningHome ||
        pageTransition
      ) {
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        showPreviousPage()
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        showNextPage()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  return (
    <main className="app">
      <LoadingScreen
        assetsReady={assetsReady}
        entered={stage !== 'title'}
        onEnter={() => setStage('intro')}
      />

      <IntroScreen
        visible={stage === 'intro'}
        onContinue={() => setStage('gallery')}
      />

      <Canvas
        dpr={[1, 2]}
        camera={{
          position: HOME_CAMERA.position,
          fov: CAMERA_FOV,
        }}
        gl={{
          antialias: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <TexturePreloader onReady={setAssetsReady} />

          <GalleryScene
            controlsRef={controlsRef}
            galleryPage={galleryPage}
            pageTransition={pageTransition}
            onPageTransitionComplete={finishPageTransition}
            onSelect={openArtwork}
            artworkSelectionDisabled={
              !galleryEntered ||
              cameraMoving ||
              returningHome ||
              Boolean(selectedArtwork) ||
              Boolean(pageTransition)
            }
          />
        </Suspense>
      </Canvas>

      <AnimatePresence>
        {titleScreenButtonVisible && (
          <motion.button
            type="button"
            className="title-screen-button"
            onClick={returnToTitleScreen}
            aria-label="Return to title screen"
            initial={{
              opacity: 0,
              x: -12,
            }}
            animate={{
              opacity: 1,
              x: 0,
            }}
            exit={{
              opacity: 0,
              x: -12,
            }}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <span aria-hidden="true">←</span>
            Title Screen
          </motion.button>
        )}
      </AnimatePresence>

      <header
        className={`gallery-title ${
          galleryTextVisible
            ? 'gallery-title-visible'
            : ''
        }`}
      >
        <p className="gallery-label">Digital Exhibition</p>

        <h1>AMR Virtual Gallery</h1>

        <p className="gallery-subtitle">
          Exploring antimicrobial resistance through art
        </p>
      </header>

      <button
        type="button"
        className={`page-arrow page-arrow-left ${
          galleryArrowsVisible
            ? 'page-arrow-visible'
            : ''
        } ${
          pageTransition
            ? 'page-arrow-disabled'
            : ''
        }`}
        onClick={showPreviousPage}
        aria-label="Previous group of artworks"
        disabled={!galleryNavigationEnabled}
        tabIndex={galleryNavigationEnabled ? 0 : -1}
      >
        ‹
      </button>

      <button
        type="button"
        className={`page-arrow page-arrow-right ${
          galleryArrowsVisible
            ? 'page-arrow-visible'
            : ''
        } ${
          pageTransition
            ? 'page-arrow-disabled'
            : ''
        }`}
        onClick={showNextPage}
        aria-label="Next group of artworks"
        disabled={!galleryNavigationEnabled}
        tabIndex={galleryNavigationEnabled ? 0 : -1}
      >
        ›
      </button>

      <div
        className={`page-indicator ${
          galleryArrowsVisible
            ? 'page-indicator-visible'
            : ''
        }`}
      >
        {displayedPage + 1} / {pageCount}
      </div>

      <footer
        className={`gallery-footer ${
          galleryTextVisible
            ? 'gallery-footer-visible'
            : ''
        }`}
      >
        Built by Amogh Kapoor — 2026
      </footer>

      {selectedArtwork && (
        <div
          className={`viewer-ui ${
            controlsVisible
              ? 'viewer-ui-visible'
              : ''
          }`}
        >
          <button
            type="button"
            className="close-button"
            onClick={closeArtwork}
            aria-label="Return to gallery"
          >
            ×
          </button>

          <button
            type="button"
            className="learn-more-button"
            aria-expanded={showInfo}
            aria-controls="artwork-information"
            onClick={() => {
              setShowInfo((currentValue) => !currentValue)
            }}
          >
            {showInfo
              ? 'Hide Information'
              : 'Learn More'}
          </button>

          <AnimatePresence>
            {showInfo && (
              <motion.aside
                id="artwork-information"
                className="artwork-info"
                aria-labelledby="artwork-info-title"
                initial={{
                  opacity: 0,
                  x: 45,
                  scale: 0.97,
                }}
                animate={{
                  opacity: 1,
                  x: 0,
                  scale: 1,
                }}
                exit={{
                  opacity: 0,
                  x: 45,
                  scale: 0.97,
                }}
                transition={{
                  duration: 0.32,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <button
                  type="button"
                  className="info-close-button"
                  onClick={() => setShowInfo(false)}
                  aria-label="Close artwork information"
                >
                  ×
                </button>

                <p className="info-eyebrow">Artwork Details</p>

                <h2 id="artwork-info-title">
                  {selectedArtwork.title}
                </h2>

                <p className="artist">
                  By {selectedArtwork.artist}
                </p>

                <div className="info-divider" />

                <p className="info-description">
                  {selectedArtwork.description}
                </p>

                {selectedArtwork.amrExplanation && (
                  <div className="amr-note">
                    <p className="amr-note-label">
                      Connection to AMR
                    </p>

                    <p>
                      {selectedArtwork.amrExplanation}
                    </p>
                  </div>
                )}
              </motion.aside>
            )}
          </AnimatePresence>
        </div>
      )}
    </main>
  )
}

export default App