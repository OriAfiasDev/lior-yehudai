// Section registry: content `type` -> template. A new kind of block for the future CMS
// is one new file here plus one line below.

import hero from './hero.mjs';
import reviewHighlights from './review-highlights.mjs';
import worries from './worries.mjs';
import method from './method.mjs';
import steps from './steps.mjs';
import reviewList from './review-list.mjs';
import about from './about.mjs';
import gallery from './gallery.mjs';
import faq from './faq.mjs';
import contact from './contact.mjs';

export const sections = Object.fromEntries(
  [hero, reviewHighlights, worries, method, steps, reviewList, about, gallery, faq, contact].map((s) => [s.type, s]),
);
