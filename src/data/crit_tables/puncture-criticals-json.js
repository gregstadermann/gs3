'use strict';

/**
 * Puncture Critical Hit Table Data
 */
module.exports = {
  HEAD: [
    { rank: 0, damage: 0, message: 'Thrust catches chin. Leaves an impression but no cut.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Glancing strike to the head!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 8, message: 'Nice shot to the head gouges the [target]\'s cheek!', effects: ['S2'], wounds: ['R2'] },
    { rank: 3, damage: 10, message: 'Beautiful head shot! That ear will be missed!', effects: ['S5'], wounds: ['R2'] },
    { rank: 4, damage: 15, message: 'Strike to temple! Saved by thick skull!', effects: ['S7'], wounds: ['R3'] },
    { rank: 5, damage: 20, message: 'Beautiful shot pierces skull! Amazing the [target] wasn\'t killed outright!', effects: ['S10'], wounds: ['R3'] },
    { rank: 6, damage: 25, message: 'Amazing shot through the [target]\'s nose enters the brain!', effects: ['F'], wounds: ['R3'] },
    { rank: 7, damage: 30, message: 'Strike through both ears, foe is quite dead!', effects: ['F'], wounds: ['R3'] },
    { rank: 8, damage: 35, message: 'Strike pierces temple and kills foe instantly!', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: 'Awesome shot skewers skull! The [target] blinks once and falls quite dead!', effects: ['F'], wounds: ['R3'] }
  ],
  NECK: [
    { rank: 0, damage: 0, message: 'Talk about a close shave! Let\'s try closer next time.', effects: [], wounds: [] },
    { rank: 1, damage: 3, message: 'Minor strike to neck.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 5, message: 'Well placed shot to the neck.', effects: ['S2'], wounds: ['R2'] },
    { rank: 3, damage: 7, message: 'Strike just below the jaw, nice shot to the neck!', effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 10, message: 'Pierced through neck, a fine shot!', effects: ['S5'], wounds: ['R3'] },
    { rank: 5, damage: 15, message: 'Neck skewered, sliding past the throat and spine! That looks painful.', effects: ['S8'], wounds: ['R3'] },
    { rank: 6, damage: 15, message: 'Fine shot pierces jugular vein! The brain wonders where all its oxygen went, briefly.', effects: ['F'], wounds: ['R3'] },
    { rank: 7, damage: 20, message: 'Strike clean through neck, what a shot! Good form!', effects: ['F'], wounds: ['R3'] },
    { rank: 8, damage: 25, message: 'Strike punctures throat and ruins vocal cords!', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 30, message: 'Incredible shot clean through the throat severs the spine!', effects: ['F'], wounds: ['R3'] }
  ],
  RIGHT_EYE: [
    { rank: 0, damage: 0, message: 'Attack bumps an eyebrow. Oh! So close!', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Minor strike under the right eye, that was close!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 5, message: 'Well aimed shot almost removes an eye!', effects: ['S3'], wounds: ['R2'] },
    { rank: 3, damage: 10, message: 'Slash across right eye! Hope the left is working.', effects: ['S5'], wounds: ['R3'] },
    { rank: 4, damage: 17, message: 'Attack punctures the eye and connects with something really vital!', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 5, damage: 20, message: 'Shot knocks the [target]\'s head back by pushing on the inside of the skull!', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 6, damage: 25, message: 'Incredible shot to the eye penetrates deep into skull!', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 7, damage: 30, message: 'Shot destroys eye and the brain behind it!', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 8, damage: 35, message: 'Strike through eye, the [target] is lobotomized!', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 9, damage: 40, message: 'Strike to the eye penetrates skull, ocular fluid sprays widely!', effects: ['F'], wounds: ['R3 eye', 'R3 head'] }
  ],
  LEFT_EYE: [
    { rank: 0, damage: 0, message: 'Attack bumps an eyebrow. Oh! So close!', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Minor strike under the left eye, that was close!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 5, message: 'Well aimed shot almost removes an eye!', effects: ['S3'], wounds: ['R2'] },
    { rank: 3, damage: 10, message: 'Surgical strike removes the [target]\'s left eye!', effects: ['S5'], wounds: ['R3'] },
    { rank: 4, damage: 17, message: 'Attack punctures the eye and connects with something really vital!', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 5, damage: 20, message: 'Shot knocks the [target]\'s head back by pushing on the inside of the skull!', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 6, damage: 25, message: 'Incredible shot to the eye penetrates deep into skull!', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 7, damage: 30, message: 'Shot destroys eye and the brain behind it!', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 8, damage: 35, message: 'Strike through eye, the [target] is lobotomized!', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 9, damage: 40, message: 'Strike to the eye penetrates skull, ocular fluid sprays widely!', effects: ['F'], wounds: ['R3 eye', 'R3 head'] }
  ],
  CHEST: [
    { rank: 0, damage: 0, message: 'Blow slides along ribs. Probably tickles.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Minor puncture to the chest.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Strike to the chest breaks a rib!', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Loud *crack* as the [target]\'s sternum breaks!', effects: ['S2'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Well placed strike shatters a rib!', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Damaging strike to chest, several ribs shattered!', effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 30, message: 'Strong strike, punctures lung!', effects: ['S6'], wounds: ['R3'] },
    { rank: 7, damage: 35, message: 'Awesome shot shatters ribs and punctures lung!', effects: ['S8'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Beautiful shot pierces both lungs, the [target] makes a wheezing noise, and drops dead!', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 50, message: 'Incredible strike pierces heart and runs the [target] clean through!', effects: ['F'], wounds: ['R3'] }
  ],
  ABDOMEN: [
    { rank: 0, damage: 0, message: 'Poked in the tummy. Hehehe.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Minor puncture to abdomen.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Nice puncture to the abdomen, just missed vital organs!', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Strike pierces gall bladder! That\'s gotta hurt!', effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 20, message: 'Strike to abdomen punctures stomach!', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Vicious strike punctures intestines!', effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 30, message: 'Deft strike to abdomen penetrates several useful organs!', effects: ['S6'], wounds: ['R3'] },
    { rank: 7, damage: 35, message: 'Bladder impaled, what a mess!', effects: ['S8'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Strike to abdomen skewers the [target] quite nicely!', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 50, message: 'Perfect strike to abdomen. The [target] howls in pain and drops quite dead!', effects: ['F'], wounds: ['R3'] }
  ],
  BACK: [
    { rank: 0, damage: 0, message: 'Thrust slides along the back. Cuts a nagging itch.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Minor puncture to the back.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Nice puncture to the back, just grazed the spine!', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Strike connects with shoulder blade!', effects: ['S2'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Nailed in lower back!', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Well placed strike to back shatters vertebrae!', effects: ['S5', 'K'], wounds: ['R2'] },
    { rank: 6, damage: 30, message: 'Deft strike to the back cracks vertebrae!', effects: ['S6'], wounds: ['R3'] },
    { rank: 7, damage: 35, message: 'Awesome shot shatters spine and punctures lung!', effects: ['S8', 'K'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Shot to back shatters bone and vertebrae!', effects: ['F'], wounds: ['R3', 'N3'] },
    { rank: 9, damage: 50, message: 'Incredible shot impales a kidney. Too painful to even scream.', effects: ['F'], wounds: ['R3'] }
  ],
  RIGHT_ARM: [
    { rank: 0, damage: 0, message: 'Tap to the arm pricks some interest but not much else.', effects: [], wounds: [] },
    { rank: 1, damage: 3, message: 'Minor puncture to the right arm.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 5, message: 'Strike pierces upper arm!', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 7, message: 'Well aimed shot, punctures upper arm!', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 10, message: 'Strike pierces forearm!', effects: ['S2'], wounds: ['R2'] },
    { rank: 5, damage: 14, message: 'Elbow punctured, oh what pain!', effects: ['S3'], wounds: ['R2'] },
    { rank: 6, damage: 17, message: 'Well aimed strike shatters bone in right arm!', effects: ['S5'], wounds: ['R2'] },
    { rank: 7, damage: 22, message: 'Strike to right arm cleanly severs it at the shoulder!', effects: ['S6', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 25, message: 'Strike to right arm shatters elbow and severs forearm!', effects: ['S8', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 25, message: 'Shot shatters shoulder and severs right arm!', effects: ['S10', 'A'], wounds: ['R3'] }
  ],
  LEFT_ARM: [
    { rank: 0, damage: 0, message: 'Tap to the arm pricks some interest but not much else.', effects: [], wounds: [] },
    { rank: 1, damage: 3, message: 'Minor puncture to the left arm.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 5, message: 'Strike pierces upper arm!', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 7, message: 'Well aimed shot, punctures upper arm!', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 10, message: 'Strike pierces forearm!', effects: ['S2'], wounds: ['R2'] },
    { rank: 5, damage: 14, message: 'Elbow punctured, oh what pain!', effects: ['S3'], wounds: ['R2'] },
    { rank: 6, damage: 17, message: 'Well aimed strike shatters bone in left arm!', effects: ['S5'], wounds: ['R2'] },
    { rank: 7, damage: 22, message: 'Strike to left arm cleanly severs it at the shoulder!', effects: ['S6', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 25, message: 'Strike to left arm shatters elbow and severs forearm!', effects: ['S8', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 25, message: 'Shot shatters shoulder and severs left arm!', effects: ['S10', 'A'], wounds: ['R3'] }
  ],
  RIGHT_HAND: [
    { rank: 0, damage: 0, message: 'Strikes a fingernail. Bet it\'ll lose it now.', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Strike to right hand breaks a fingernail!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Strike through the palm!', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 5, message: 'Shot to the hand slices a finger to the bone!', effects: [], wounds: ['R1'] },
    { rank: 4, damage: 7, message: 'Shot pierces a wrist!', effects: ['S1'], wounds: ['R2'] },
    { rank: 5, damage: 9, message: 'Slash across back of hand, tendons sliced!', effects: ['S2'], wounds: ['R2'] },
    { rank: 6, damage: 12, message: 'Impressive shot shatters wrist!', effects: ['S3'], wounds: ['R2'] },
    { rank: 7, damage: 15, message: 'Strike to wrist severs right hand!', effects: ['S4', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 18, message: 'Strike to wrist severs right hand!', effects: ['S5', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 20, message: 'Strike to wrist severs right hand quite neatly!', effects: ['S10', 'A'], wounds: ['R3'] }
  ],
  LEFT_HAND: [
    { rank: 0, damage: 0, message: 'Strikes a fingernail. Bet it\'ll lose it now.', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Strike to left hand breaks a fingernail!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Strike through the palm!', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 5, message: 'Shot to the hand slices a finger to the bone!', effects: [], wounds: ['R1'] },
    { rank: 4, damage: 7, message: 'Shot pierces a wrist!', effects: ['S1'], wounds: ['R2'] },
    { rank: 5, damage: 9, message: 'Slash across back of hand, tendons sliced!', effects: ['S2'], wounds: ['R2'] },
    { rank: 6, damage: 12, message: 'Impressive shot shatters wrist!', effects: ['S3'], wounds: ['R2'] },
    { rank: 7, damage: 15, message: 'Strike to wrist severs left hand!', effects: ['S4', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 18, message: 'Strike to wrist severs left hand!', effects: ['S5', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 20, message: 'Strike to wrist severs left hand quite neatly!', effects: ['S10', 'A'], wounds: ['R3'] }
  ],
  RIGHT_LEG: [
    { rank: 0, damage: 0, message: 'Thrust glances off the [target]\'s knee without a lot of effect.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Minor puncture to the right leg.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 9, message: 'Strike pierces thigh!', effects: ['K'], wounds: ['R1'] },
    { rank: 3, damage: 13, message: 'Well aimed shot, punctures calf!', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 17, message: 'Strike pierces calf!', effects: ['S3', 'K'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: 'Well placed shot pierces knee, that hurt!', effects: ['S5', 'K'], wounds: ['R2'] },
    { rank: 6, damage: 23, message: 'Great shot penetrates thigh and shatters bone!', effects: ['S6', 'K'], wounds: ['R2'] },
    { rank: 7, damage: 27, message: 'Blow shatters knee and severs lower leg!', effects: ['S8', 'K', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 30, message: 'Strike punctures thigh and shatters femur!', effects: ['S10', 'K', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 35, message: 'Shot shatters hip and severs right leg!', effects: ['S10', 'K', 'A'], wounds: ['R3'] }
  ],
  LEFT_LEG: [
    { rank: 0, damage: 0, message: 'Thrust glances off the [target]\'s knee without a lot of effect.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Minor puncture to the left leg.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 9, message: 'Strike pierces thigh!', effects: ['K'], wounds: ['R1'] },
    { rank: 3, damage: 13, message: 'Well aimed shot, punctures calf!', effects: ['S1'], wounds: ['R2'] },
    { rank: 4, damage: 17, message: 'Strike pierces calf!', effects: ['S3', 'K'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: 'Well placed shot pierces knee, that hurt!', effects: ['S5', 'K'], wounds: ['R2'] },
    { rank: 6, damage: 23, message: 'Great shot penetrates thigh and shatters bone!', effects: ['S6', 'K'], wounds: ['R2'] },
    { rank: 7, damage: 27, message: 'Blow shatters knee and severs lower leg!', effects: ['S8', 'K', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 30, message: 'Strike punctures thigh and shatters femur!', effects: ['S10', 'K', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 35, message: 'Shot shatters hip and severs left leg!', effects: ['S10', 'K', 'A'], wounds: ['R3'] }
  ]
};

