# The Keeper of the Cloud Gate

An original celestial guardian artwork and an explorable Three.js sculpture, inspired by the traditional Chinese guardian paintings in `../reference-images/`.

## Run

```sh
cd /Users/mandy/Documents/zx/3d-trad-chinese-art/3d
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:5176). The app requires WebGL 2. Serve it through Vite rather than opening `index.html` directly.

## Explore

- Drag to orbit; scroll or pinch to zoom; right-drag or two-finger drag to pan.
- Five camera views: complete work, crown and face, armor, lotus pedestal, reverse.
- Gallery, moonlit, and dawn lighting.
- Optional slow rotation, floating clouds and dust, cloud visibility, and wireframe.
- Save the current camera view as a PNG or download the portable GLB.
- Keyboard: **R** reset, **W** wireframe, **Space** pause atmosphere. Reduced-motion preferences disable the initial atmosphere animation.

## Art and model

- `public/artwork/cloud-gate-concept.png` — original concept artwork, generated with the built-in image generation tool using three supplied paintings as references.
- `public/models/cloud-gate.glb` — standalone 3D sculpture; approximately 1.27 million triangles and approximately 54 MB. Importable into Blender or any glTF 2.0 viewer.
- `src/sculpture.js` — editable procedural model source. Fully volumetric guardian, layered lamellar armor, sculpted face and fingers, crown, staff, offering pearl, celestial rings, lotus dais, swirling clouds, and curved ribbon surfaces.
- `src/carving.js` — continuous face, tapered beard locks, curved drapery, relief ornaments, and baked vertex patina.
- `src/materials.js` — local procedural color and normal textures, embedded in the GLB.
- `versions/v1/` — preserved first-version modeling source and preview.
- `src/main.js` — Three.js gallery, camera controls, lights, animation, and capture.
- `ART-DIRECTION.md` — concept, source references, and generation prompt.

The model is a stylized procedural interpretation of the concept, not an automatic reconstruction of the generated image. The portable GLB contains the static sculpture and materials; gallery lighting, controls, and floating atmosphere are supplied by the viewer. Ribbons are double-sided surfaces; this is a visualization model, not a watertight 3D-print file.

## Build and validate

```sh
npm run export-model  # regenerate GLB after modeling changes
npm run check         # finite geometry/normals, bounds, and GLB structure
npm run build         # output production viewer to dist/
npm run preview       # inspect the production build locally
```

Dependencies are pinned in `package-lock.json`. The model and concept artwork are local. Optional Google Fonts fall back to system fonts if offline. The viewer is built using the official Three.js [OrbitControls](https://threejs.org/docs/pages/OrbitControls.html) and [GLTFExporter](https://threejs.org/docs/pages/GLTFExporter.html).

## Reference-directed revision

The revised sculpture follows the supplied concept more closely through a solid carved aureole, a narrower gaze, sweeping beard, curved flame crown, broad layered robes, beast-mask armor, gold lamellae, marble-like jade, brocade textures, and upright lotus petals. The staff is on the viewer’s right. This remains a stylized interpretation; the supplied concept’s lifelike anatomy and very fine ornament have not been reproduced exactly.

Validation includes geometry checks, production build, browser camera and presentation controls, mobile overflow, and reloading the exported GLB with all material maps. `scripts/browser-check.mjs` uses a dedicated local Chrome debugging instance on port 9223; run with Node 20’s `--experimental-websocket` flag.

### Head and stability revision 2.1

The face now has a separate matte olive skin material, shaped orbital sockets, stronger cheek and nasal relief, a downturned moustache, and a denser curved beard. The viewport shows `V2.1` and supports an actual V1/V2 model switch at the same camera position. Overlapping torso and shoulder armor rows now have distinct depth offsets, and a duplicate forearm surface was removed. The figure’s point light remains constant, and floating clouds no longer cast moving shadows over the body.

### Reference head revision 3

The new head uses a dense, curved facial mesh with a modeled nose, eye sockets, cheek planes, lips, side closure and skull. Its custom UV coordinates sample the **unchanged original concept image** to preserve the exact facial expression and coloration. This is reference-projected texturing on a three-dimensional surface; some lighting is baked into the source image, and its limited face resolution is visible at very close zoom. It is not a recovered production sculpt or a promise of an exact reconstruction from all angles.

Temple hair, moustache, beard, ears, rear hair and a rebuilt three-tier crown are separate modeled forms. New close-ups: `public/artwork/head-v3-front.png`, `head-v3-three-quarter.png`, and `head-v3-exported.png`. The previous V2.1 head source and preview are preserved in `versions/v2.1/`.

The dedicated preview port is now **5176** because 5173 is used by another project. Open `http://127.0.0.1:5176/?view=crown&revision=3` for the head view. The page identifies itself as **V3 · 参考头部**.
