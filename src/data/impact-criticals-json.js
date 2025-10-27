'use strict';

/**
 * Impact Critical Hit Table Data
 */
module.exports = {
  HEAD: [
    { rank: 0, damage: 0, message: 'Blow grazes cheek.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Brushing blow to temple.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Strike to head breaks cheekbone.', effects: ['S1'], wounds: ['R2'] },
    { rank: 3, damage: 15, message: 'Nice blow to head! The [target] looks dazed!', effects: ['S4'], wounds: ['R2'] },
    { rank: 4, damage: 20, message: 'Good blow to head!', effects: ['S8'], wounds: ['R3'] },
    { rank: 5, damage: 25, message: 'Strong shot to head messes up brain fatally.', effects: ['F'], wounds: ['R3'] },
    { rank: 6, damage: 30, message: 'Hard blow to temple scrambles brain!', effects: ['F'], wounds: ['R3'] },
    { rank: 7, damage: 35, message: 'Massive blow to temple drops the [target] in his tracks!', effects: ['F'], wounds: ['R3'] },
    { rank: 8, damage: 45, message: 'Strike to temple cracks skull open!', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 50, message: 'Blow to head removes skull!', effects: ['F'], wounds: ['R3'] }
  ],
  NECK: [
    { rank: 0, damage: 0, message: 'Blow just brushes neck.', effects: [], wounds: [] },
    { rank: 1, damage: 2, message: 'Blow grazes neck lightly.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 5, message: 'Blow to neck tears tissue.', effects: ['S1'], wounds: ['R2'] },
    { rank: 3, damage: 15, message: 'Nice blow to neck!', effects: ['S3'], wounds: ['R3'] },
    { rank: 4, damage: 12, message: 'Good blow to neck! Something snaps!', effects: ['S6'], wounds: ['R3'] },
    { rank: 5, damage: 15, message: 'Strong blow breaks neck!', effects: ['F'], wounds: ['R3'] },
    { rank: 6, damage: 20, message: 'Hard blow to neck loosens head on shoulders. Quite fatal!', effects: ['F'], wounds: ['R3'] },
    { rank: 7, damage: 25, message: 'Massive blow to neck snaps it!', effects: ['F'], wounds: ['R3'] },
    { rank: 8, damage: 30, message: 'Blow shatters bones in the [target]\'s neck leaving its head hanging loosely!', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: 'Strike to the [target]\'s throat removes it!', effects: ['F'], wounds: ['R3'] }
  ],
  RIGHT_EYE: [
    { rank: 0, damage: 0, message: 'Strike catches eyebrow narrowly missing right eye!', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Strike hits close to the right eye!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Blow connects right below right eye!', effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 5, message: 'Glancing blow to right eye scratches cornea!', effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 10, message: 'Blow to the eye swells it shut!', effects: ['S5'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: 'Blow to right eye destroys it!', effects: ['S10'], wounds: ['R3'] },
    { rank: 6, damage: 20, message: 'Hard strike to right eye pops it!', effects: ['S12'], wounds: ['R3'] },
    { rank: 7, damage: 40, message: 'Massive blow to right eye sending bone back into the brain!', effects: ['F'], wounds: ['R3 Eye', 'R3 Head'] },
    { rank: 8, damage: 45, message: 'Poke to the right eye continues into the brain!', effects: ['F'], wounds: ['R3 Eye', 'R3 Head'] },
    { rank: 9, damage: 50, message: 'Hard strike removes the right eye and a goodly bit of skull!', effects: ['F'], wounds: ['R3 Eye', 'R3 Head'] }
  ],
  LEFT_EYE: [
    { rank: 0, damage: 0, message: 'Strike catches eyebrow narrowly missing left eye!', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Strike hits close to the left eye!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Blow connects right below left eye!', effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 5, message: 'Glancing blow to left eye scratches cornea!', effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 10, message: 'Blow to the eye swells it shut!', effects: ['S5'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: 'Blow to left eye destroys it!', effects: ['S10'], wounds: ['R3'] },
    { rank: 6, damage: 20, message: 'Hard strike to left eye pops it!', effects: ['S12'], wounds: ['R3'] },
    { rank: 7, damage: 40, message: 'Massive blow to left eye sending bone back into the brain!', effects: ['F'], wounds: ['R3 Eye', 'R3 Head'] },
    { rank: 8, damage: 45, message: 'Poke to the left eye continues into the brain!', effects: ['S16'], wounds: ['R3'] },
    { rank: 9, damage: 50, message: 'Hard strike removes the left eye and a goodly bit of skull!', effects: ['F'], wounds: ['R3 Eye', 'R3 Head'] }
  ],
  CHEST: [
    { rank: 0, damage: 0, message: 'Strike connects lightly with chest.', effects: [], wounds: [] },
    { rank: 1, damage: 3, message: 'Light strike to chest.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 5, message: 'Strike glances off the chest.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Nice blow to chest!', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Good blow to chest!', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Strong blow to chest!', effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 35, message: 'Hard blow to chest breaking ribs! Hard to breathe!', effects: ['S6'], wounds: ['R3'] },
    { rank: 7, damage: 50, message: 'Massive blow to chest collapses sternum!', effects: ['S8'], wounds: ['R3'] },
    { rank: 8, damage: 60, message: 'Blow to chest frees a rib to spear a lung and heart!', effects: ['S10'], wounds: ['R3'] },
    { rank: 9, damage: 70, message: 'Strike to chest causes a large gaping hole!', effects: ['F'], wounds: ['R3'] }
  ],
  ABDOMEN: [
    { rank: 0, damage: 0, message: 'Pathetic attack to the abdomen.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Blow connects with abdomen.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Light strike to abdomen.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Nice blow to abdomen!', effects: ['S1'], wounds: ['R2'] },
    { rank: 4, damage: 20, message: 'Good blow to the abdomen!', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Strong blow to abdomen!', effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 35, message: 'Hard blow to abdomen looks painful!', effects: ['S6'], wounds: ['R3'] },
    { rank: 7, damage: 50, message: 'Massive blow to abdomen!', effects: ['S8'], wounds: ['R3'] },
    { rank: 8, damage: 60, message: 'Strike to abdomen ruptures internal organs!', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 70, message: 'Blow to abdomen breaks the [target] almost in two!', effects: ['F'], wounds: ['R3'] }
  ],
  BACK: [
    { rank: 0, damage: 0, message: 'Strike brushes back.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Blow to back connects lightly.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Light blow to back.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Nice blow to back!', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Good blow to back!', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: 'Strong blow to back!', effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 35, message: 'Hard blow to the [target]\'s back causes it to cry out in pain!', effects: ['S6'], wounds: ['R3'] },
    { rank: 7, damage: 50, message: 'Massive blow to back separates vertebrae!', effects: ['S8', 'K'], wounds: ['R3'] },
    { rank: 8, damage: 60, message: 'Blow to back crushes spinal column. Talk about no backbone!', effects: ['F'], wounds: ['R3 back', 'R3 nerves'] },
    { rank: 9, damage: 70, message: 'Blow to back removes the spinal column!', effects: ['F'], wounds: ['R3 back', 'R3 nerves'] }
  ],
  RIGHT_ARM: [
    { rank: 0, damage: 0, message: 'Blow reddens skin on the right arm.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Blow grazes right arm lightly.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 7, message: 'Light blow to right arm.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 8, message: 'Nice blow to right arm.', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 10, message: 'Good blow to right arm!', effects: ['S2'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: 'Strong blow to right arm breaks it!', effects: ['S3'], wounds: ['R2'] },
    { rank: 6, damage: 20, message: 'Hard strike to right arm breaking tendons and bone!', effects: ['S5'], wounds: ['R2'] },
    { rank: 7, damage: 25, message: 'Massive blow removes the [target]\'s right forearm at the elbow!', effects: ['S6', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 35, message: 'Right arm is torn from shoulder!', effects: ['S8', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: 'Every bone in the right arm shattered and scattered about!', effects: ['S10', 'A'], wounds: ['R3'] }
  ],
  LEFT_ARM: [
    { rank: 0, damage: 0, message: 'Blow reddens skin on the left arm.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Blow grazes left arm lightly.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 7, message: 'Light blow to left arm.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 8, message: 'Nice blow to left arm!', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 10, message: 'Good blow to left arm!', effects: ['S2'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: 'Strong blow to left arm breaks it!', effects: ['S3'], wounds: ['R2'] },
    { rank: 6, damage: 20, message: 'Hard strike to left arm breaking tendons and bone!', effects: ['S5'], wounds: ['R2'] },
    { rank: 7, damage: 25, message: 'Massive blow removes the [target]\'s left forearm at the elbow!', effects: ['S6', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 35, message: 'Left arm is torn from shoulder!', effects: ['S8', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: 'Every bone in the left arm shattered and scattered about!', effects: ['S10', 'A'], wounds: ['R3'] }
  ],
  RIGHT_HAND: [
    { rank: 0, damage: 0, message: 'Fingernail chipped on right hand.', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Stubs right hand finger.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Brushing blow to right hand.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 5, message: 'Nice blow to right hand!', effects: [], wounds: ['R1'] },
    { rank: 4, damage: 7, message: 'Good blow to right hand!', effects: ['S1'], wounds: ['R2'] },
    { rank: 5, damage: 8, message: 'Strong blow to right hand breaks it!', effects: ['S2'], wounds: ['R2'] },
    { rank: 6, damage: 10, message: 'Hard blow to right hand breaking bones!', effects: ['S3'], wounds: ['R2'] },
    { rank: 7, damage: 15, message: 'Massive blow to right hand crushing it to pulp!', effects: ['S4', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 25, message: 'Blow removes the [target]\'s right hand neatly!', effects: ['S5', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 30, message: 'Impact removes the right hand in a spray of red mist!', effects: ['S7', 'A'], wounds: ['R3'] }
  ],
  LEFT_HAND: [
    { rank: 0, damage: 0, message: 'Fingernail chipped on left hand.', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Stubs left hand finger.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Brushing blow to left hand.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 5, message: 'Nice blow to left hand!', effects: [], wounds: ['R1'] },
    { rank: 4, damage: 7, message: 'Good blow to left hand!', effects: ['S1'], wounds: ['R2'] },
    { rank: 5, damage: 8, message: 'Strong blow to left hand breaks it!', effects: ['S2'], wounds: ['R2'] },
    { rank: 6, damage: 10, message: 'Hard blow to left hand breaking bones!', effects: ['S3'], wounds: ['R2'] },
    { rank: 7, damage: 15, message: 'Massive blow to left hand crushing it to pulp!', effects: ['S4', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 25, message: 'Blow removes the [target]\'s left hand neatly!', effects: ['S5', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 30, message: 'Impact removes the left hand in a spray of red mist!', effects: ['S7', 'A'], wounds: ['R3'] }
  ],
  RIGHT_LEG: [
    { rank: 0, damage: 0, message: 'Blow bounces off the right leg.', effects: [], wounds: [] },
    { rank: 1, damage: 7, message: 'Blow grazes right leg.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Light blow to right leg.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Nice blow to right leg!', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 17, message: 'Good blow to right leg!', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: 'Strong blow to right leg breaks it!', effects: ['S5', 'K'], wounds: ['R2'] },
    { rank: 6, damage: 25, message: 'Hard strike to right leg breaking tendons and bone!', effects: ['S6', 'K'], wounds: ['R2'] },
    { rank: 7, damage: 30, message: 'Massive blow removes the [target]\'s right foot!', effects: ['S8', 'K', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Blow to leg severs the Achilles tendon along with the rest of the leg!', effects: ['S10', 'K', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 45, message: 'Right leg collapses as the bones turn to dust!', effects: ['S12', 'K', 'A'], wounds: ['R3'] }
  ],
  LEFT_LEG: [
    { rank: 0, damage: 0, message: 'Blow bounces off the left leg.', effects: [], wounds: [] },
    { rank: 1, damage: 7, message: 'Blow grazes left leg.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Light blow to left leg.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Nice blow to left leg!', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 17, message: 'Good blow to left leg!', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: 'Strong blow to left leg breaks it!', effects: ['S5', 'K'], wounds: ['R2'] },
    { rank: 6, damage: 25, message: 'Hard strike to left leg breaking tendons and bone!', effects: ['S6', 'K'], wounds: ['R2'] },
    { rank: 7, damage: 30, message: 'Massive blow removes the [target]\'s left foot!', effects: ['S8', 'K', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Blow to leg severs the Achilles tendon along with the rest of the leg!', effects: ['S10', 'K', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 45, message: 'Left leg collapses as the bones turn to dust!', effects: ['S12', 'K', 'A'], wounds: ['R3'] }
  ]
};

