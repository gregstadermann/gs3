'use strict';

/**
 * Lightning Critical Hit Table Data
 */
module.exports = {
  HEAD: [
    { rank: 0, damage: 0, message: 'Hair stands on end. Neat effect.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Light shock to head. That stings!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 15, message: 'Shocking jolt to forehead. Painful.', effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Nasty shock to the head. The [target] looks dazed and confused.', effects: ['S4'], wounds: ['R2'] },
    { rank: 4, damage: 20, message: 'Painfully bright jolt to head leaves ears glowing.', effects: ['S8'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Horrid jolt to forehead amplifies brain waves. You hear the [target] scream in your head.', effects: ['S10'], wounds: ['R3'] },
    { rank: 6, damage: 30, message: 'Horrifying jolt to forehead. Brain explodes in a stunning display of light!', effects: ['F'], wounds: ['R3'] },
    { rank: 7, damage: 35, message: 'Spectacular arc of electricity enters one ear and comes out the other. Instant death.', effects: ['F'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Massive electrical shock turns head into shark bait. Time to feed the fish.', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 50, message: 'Horrifying electrical shock converts head into blood-stained glass. Death is a step up.', effects: ['F'], wounds: ['R3'] }
  ],
  NECK: [
    { rank: 0, damage: 0, message: 'Tiny sparks around neck. Pretty.', effects: [], wounds: [] },
    { rank: 1, damage: 2, message: 'Light shock to neck. That stings!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 5, message: 'Shocking jolt to neck. Painful.', effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 10, message: 'Nasty shock to the neck. Gonna be stiff for awhile.', effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 12, message: 'Painfully bright jolt to neck explodes surrounding skin. Nasty!', effects: ['S4'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: 'Horrid jolt to neck explodes vocal cords. The [target] gurgles in response.', effects: ['S8'], wounds: ['R3'] },
    { rank: 6, damage: 20, message: 'Terrible shock to neck fuses larynx shut. A painful death follows.', effects: ['F'], wounds: ['R3'] },
    { rank: 7, damage: 25, message: 'Explosive bolt of electricity vaporized neck. Head drops to shoulders then on ground. Never knew what hit \'em.', effects: ['F'], wounds: ['R3'] },
    { rank: 8, damage: 30, message: 'Arcing bolt of electricity snaps through neck as if it wasn\'t there and now it really isn\'t. Instant Death.', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: 'Surprisingly large electrical arc destroys neck and moves up around head making a flashy halo. Rather classical death occurs.', effects: ['F'], wounds: ['R3'] }
  ],
  RIGHT_EYE: [
    { rank: 0, damage: 0, message: 'Tiny sparks around right eye. The [target] blinks in surprise.', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Light shock to right eye. Bet that stung.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Heavy spark to right eye causes tears and redness.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 5, message: 'Nasty jolt to right eye causes eyelid to split. Gross!', effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 10, message: 'Heavy shock to right eye bursts a few blood vessels. Sick.', effects: ['S5'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: 'Heavy jolt to right eye chars the optic nerve. Now that\'s pain!', effects: ['S10'], wounds: ['R3'] },
    { rank: 6, damage: 30, message: 'Great bolt of electricity pierces right eye and fries brain till dead.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 7, damage: 40, message: 'Right eye socket explodes in a dazzling array of multi-colored sparks. Shocking death.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 8, damage: 45, message: 'Sudden blast of electricity sends right eye flying to the ground! Death from shock results.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 9, damage: 50, message: 'Immense electrical bolt finds right eye the perfect conductor to ground out in. A shocking death indeed.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] }
  ],
  LEFT_EYE: [
    { rank: 0, damage: 0, message: 'Tiny sparks around left eye. The [target] blinks in surprise.', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Light shock to left eye. Bet that stung.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Heavy spark to left eye causes tears and redness.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 5, message: 'Nasty jolt to left eye causes eyelid to split. Gross!', effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 10, message: 'Heavy shock to left eye bursts a few blood vessels. Sick.', effects: ['S5'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: 'Heavy jolt to left eye severs optic nerve. Now that\'s pain!', effects: ['S10'], wounds: ['R3'] },
    { rank: 6, damage: 30, message: 'Great bolt of electricity pierces left eye and fries brain till dead.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 7, damage: 40, message: 'Left eye socket explodes in a dazzling array of multi-colored sparks. Shocking death.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 8, damage: 45, message: 'Sudden blast of electricity sends left eye flying to the ground! Death from shock results.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 9, damage: 50, message: 'Immense electrical bolt finds left eye the perfect conductor to ground out in. A shocking death indeed.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] }
  ],
  CHEST: [
    { rank: 0, damage: 0, message: 'Tiny sparks around chest. Almost tickles.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Light shock to chest. That stings!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Heavy spark to chest. Bet that hurts.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Heavy shock to chest illuminates ribcage. Cool!', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Nasty jolt to chest causes heart to skip a beat!', effects: ['S3'], wounds: ['R1'] },
    { rank: 5, damage: 25, message: 'Heavy jolt to chest causes solar plexus to explode. Remarkable display of spraying blood.', effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 30, message: 'Horrid jolt of electricity shatters ribs in a sickening flash of light!', effects: ['S6'], wounds: ['R2'] },
    { rank: 7, damage: 50, message: 'Massive electrical shock to chest tears through muscle tissue.', effects: ['S8'], wounds: ['R3'] },
    { rank: 8, damage: 60, message: 'Horrifying jolt of electricity fries chest to a crisp. Toasty!', effects: ['S10'], wounds: ['R3'] },
    { rank: 9, damage: 70, message: 'Horrifying bolt of electricity turns chest into a smoking pulp of flesh. No life left there.', effects: ['F'], wounds: ['R3'] }
  ],
  ABDOMEN: [
    { rank: 0, damage: 0, message: 'Tiny sparks dance around belly. Cool!', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Light shock to abdomen. That stings!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Heavy spark to abdomen. Bet that hurts.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Heavy shock to abdomen blackens skin. Ick.', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Nasty jolt to abdomen makes a [target]\'s stomach turn. Urp.', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Heavy jolt to abdomen causes skin to break open exposing liver. Yuck!', effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 30, message: 'Horrid jolt of electricity illuminates kidneys!', effects: ['S6'], wounds: ['R2'] },
    { rank: 7, damage: 50, message: 'Massive electrical shock to abdomen turns muscle tissue into a crispy bubbled mess. Not pretty.', effects: ['S8'], wounds: ['R3'] },
    { rank: 8, damage: 60, message: 'Horrifying jolt of electricity fries abdomen to a crisp. Upper torso falls to the ground. Talk about repugnant!', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 70, message: 'Horrifying bolt of electricity crystalizes abdominal area. Spiffy but unfortunately also quite deadly.', effects: ['F'], wounds: ['R3'] }
  ],
  BACK: [
    { rank: 0, damage: 0, message: 'Static discharge to back. Doesn\'t hurt, much.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Light shock to back. That stings!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Heavy spark to back. Bet that hurts.', effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Arcing strand of electricity jolts across a [target]\'s back. Pretty.', effects: ['S2'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Nasty jolt to back fuses a few vertebrae. Definitely uncomfortable.', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Heavy jolt to back shoots up spine. Sympathetic pains almost as bad.', effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 30, message: 'Horrid jolt of electricity smokes a shoulder blade!', effects: ['S7'], wounds: ['R3'] },
    { rank: 7, damage: 50, message: 'Massive electrical shock to back. Won\'t be bending over for awhile.', effects: ['S8'], wounds: ['R3'] },
    { rank: 8, damage: 60, message: 'Terrifying electrical arc destroys spinal column one vertebra at a time!', effects: ['F'], wounds: ['R3 back', 'R3 nerves'] },
    { rank: 9, damage: 70, message: 'Massive electrical bolt burns a hole through the back and kidneys.', effects: ['F'], wounds: ['R3 back', 'R3 nerves'] }
  ],
  RIGHT_ARM: [
    { rank: 0, damage: 0, message: 'Static discharge to right arm. Almost tickles.', effects: [], wounds: [] },
    { rank: 1, damage: 3, message: 'Light shock to right arm. That stings!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 7, message: 'Heavy spark to right arm. Gonna hurt tomorrow.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 8, message: 'Visible wisps of electricity shoot up right arm. Youch!', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 10, message: 'Heavy shock to right arm numbs elbow.', effects: ['S2'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: 'Nasty shock to right arm stiffens joints. Nice and painful.', effects: ['S3'], wounds: ['R2'] },
    { rank: 6, damage: 20, message: 'Stunning arc of electricity fuses right arm at elbow.', effects: ['S5'], wounds: ['R2'] },
    { rank: 7, damage: 25, message: 'Massive electrical shock to the right arm destroys flesh. What remains is useless.', effects: ['S6', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 35, message: 'Arcing bolt of electricity galvanizes right arm to elbow. Won\'t be using it for awhile.', effects: ['S8', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: 'Hideously bright electrical bolt sends right arm into another universe. Happy traveling.', effects: ['S10', 'A'], wounds: ['R3'] }
  ],
  LEFT_ARM: [
    { rank: 0, damage: 0, message: 'Static discharge to left arm. Almost tickles.', effects: [], wounds: [] },
    { rank: 1, damage: 3, message: 'Light shock to left arm. That stings!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 7, message: 'Heavy spark to left arm. Gonna hurt tomorrow.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 8, message: 'Visible wisps of electricity shoot up left arm. Youch!', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 10, message: 'Heavy shock to left arm numbs elbow.', effects: ['S2'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: 'Nasty shock to left arm stiffens joints. Nice and painful.', effects: ['S3'], wounds: ['R2'] },
    { rank: 6, damage: 20, message: 'Stunning arc of electricity fuses left arm at elbow.', effects: ['S5'], wounds: ['R2'] },
    { rank: 7, damage: 25, message: 'Massive electrical shock to the left arm destroys flesh. What remains is useless.', effects: ['S6', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 35, message: 'Arcing bolt of electricity galvanizes left arm to elbow. Won\'t be using it for awhile.', effects: ['S9', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: 'Hideously bright electrical bolt sends left arm into another universe. Happy traveling.', effects: ['S10', 'A'], wounds: ['R3'] }
  ],
  RIGHT_HAND: [
    { rank: 0, damage: 0, message: 'Static discharge to right hand. Kinda tickles.', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Light shock to right hand. Fingers tingle.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Heavy spark to right hand. Bet that hurts.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 5, message: 'Shocking jolt to right hand stiffens skin around knuckles.', effects: [], wounds: ['R1'] },
    { rank: 4, damage: 7, message: 'Heavy shock to right hand. Fingers go numb.', effects: ['S1'], wounds: ['R2'] },
    { rank: 5, damage: 8, message: 'Nasty shock to right hand stiffens fingers. Nice and painful.', effects: ['S2'], wounds: ['R2'] },
    { rank: 6, damage: 10, message: 'Stunning arc of electricity fuses right hand at wrist.', effects: ['S3'], wounds: ['R2'] },
    { rank: 7, damage: 15, message: 'Massive electrical shock to the right hand destroys flesh. What remains is useless.', effects: ['S3', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 25, message: 'Arcing bolt of electricity galvanizes right hand to elbow. Won\'t be using it for awhile.', effects: ['S5', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 30, message: 'Hideously bright electrical bolt sends right hand into another universe. Happy traveling.', effects: ['S6', 'A'], wounds: ['R3'] }
  ],
  LEFT_HAND: [
    { rank: 0, damage: 0, message: 'Static discharge to left hand. Kinda tickles.', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Light shock to left hand. Fingers tingle.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Heavy spark to left hand. Bet that hurts.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 5, message: 'Shocking jolt to left hand stiffens skin around knuckles.', effects: [], wounds: ['R1'] },
    { rank: 4, damage: 7, message: 'Heavy shock to left hand. Fingers go numb.', effects: ['S1'], wounds: ['R2'] },
    { rank: 5, damage: 8, message: 'Nasty shock to left hand stiffens fingers. Nice and painful.', effects: ['S2'], wounds: ['R2'] },
    { rank: 6, damage: 10, message: 'Stunning arc of electricity fuses left hand at wrist.', effects: ['S3'], wounds: ['R2'] },
    { rank: 7, damage: 15, message: 'Massive electrical shock to the left hand destroys flesh. What remains is useless.', effects: ['S3', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 25, message: 'Arcing bolt of electricity galvanizes left hand to elbow. Won\'t be using it for awhile.', effects: ['S5', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 30, message: 'Hideously bright electrical bolt sends left hand into another universe. Happy traveling.', effects: ['S6', 'A'], wounds: ['R3'] }
  ],
  RIGHT_LEG: [
    { rank: 0, damage: 0, message: 'Static discharge to right leg. Doesn\'t hurt, much.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Light shock to right leg. That stings!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Heavy spark to right leg. The [target] cringes in surprise.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Visible wisps of electricity shoot up right leg. Youch!', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 17, message: 'Heavy shock to right leg. Gonna limp for awhile.', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: 'Nasty shock to right leg stiffens joints. Nice and painful.', effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 25, message: 'Stunning arc of electricity fuses right leg at knee.', effects: ['S6', 'K'], wounds: ['R2'] },
    { rank: 7, damage: 30, message: 'Massive electrical shock to the right leg destroys flesh. What remains is useless.', effects: ['S8', 'A', 'K'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Arcing bolt of electricity galvanizes right leg to knee joint. Won\'t be using it for awhile.', effects: ['S10', 'A', 'K'], wounds: ['R3'] },
    { rank: 9, damage: 45, message: 'Hideously bright electrical bolt sends right leg into another universe. Happy traveling.', effects: ['S12', 'A', 'K'], wounds: ['R3'] }
  ],
  LEFT_LEG: [
    { rank: 0, damage: 0, message: 'Static discharge to left leg. Doesn\'t hurt, much.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Light shock to left leg. That stings!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Heavy spark to left leg. The [target] cringes in surprise.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Visible wisps of electricity shoot up left leg. Youch!', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 17, message: 'Heavy shock to left leg. Gonna limp for awhile.', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: 'Nasty shock to left leg stiffens joints. Nice and painful.', effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 25, message: 'Stunning arc of electricity fuses left leg at knee.', effects: ['S6', 'K'], wounds: ['R2'] },
    { rank: 7, damage: 30, message: 'Massive electrical shock to the left leg destroys flesh. What remains is useless.', effects: ['S8', 'A', 'K'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Arcing bolt of electricity galvanizes left leg to knee joint. Won\'t be using it for awhile.', effects: ['S10', 'A', 'K'], wounds: ['R3'] },
    { rank: 9, damage: 45, message: 'Hideously bright electrical bolt sends left leg into another universe. Happy traveling.', effects: ['S7', 'A', 'K'], wounds: ['R3'] }
  ]
};

