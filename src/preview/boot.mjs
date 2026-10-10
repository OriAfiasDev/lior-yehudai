// Browser entry of the studio's live preview (/_afias/preview.html). #af-root names the
// studio (data-studio, written at build from STUDIO_URL): the preview runtime comes from
// there, and drafts are accepted only from that origin.

import { renderPreview } from './render/preview.mjs';

const root = document.getElementById('af-root');
const studio = root.dataset.studio;

import(`${studio}/kit/v1/preview.js`).then(({ connect }) =>
  connect({ root, render: renderPreview, origins: [new URL(studio).origin] }),
);
