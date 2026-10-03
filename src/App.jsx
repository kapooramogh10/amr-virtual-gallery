import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useProgress, useTexture } from '@react-three/drei'
import { AnimatePresence, motion } from 'motion/react'
import * as THREE from 'three'
import './App.css'
import paintings from './data/paintings'
import catMeowUrl from './assets/cat-meow.mp3'

const CAMERA_FOV = 50
const CAMERA_HEIGHT = 1
const TAN_HALF_FOV = Math.tan(THREE.MathUtils.degToRad(CAMERA_FOV / 2))

// Every piece hangs evenly spaced around one circular room, so the room's
// radius grows with the number of artworks.
const ARTWORK_COUNT = paintings.length
const ARTWORK_SPACING = 3.4
const ARTWORK_STEP = (Math.PI * 2) / ARTWORK_COUNT
const ARTWORK_RADIUS = Math.max(
  6,
  (ARTWORK_COUNT * ARTWORK_SPACING) / (Math.PI * 2),
)
const WALL_RADIUS = ARTWORK_RADIUS + 0.4
const SPOTLIGHT_RADIUS = ARTWORK_RADIUS - 2.25

// Camera distance from the wall while browsing the room, and the closest a
// zoomed-in view is allowed to get.
const HOME_VIEW_DISTANCE = 11.8
const ZOOMED_VIEW_DISTANCE = 5
const MIN_ZOOM_DISTANCE = 2.2
const ZOOM_FIT_MARGIN = 1.12

// Only the spotlights nearest the view are real lights; the rest of the
// fixtures are just meshes.
const SPOTLIGHT_POOL_SIZE = 7

// Pointer travel (px) before a press becomes a drag, and the swipe length
// that moves to the next piece while zoomed in.
const DRAG_THRESHOLD = 6
const SWIPE_THRESHOLD = 50

// Zoomed-in viewer layout. Keep in sync with .artwork-info and
// .viewer-arrow in App.css.
const MOBILE_BREAKPOINT = 760
const INFO_PANEL_MAX_WIDTH = 420
const INFO_PANEL_WIDTH_RATIO = 0.38
const INFO_SHEET_HEIGHT_RATIO = 0.44

const ARTWORK_TEXTURE_URLS = paintings.map((painting) => painting.image)

// Envelope the image is fit inside, leaving room around it for the mat.
const IMAGE_MAX_WIDTH = 2.26
const IMAGE_MAX_HEIGHT = 2.61

// Uniform white-mat border added around the image on every side.
const MAT_MARGIN = 0.22

// Safety bound so neighbouring mats never crowd each other on the wall.
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
            <div className="loading-hero">
              <p className="loading-kicker">Digital Exhibition</p>

              <h1 className="loading-title">
                <span>AMR Virtual</span>
                <span>Gallery</span>
              </h1>

              <p className="loading-description">
                Exploring antimicrobial resistance through art
              </p>
            </div>

            <div className="loading-statement">
              <p className="intro-kicker">Curatorial Statement</p>

              <h2 className="intro-title">
                Art in the Age of Resistance
              </h2>

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
            </div>

            <div className="loading-actions">
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
            </div>

            <p className="loading-credit">
              Built by Amogh Kapoor — 2026
            </p>
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

function wrapIndex(index) {
  return ((index % ARTWORK_COUNT) + ARTWORK_COUNT) % ARTWORK_COUNT
}

// Positions a point on a circle around the room's center. Angle 0 faces
// straight down -Z and angles increase clockwise when seen from above, so
// higher indices sit further to the right.
function setRoomPosition(vector, angle, radius, y) {
  return vector.set(
    radius * Math.sin(angle),
    y,
    -radius * Math.cos(angle),
  )
}

function getArtworkLayout(texture) {
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

  const matWidth = Math.min(width + MAT_MARGIN * 2, MAT_MAX_WIDTH)
  const matHeight = Math.min(height + MAT_MARGIN * 2, MAT_MAX_HEIGHT)

  return {
    width,
    height,
    matWidth,
    matHeight,
    frameWidth: matWidth + FRAME_BORDER * 2,
    frameHeight: matHeight + FRAME_BORDER * 2,
  }
}

// Screen area left for the artwork once the info panel and controls are
// placed, plus how far (px) to shift the view so the piece is centered in it.
function getViewerFrame(width, height, infoVisible) {
  const mobile = width <= MOBILE_BREAKPOINT
  const gutter = mobile ? 12 : 24
  const top = mobile ? 64 : gutter
  const sidePadding = mobile ? 24 : 84

  let right = 0
  let bottom = mobile ? 64 : gutter

  if (infoVisible && mobile) {
    bottom = height * INFO_SHEET_HEIGHT_RATIO + gutter
  }

  if (infoVisible && !mobile) {
    right =
      Math.min(INFO_PANEL_MAX_WIDTH, width * INFO_PANEL_WIDTH_RATIO) +
      gutter * 2
  }

  return {
    offsetX: right / 2,
    offsetY: (bottom - top) / 2,
    availableWidth: Math.max(1, width - right - sidePadding * 2),
    availableHeight: Math.max(1, height - top - bottom),
  }
}

function CameraRig({ yawTargetRef, focusIndex, zoomed, infoVisible }) {
  const textures = useTexture(ARTWORK_TEXTURE_URLS)

  const frameSizes = useMemo(
    () => textures.map(getArtworkLayout),
    [textures],
  )

  const yawRef = useRef(0)
  const distanceRef = useRef(HOME_VIEW_DISTANCE)
  const offsetRef = useRef({ x: 0, y: 0 })
  const lookTarget = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ camera, size }, delta) => {
    const frame = getViewerFrame(size.width, size.height, infoVisible)

    let targetDistance = HOME_VIEW_DISTANCE

    if (zoomed) {
      const layout = frameSizes[wrapIndex(focusIndex)]

      const fitDistance =
        ((size.height * ZOOM_FIT_MARGIN) / (2 * TAN_HALF_FOV)) *
        Math.max(
          layout.frameWidth / frame.availableWidth,
          layout.frameHeight / frame.availableHeight,
        )

      targetDistance = Math.max(MIN_ZOOM_DISTANCE, fitDistance)
    }

    const damp = THREE.MathUtils.damp
    const offset = offsetRef.current

    yawRef.current = damp(yawRef.current, yawTargetRef.current, 6, delta)
    distanceRef.current = damp(distanceRef.current, targetDistance, 4, delta)
    offset.x = damp(offset.x, zoomed ? frame.offsetX : 0, 4, delta)
    offset.y = damp(offset.y, zoomed ? frame.offsetY : 0, 4, delta)

    const yaw = yawRef.current

    setRoomPosition(
      camera.position,
      yaw,
      ARTWORK_RADIUS - distanceRef.current,
      CAMERA_HEIGHT,
    )

    camera.lookAt(
      setRoomPosition(lookTarget, yaw, ARTWORK_RADIUS, CAMERA_HEIGHT),
    )

    // Shifting the projection (rather than the camera) keeps the piece seen
    // head-on while centering it in the space beside the info panel.
    if (Math.abs(offset.x) > 0.5 || Math.abs(offset.y) > 0.5) {
      camera.setViewOffset(
        size.width,
        size.height,
        offset.x,
        offset.y,
        size.width,
        size.height,
      )
    } else if (camera.view?.enabled) {
      camera.clearViewOffset()
    }
  })

  return null
}

function SpotlightPool() {
  const lightRefs = useRef([])

  const targets = useMemo(
    () =>
      Array.from(
        { length: SPOTLIGHT_POOL_SIZE },
        () => new THREE.Object3D(),
      ),
    [],
  )

  const viewDirection = useMemo(() => new THREE.Vector3(), [])

  // Keep the real lights on the pieces around wherever the camera is facing.
  useFrame(({ camera }) => {
    camera.getWorldDirection(viewDirection)

    const centerIndex = Math.round(
      Math.atan2(viewDirection.x, -viewDirection.z) / ARTWORK_STEP,
    )

    lightRefs.current.forEach((light, slot) => {
      if (!light) {
        return
      }

      const angle =
        (centerIndex + slot - Math.floor(SPOTLIGHT_POOL_SIZE / 2)) *
        ARTWORK_STEP

      setRoomPosition(light.position, angle, SPOTLIGHT_RADIUS, 3.85)
      setRoomPosition(targets[slot].position, angle, ARTWORK_RADIUS, 0.9)
      targets[slot].updateMatrixWorld()
    })
  })

  return targets.map((target, slot) => (
    <spotLight
      key={`spotlight-${slot}`}
      ref={(node) => {
        lightRefs.current[slot] = node
      }}
      target={target}
      color="#f8fcff"
      intensity={21}
      distance={9}
      angle={0.36}
      penumbra={0.9}
      decay={2}
    />
  ))
}

function SpotlightFixture() {
  return (
    <group
      position={[0, 3.88, -(ARTWORK_RADIUS - 2.22)]}
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

function Artwork({ artwork, position, onSelect, disabled }) {
  const groupRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const texture = useTexture(artwork.image)

  const {
    matWidth,
    matHeight,
    frameWidth,
    frameHeight,
    ...dimensions
  } = useMemo(() => getArtworkLayout(texture), [texture])

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

    if (disabled || event.delta > DRAG_THRESHOLD) {
      return
    }

    setHovered(false)
    document.body.style.cursor = 'default'
    onSelect(artwork)
  }

  return (
    <group
      ref={groupRef}
      position={position}
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

    if (disabled || event.delta > DRAG_THRESHOLD) {
      return
    }

    rustleStrengthRef.current = 1
  }

  return (
    <group
      ref={groupRef}
      position={[0, -2.08, -(ARTWORK_RADIUS - 3.35)]}
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

    if (disabled || event.delta > DRAG_THRESHOLD) {
      return
    }

    animationTimeRef.current = 0
    animationActiveRef.current = true
    playMeow()
  }

  return (
    <group
      ref={groupRef}
      position={[0, -2.07, -(ARTWORK_RADIUS - 3.15)]}
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

      <mesh position={[0, -2.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[WALL_RADIUS, 128]} />

        <meshStandardMaterial
          color="#9fb5c0"
          roughness={0.9}
          metalness={0}
        />
      </mesh>

      <mesh position={[0, 1, 0]}>
        <cylinderGeometry
          args={[WALL_RADIUS, WALL_RADIUS, 6.5, 160, 1, true]}
        />

        <meshBasicMaterial color="#d9e8ef" side={THREE.BackSide} />
      </mesh>

      <mesh position={[0, 4.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <circleGeometry args={[WALL_RADIUS, 128]} />

        <meshStandardMaterial
          color="#f6fbfd"
          roughness={0.96}
        />
      </mesh>

      <mesh position={[0, -2.01, 0]}>
        <cylinderGeometry
          args={[
            WALL_RADIUS - 0.08,
            WALL_RADIUS - 0.08,
            0.22,
            160,
            1,
            true,
          ]}
        />

        <meshStandardMaterial
          color="#78909c"
          roughness={0.7}
          side={THREE.BackSide}
        />
      </mesh>

      <mesh position={[0, 4.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[SPOTLIGHT_RADIUS + 0.03, 0.04, 8, 192]} />

        <meshStandardMaterial
          color="#27333c"
          roughness={0.54}
          metalness={0.26}
        />
      </mesh>

      {paintings.map((painting, index) => (
        <group
          key={`fixture-${painting.id}`}
          rotation={[0, -index * ARTWORK_STEP, 0]}
        >
          <SpotlightFixture />
        </group>
      ))}

      <SpotlightPool />

      <group rotation={[0, 1.5 * ARTWORK_STEP, 0]}>
        <InteractivePlant disabled={decorInteractionDisabled} />
      </group>

      <group rotation={[0, -1.5 * ARTWORK_STEP, 0]}>
        <InteractiveCat disabled={decorInteractionDisabled} />
      </group>
    </>
  )
}

function GalleryScene({
  yawTargetRef,
  focusIndex,
  zoomed,
  infoVisible,
  entered,
  onSelect,
}) {
  const focusedIndex = wrapIndex(focusIndex)

  return (
    <>
      <GalleryRoom decorInteractionDisabled={!entered || zoomed} />

      {paintings.map((artwork, index) => (
        <group
          key={artwork.id}
          rotation={[0, -index * ARTWORK_STEP, 0]}
        >
          <Artwork
            artwork={artwork}
            position={[0, CAMERA_HEIGHT, -ARTWORK_RADIUS]}
            onSelect={onSelect}
            disabled={
              !entered || (zoomed && index === focusedIndex)
            }
          />
        </group>
      ))}

      <CameraRig
        yawTargetRef={yawTargetRef}
        focusIndex={focusIndex}
        zoomed={zoomed}
        infoVisible={infoVisible}
      />
    </>
  )
}

function App() {
  // Where the camera should face, in radians. Kept in a ref so dragging and
  // scrolling can steer the camera every frame without re-rendering.
  const yawTargetRef = useRef(0)
  const dragRef = useRef(null)
  const wheelRef = useRef({
    accumulated: 0,
    locked: false,
    idleTimer: null,
    snapTimer: null,
  })
  const infoPanelRef = useRef(null)

  const [assetsReady, setAssetsReady] = useState(false)
  const [entered, setEntered] = useState(false)
  // Unbounded so turning past the last piece keeps rotating the same way;
  // wrapIndex() maps it back onto the paintings array.
  const [focusIndex, setFocusIndex] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const [infoVisible, setInfoVisible] = useState(true)

  const focusedArtwork = paintings[wrapIndex(focusIndex)]
  const browsing = entered && !zoomed

  function focusOn(index) {
    yawTargetRef.current = index * ARTWORK_STEP
    setFocusIndex(index)
  }

  function nearestIndex() {
    return Math.round(yawTargetRef.current / ARTWORK_STEP)
  }

  function step(direction) {
    focusOn(nearestIndex() + direction)
  }

  function openArtwork(artwork) {
    if (!entered) {
      return
    }

    const currentIndex = nearestIndex()

    // Turn the short way around the room to reach the chosen piece.
    let offset =
      wrapIndex(paintings.indexOf(artwork) - wrapIndex(currentIndex))

    if (offset > ARTWORK_COUNT / 2) {
      offset -= ARTWORK_COUNT
    }

    if (!zoomed) {
      setInfoVisible(true)
    }

    focusOn(currentIndex + offset)
    setZoomed(true)
  }

  function closeArtwork() {
    document.body.style.cursor = 'default'
    setZoomed(false)
  }

  function returnToTitleScreen() {
    document.body.style.cursor = 'default'

    focusOn(Math.round(focusIndex / ARTWORK_COUNT) * ARTWORK_COUNT)
    setZoomed(false)
    setEntered(false)
  }

  // Radians of turn per pixel dragged, so the wall tracks the pointer.
  function dragRadiansPerPixel() {
    const viewDistance = zoomed
      ? ZOOMED_VIEW_DISTANCE
      : HOME_VIEW_DISTANCE

    return (
      (2 * viewDistance * TAN_HALF_FOV) /
      (window.innerHeight * ARTWORK_RADIUS)
    )
  }

  function handlePointerDown(event) {
    if (!entered || (event.pointerType === 'mouse' && event.button !== 0)) {
      return
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startYaw: yawTargetRef.current,
      startIndex: nearestIndex(),
      dragging: false,
    }
  }

  function handleWheel(event) {
    if (!entered) {
      return
    }

    const lineScale = event.deltaMode === 1 ? 33 : 1

    const delta =
      (Math.abs(event.deltaX) > Math.abs(event.deltaY)
        ? event.deltaX
        : event.deltaY) * lineScale

    const wheel = wheelRef.current

    if (zoomed) {
      // One gesture moves one piece; momentum scrolling is ignored until the
      // wheel has been still for a moment.
      clearTimeout(wheel.idleTimer)

      wheel.idleTimer = setTimeout(() => {
        wheel.accumulated = 0
        wheel.locked = false
      }, 250)

      if (wheel.locked) {
        return
      }

      wheel.accumulated += delta

      if (Math.abs(wheel.accumulated) >= SWIPE_THRESHOLD) {
        wheel.locked = true
        step(Math.sign(wheel.accumulated))
      }

      return
    }

    yawTargetRef.current += (delta * ARTWORK_STEP) / 100

    clearTimeout(wheel.snapTimer)
    wheel.snapTimer = setTimeout(() => focusOn(nearestIndex()), 160)
  }

  useEffect(() => {
    function handlePointerMove(event) {
      const drag = dragRef.current

      if (!drag || event.pointerId !== drag.pointerId) {
        return
      }

      const deltaX = event.clientX - drag.startX

      if (!drag.dragging && Math.abs(deltaX) > DRAG_THRESHOLD) {
        drag.dragging = true
      }

      if (drag.dragging) {
        yawTargetRef.current =
          drag.startYaw - deltaX * dragRadiansPerPixel()
      }
    }

    function handlePointerUp(event) {
      const drag = dragRef.current

      if (!drag || event.pointerId !== drag.pointerId) {
        return
      }

      dragRef.current = null

      if (!drag.dragging) {
        return
      }

      const deltaX = event.clientX - drag.startX
      let index = nearestIndex()

      // While zoomed in, a short swipe is still enough to move one piece.
      if (
        zoomed &&
        index === drag.startIndex &&
        Math.abs(deltaX) > SWIPE_THRESHOLD
      ) {
        index = drag.startIndex - Math.sign(deltaX)
      }

      focusOn(index)
    }

    function handleKeyDown(event) {
      if (event.repeat || !entered) {
        return
      }

      if (event.key === 'Escape' && zoomed) {
        event.preventDefault()
        closeArtwork()
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        step(-1)
        return
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault()
        step(1)
        return
      }

      if (
        event.key === 'Enter' &&
        !zoomed &&
        document.activeElement === document.body
      ) {
        event.preventDefault()
        openArtwork(focusedArtwork)
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('pointercancel', handlePointerUp)
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('pointercancel', handlePointerUp)
      window.removeEventListener('keydown', handleKeyDown)
    }
  })

  useEffect(() => {
    if (infoPanelRef.current) {
      infoPanelRef.current.scrollTop = 0
    }
  }, [focusIndex])

  return (
    <main className="app">
      <LoadingScreen
        assetsReady={assetsReady}
        entered={entered}
        onEnter={() => setEntered(true)}
      />

      <div
        className="gallery-canvas"
        onPointerDown={handlePointerDown}
        onWheel={handleWheel}
      >
        <Canvas
          dpr={[1, 2]}
          camera={{
            position: [
              0,
              CAMERA_HEIGHT,
              -(ARTWORK_RADIUS - HOME_VIEW_DISTANCE),
            ],
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
              yawTargetRef={yawTargetRef}
              focusIndex={focusIndex}
              zoomed={zoomed}
              infoVisible={infoVisible}
              entered={entered}
              onSelect={openArtwork}
            />
          </Suspense>
        </Canvas>
      </div>

      <AnimatePresence>
        {browsing && (
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
          browsing
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
          browsing
            ? 'page-arrow-visible'
            : ''
        }`}
        onClick={() => step(-1)}
        aria-label="Turn left"
        tabIndex={browsing ? 0 : -1}
      >
        ‹
      </button>

      <button
        type="button"
        className={`page-arrow page-arrow-right ${
          browsing
            ? 'page-arrow-visible'
            : ''
        }`}
        onClick={() => step(1)}
        aria-label="Turn right"
        tabIndex={browsing ? 0 : -1}
      >
        ›
      </button>

      <div
        className={`page-indicator ${
          browsing
            ? 'page-indicator-visible'
            : ''
        }`}
      >
        <span className="page-indicator-count">
          {wrapIndex(focusIndex) + 1} / {ARTWORK_COUNT}
        </span>
        <span className="page-indicator-hint">
          Drag to look around · Tap a piece to view it
        </span>
      </div>

      <footer
        className={`gallery-footer ${
          browsing
            ? 'gallery-footer-visible'
            : ''
        }`}
      >
        Built by Amogh Kapoor — 2026
      </footer>

      <AnimatePresence>
        {zoomed && (
          <motion.div
            className={`viewer-ui ${
              infoVisible ? '' : 'viewer-ui-info-hidden'
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.3,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <button
              type="button"
              className="back-button"
              onClick={closeArtwork}
            >
              <span aria-hidden="true">←</span>
              Back to Gallery
            </button>

            <button
              type="button"
              className="viewer-arrow viewer-arrow-left"
              onClick={() => step(-1)}
              aria-label="Previous artwork"
            >
              ‹
            </button>

            <button
              type="button"
              className="viewer-arrow viewer-arrow-right"
              onClick={() => step(1)}
              aria-label="Next artwork"
            >
              ›
            </button>

            <AnimatePresence initial={false}>
              {infoVisible ? (
                <motion.aside
                  key="artwork-info"
                  ref={infoPanelRef}
                  id="artwork-information"
                  className="artwork-info"
                  aria-labelledby="artwork-info-title"
                  aria-live="polite"
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
                    onClick={() => setInfoVisible(false)}
                    aria-label="Hide artwork information"
                  >
                    ×
                  </button>

                  <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                      key={focusedArtwork.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.18 }}
                    >
                      <p className="info-eyebrow">
                        Artwork {wrapIndex(focusIndex) + 1} of{' '}
                        {ARTWORK_COUNT}
                      </p>

                      <h2 id="artwork-info-title">
                        {focusedArtwork.title}
                      </h2>

                      <p className="artist">
                        By {focusedArtwork.artist}
                      </p>

                      <div className="info-divider" />

                      <p className="info-description">
                        {focusedArtwork.description}
                      </p>

                      {focusedArtwork.amrExplanation && (
                        <div className="amr-note">
                          <p className="amr-note-label">
                            Connection to AMR
                          </p>

                          <p>
                            {focusedArtwork.amrExplanation}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </motion.aside>
              ) : (
                <motion.button
                  key="show-info"
                  type="button"
                  className="show-info-button"
                  onClick={() => setInfoVisible(true)}
                  aria-controls="artwork-information"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.25 }}
                >
                  About This Artwork
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

export default App
