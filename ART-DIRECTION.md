# The Keeper of the Cloud Gate / 雲門守望

## Original artwork

A fictional celestial guardian stands at the boundary between earth and an imagined sky. A moon-tipped staff holds the threshold; an offering pearl holds the light. The lotus, cloud scrolls, winding ribbons, and armor translate the reference paintings' movement and ornament into a sculptural composition. This character is original and is not presented as a particular historical deity.

The jade, cinnabar, lapis, rose, and ochre palette and the contrast between stern countenance and flowing ornament came from the supplied paintings. References directly inspected: `5683.JPG`, `5688.JPG`, `5693.JPG`, `5705.JPG`. Images `5688.JPG`, `5693.JPG`, and `5705.JPG` were used as style references for concept generation.

## Technique

Concept: built-in image generation tool. Sculpture: independently authored Three.js procedural geometry, combined by material to reduce draw calls. Overlapping gold-rimmed lamellae surround the torso and skirt; ornaments are raised geometry, not decals. The back has its own medallion and hanging cords. The gallery uses physical materials, environment lighting, shadows, and three lighting treatments.

## Final concept prompt

Use case: stylized-concept. Create one exquisitely detailed original art piece, 'The Keeper of the Cloud Gate', inspired by the attached reference paintings (style and palette references, not copies). Full-body celestial guardian as an elaborate museum-quality carved and enameled sculptural diorama. Frontal slightly three-quarter view. Jade green dignified fierce face with long ink-black mustache and pointed beard, elaborate gilt flame crown and large circular gilded celestial halo behind head/shoulders. Deep lapis blue and cinnabar red lamellar armor, hundreds of little gold-edged overlapping plates, turquoise inset gemstones, large ornamental shoulders, layered skirt and boots. Left hand holds a long upright ceremonial staff crowned with a crescent and floating pearl; right hand cradles a luminous jade orb. Two wide long jade silk ribbons loop dramatically around body in 3D. Standing on a circular double-tier carved lotus pedestal with pink and jade petals, surrounded by sculpted curling auspicious clouds in celadon, antique rose, ochre. Original fantastical character, not a specific named deity. Dark midnight teal void background, atmospheric dust, dramatic warm gold and cool jade museum lighting. Finely engraved raised spiral patterns across metalwork. The composition must look like a tangible 3D sculpture with real thickness, deep layered forms, and richly crafted materials. Entire sculpture including base visible, centered, portrait 2:3, generous dark negative space at edges. No text, no signatures, no UI. Do not reproduce reference borders or labels.

## Revision 2

The existing model was reworked directly toward the generated reference: continuous facial topology, a stern narrow gaze, tapered swept beard locks, curved crown flames, a solid engraved disk behind the head, layered hanging sleeves, more gold lamellae, beast-mask ornaments, inset staff jewels, solid cloud reliefs, and upright pointed lotus petals. Procedural RGBA color textures and tangent-space normal textures supply jade veining, metal wear, and brocade patterns; these are embedded in the GLB. No new image generation was used for this revision.

## Revision 3: reference-directed head

The concept face was used as an unchanged color texture, sampled by custom facial UVs at original pixel landmarks. A dense facial shell supplies actual depth for the nasal bridge and tip, eye sockets, cheeks, muzzle and chin; modeled side surfaces connect it into the skull. The source's baked lighting and finite face resolution remain practical limits. Hair, moustache and beard are separately swept geometry; the crown was rebuilt as a narrower three-tier pierced structure with blue cabochons. No new image was generated or substituted for the explorable head.
