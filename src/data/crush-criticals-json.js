'use strict';

/**
 * Crush Critical Hit Table Data
 */
module.exports = {
  HEAD: [
    { rank: 0, damage: 0, message: 'Love tap upside the [target]\'s head!', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Blow to the head causes the [target]\'s ears to ring!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Hearty smack to the head.', effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'You broke the [target]\'s nose!', effects: ['S4'], wounds: ['R2'] },
    { rank: 4, damage: 20, message: 'Skull cracks in several places.', effects: ['S8'], wounds: ['R3'] },
    { rank: 5, damage: 25, message: 'Solid strike caves the [target]\'s skull in,resulting in instant death!', effects: ['F'], wounds: ['R3'] },
    { rank: 6, damage: 30, message: 'Mighty swing separates head from shoulders.', effects: ['F'], wounds: ['R3'] },
    { rank: 7, damage: 35, message: 'Tremendous blow crushes skull like a ripe melon.', effects: ['F'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Brain driven into neck by mammoth downswing!', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 50, message: 'Incredible blast shatters head into a red spray.', effects: ['F'], wounds: ['R3'] }
  ],
  RIGHT_EYE: [
    { rank: 0, damage: 0, message: 'Swing at the [target]\'s eye catches an eyebrow instead!', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Cut over the [target]\'s right eye.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Strike to the eye clips the eyebrow.', effects: ['S1'], wounds: ['R2'] },
    { rank: 3, damage: 5, message: 'Smack to the eye bursts blood vessels.', effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 10, message: 'Crack to the head swells eye shut.', effects: ['S5'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: 'Eye crushed by a hard blow to the face!', effects: ['S10'], wounds: ['R3'] },
    { rank: 6, damage: 20, message: 'Crushing blow to head closes that eye for good.', effects: ['S12'], wounds: ['R3'] },
    { rank: 7, damage: 40, message: 'Blow to eye impacts the brain. [target] twitches violently, then dies.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 8, damage: 45, message: 'Right eye ripped from head, along with most of brain.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 9, damage: 50, message: 'Smash to cheek driving bone through the eye and into the brain.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] }
  ],
  LEFT_EYE: [
    { rank: 0, damage: 0, message: 'Swing at the [target]\'s eye catches an eyebrow instead!', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Cut over the [target]\'s left eye.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Strike to the eye clips the eyebrow.', effects: ['S1'], wounds: ['R2'] },
    { rank: 3, damage: 5, message: 'Smack to the eye bursts blood vessels.', effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 10, message: 'Crack to the head swells eye shut.', effects: ['S5'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: 'Eye crushed by a hard blow to the face!', effects: ['S10'], wounds: ['R3'] },
    { rank: 6, damage: 20, message: 'Crushing blow to head closes that eye for good.', effects: ['S12'], wounds: ['R3'] },
    { rank: 7, damage: 40, message: 'Blow to eye impacts the brain. [target] twitches violently,then dies.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 8, damage: 45, message: 'Left eye ripped from head, along with most of brain.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 9, damage: 50, message: 'Smash to cheek driving bone through the eye and into the brain.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] }
  ],
  NECK: [
    { rank: 0, damage: 0, message: 'You leave a nice bruise on the [target]\'s neck!', effects: [], wounds: [] },
    { rank: 1, damage: 2, message: 'Whiplash!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 5, message: 'Neck vertebrae snap.', effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 10, message: 'Shot to the neck scrapes away skin. Some nasty bleeding.', effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 12, message: 'Throat nearly crushed. The [target] makes gurgling noises.', effects: ['S6'], wounds: ['R3'] },
    { rank: 5, damage: 15, message: 'Neck broken. The [target] twitches several times before dying.', effects: ['F'], wounds: ['R3'] },
    { rank: 6, damage: 20, message: 'You hear several snaps as the [target]\'s neck is broken in several places.', effects: ['F'], wounds: ['R3'] },
    { rank: 7, damage: 25, message: 'Vertebrae in [target]\'s neck disintegrate from impact! Neck sinks into shoulders.', effects: ['F'], wounds: ['R3'] },
    { rank: 8, damage: 30, message: 'Shot to neck sends [target] into shock which leads very quickly to death.', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: 'Neck removed, head falls to the ground.', effects: ['F'], wounds: ['R3'] }
  ],
  CHEST: [
    { rank: 0, damage: 0, message: 'Thumped the [target]\'s chest.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Blow leaves an imprint on the [target]\'s chest!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Mighty blow cracks several ribs.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Blow to chest causes the [target]\'s heart to skip a beat.', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Whoosh! Several ribs driven into lungs.', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Whoosh! Several ribs driven into lungs.', effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 45, message: 'Awesome shot collapses a lung!', effects: ['S6'], wounds: ['R3'] },
    { rank: 7, damage: 60, message: 'Blow cracks a rib and punctures a lung. Breathing becomes a challenge.', effects: ['S8'], wounds: ['R3'] },
    { rank: 8, damage: 65, message: 'Massive blow punches a hole through the [target]\'s chest!', effects: ['S10'], wounds: ['R3'] },
    { rank: 9, damage: 70, message: 'Massive blow smashes through ribs and drives [target]\'s heart out the back.', effects: ['F'], wounds: ['R3'] }
  ],
  ABDOMEN: [
    { rank: 0, damage: 0, message: 'Hit glances off the [target]\'s hip.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Stomach shot lands with a hollow *thump*.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Grazing blow to the stomach.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Internal organs bruised.', effects: ['S1'], wounds: ['R2'] },
    { rank: 4, damage: 20, message: 'Stomach ripped open by mighty blow!', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Knocked back several feet by blow to abdomen.', effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 30, message: 'Blow ruptures the stomach!', effects: ['S6'], wounds: ['R3'] },
    { rank: 7, damage: 50, message: 'Blow to stomach rearranges some organs!', effects: ['S8'], wounds: ['R3'] },
    { rank: 8, damage: 60, message: 'Incredible smash to what used to be a stomach!', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 75, message: 'A mighty hit turns the [target]\'s insides to outsides!', effects: ['F'], wounds: ['R3'] }
  ],
  BACK: [
    { rank: 0, damage: 0, message: 'Blow glances off the [target]\'s shoulder.', effects: [], wounds: [] },
    { rank: 1, damage: 3, message: 'Jarring blow to the [target]\'s back.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Blow to back cracks several vertebrae.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Respectable shot to the back.', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Flesh ripped from back, muscles exposed.', effects: ['S2'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Knocked sideways several feet by blow to back.', effects: ['S3'], wounds: ['R2'] },
    { rank: 6, damage: 30, message: 'Spinal cord damaged by smash to the back.', effects: ['S5'], wounds: ['R3'] },
    { rank: 7, damage: 50, message: 'Crushing blow to the spine! The [target] slumps to the ground.', effects: ['S6', 'K'], wounds: ['R3'] },
    { rank: 8, damage: 60, message: 'Body pulped to a gooey mass. Watch where you step!', effects: ['F'], wounds: ['R3 Back', 'R3 Nerves'] },
    { rank: 9, damage: 75, message: 'A mighty blow cleaves a swath through the [target]\'s back, taking the spine with it.', effects: ['F'], wounds: ['R3 Back', 'R3 Nerves'] }
  ],
  RIGHT_ARM: [
    { rank: 0, damage: 0, message: 'A feeble blow to the [target]\'s right arm!', effects: [], wounds: [] },
    { rank: 1, damage: 3, message: 'Blow raises a welt on the [target]\'s right arm.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 7, message: 'Bones in right arm crack.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 8, message: 'Large gash to the right arm, several muscles torn.', effects: ['S1'], wounds: ['R2'] },
    { rank: 4, damage: 10, message: 'Right elbow smashed into a thousand pieces.', effects: ['S2'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: 'Weapon arm mangled horribly.', effects: ['S3'], wounds: ['R2'] },
    { rank: 6, damage: 20, message: 'Hard hit shatters weapon arm.', effects: ['S5'], wounds: ['R2'] },
    { rank: 7, damage: 25, message: 'Right arm ripped from socket at the elbow!', effects: ['S6', 'K', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 35, message: 'Lucky shot rips through bone and muscle sending weapon arm flying.', effects: ['S8', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: 'Weapon arm removed at the shoulder!', effects: ['S10', 'A'], wounds: ['R3'] }
  ],
  LEFT_ARM: [
    { rank: 0, damage: 0, message: 'A feeble blow to the [target]\'s left arm!', effects: [], wounds: [] },
    { rank: 1, damage: 3, message: 'Blow raises a welt on the [target]\'s left arm.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 7, message: 'Bones in left arm crack.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 8, message: 'Large gash to the left arm, several muscles torn.', effects: ['S1'], wounds: ['R2'] },
    { rank: 4, damage: 10, message: 'Left elbow smashed into a thousand pieces.', effects: ['S2'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: 'Shield arm mangled horribly.', effects: ['S3'], wounds: ['R2'] },
    { rank: 6, damage: 20, message: 'Hard hit shatters shield arm.', effects: ['S5'], wounds: ['R2'] },
    { rank: 7, damage: 25, message: 'Left arm ripped from socket at the elbow!', effects: ['S6', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 35, message: 'Lucky shot rips through bone and muscle sending shield arm flying.', effects: ['S8', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: 'Shield arm removed at the shoulder!', effects: ['S10', 'A'], wounds: ['R3'] }
  ],
  RIGHT_HAND: [
    { rank: 0, damage: 0, message: 'Blow nicks the [target]\'s right hand.', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Broken finger on the [target]\'s right hand!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Flattened the [target]\'s right hand.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 5, message: 'Finger ripped away from right hand.', effects: [], wounds: ['R1'] },
    { rank: 4, damage: 7, message: 'Right hand smashed into a pulpy mass.', effects: ['S1'], wounds: ['R2'] },
    { rank: 5, damage: 5, message: 'Right hand mangled horribly.', effects: ['S2'], wounds: ['R2'] },
    { rank: 6, damage: 10, message: 'Blast to hand reduces it to pulp!', effects: ['S3'], wounds: ['R2'] },
    { rank: 7, damage: 15, message: 'Blast to hand sends fingers flying in several different directions.', effects: ['S4', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 25, message: 'Lucky shot severs right hand and sends it flying.', effects: ['S5', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 30, message: 'Right hand severed at the wrist!', effects: ['S7', 'A'], wounds: ['R3'] }
  ],
  LEFT_HAND: [
    { rank: 0, damage: 0, message: 'Blow nicks the [target]\'s left hand.', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Broken finger on the [target]\'s left hand!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Flattened the [target]\'s left hand.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 5, message: 'Finger ripped away from left hand.', effects: [], wounds: ['R1'] },
    { rank: 4, damage: 7, message: 'Left hand smashed into a pulpy mass.', effects: ['S1'], wounds: ['R2'] },
    { rank: 5, damage: 8, message: 'Left hand mangled horribly.', effects: ['S2'], wounds: ['R2'] },
    { rank: 6, damage: 10, message: 'Blast to hand reduces it to pulp!', effects: ['S3'], wounds: ['R2'] },
    { rank: 7, damage: 15, message: 'Blast to hand sends fingers flying in several different directions.', effects: ['S4', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 25, message: 'Lucky shot severs left hand and sends it flying.', effects: ['S5', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 30, message: 'Left hand severed at the wrist!', effects: ['S7', 'A'], wounds: ['R3'] }
  ],
  RIGHT_LEG: [
    { rank: 0, damage: 0, message: 'Glancing blow to the [target]\'s right leg!', effects: [], wounds: [] },
    { rank: 1, damage: 7, message: 'Torn muscle in the [target]\'s right leg!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Smash to the kneecap.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'You ripped a chunk out of the [target]\'s right leg with that one.', effects: ['S1'], wounds: ['R2'] },
    { rank: 4, damage: 17, message: 'Right kneecap smashed into pulp.', effects: ['S3', 'K'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: 'Right leg mangled horribly.', effects: ['S5', 'K'], wounds: ['R2'] },
    { rank: 6, damage: 25, message: 'Hard blow breaks the femur!', effects: ['S6', 'K'], wounds: ['R2'] },
    { rank: 7, damage: 30, message: 'Right leg ripped from socket at the knee!', effects: ['S8', 'K', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Lucky shot rips through bone and muscle sending right leg flying.', effects: ['S10', 'K', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 45, message: 'Right hip pulped, severing the leg.', effects: ['S12', 'K', 'A'], wounds: ['R3'] }
  ],
  LEFT_LEG: [
    { rank: 0, damage: 0, message: 'Glancing blow to the [target]\'s left leg!', effects: [], wounds: [] },
    { rank: 1, damage: 7, message: 'Torn muscle in the [target]\'s left leg!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Smash to the kneecap.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'You ripped a chunk out of the [target]\'s left leg with that one.', effects: ['S1'], wounds: ['R2'] },
    { rank: 4, damage: 17, message: 'Left kneecap smashed into pulp.', effects: ['S3', 'K'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: 'Left leg mangled horribly.', effects: ['S5', 'K'], wounds: ['R2'] },
    { rank: 6, damage: 25, message: 'Hard blow breaks the femur!', effects: ['S6', 'K'], wounds: ['R2'] },
    { rank: 7, damage: 30, message: 'Left leg ripped from socket at the knee!', effects: ['S8', 'K', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Lucky shot rips through bone and muscle sending left leg flying.', effects: ['S10', 'K', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 45, message: 'Left hip pulped, severing the leg.', effects: ['S12', 'K', 'A'], wounds: ['R3'] }
  ]
};

