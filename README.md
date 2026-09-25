# The Keeper of the Cloud Gate

An original celestial guardian artwork and an explorable Three.js sculpture, inspired by the traditional Chinese guardian paintings in `../reference-images/`.

## Run

```sh
cd /Users/mandy/Documents/zx/3d-trad-chinese-art/3d
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:5173). The app requires WebGL 2. Serve it through Vite rather than opening `index.html` directly.

## Explore

- Drag to orbit; scroll or pinch to zoom; right-drag or two-finger drag to pan.
- Five camera views: complete work, crown and face, armor, lotus pedestal, reverse.
- Gallery, moonlit, and dawn lighting.
- Optional slow rotation, floating clouds and dust, cloud visibility, and wireframe.
- Save the current camera view as a PNG or download the portable GLB.
- Keyboard: **R** reset, **W** wireframe, **Space** pause atmosphere. Reduced-motion preferences disable the initial atmosphere animation.

## Art and model

- `public/artwork/cloud-gate-concept.png` — original concept artwork, generated with the built-in image generation tool using three supplied paintings as references.
- `public/models/cloud-gate.glb` — standalone 3D sculpture; approximately 395,000 triangles and 27.2 MB. Importable into Blender or any glTF 2.0 viewer.
- `src/sculpture.js` — editable procedural model source. Fully volumetric guardian, layered lamellar armor, sculpted face and fingers, crown, staff, offering pearl, celestial rings, lotus dais, swirling clouds, and curved ribbon surfaces.
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
