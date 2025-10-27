'use strict';

/**
 * Grapple Critical Hit Table Data
 * For unarmed combat, wrestling, grappling attacks
 */
module.exports = {
  HEAD: [
    { rank: 0, damage: 0, message: 'Unconvincing strike.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Decent blow to the head, may leave a bruise.', effects: ['S1', 'K'], wounds: [] },
    { rank: 2, damage: 10, message: 'Solid headlock.', effects: ['S3', 'K'], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Head grappled, slight ringing in the ears.', effects: ['S5', 'K'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Crushing grapple to the head, skull cracks!', effects: ['S7', 'K'], wounds: ['R1'] },
    { rank: 5, damage: 25, message: 'Head bounces off the ground. The [target] looks a bit dazed.', effects: ['S10', 'K'], wounds: ['R2'] },
    { rank: 6, damage: 30, message: 'Forehead strikes the ground!', effects: ['S12', 'K'], wounds: ['R2'] },
    { rank: 7, damage: 35, message: 'The [target]\'s head is cracked as it is thrown to the ground!', effects: ['S14', 'K'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Rough grapple to the head, cracks skull in several places!', effects: ['S16', 'NK'], wounds: ['R3'] },
    { rank: 9, damage: 45, message: 'Head crushed! Resulting death is... messy.', effects: ['F'], wounds: ['R3'] }
  ],
  NECK: [
    { rank: 0, damage: 0, message: 'Weak blow.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Weak grapple around the neck bruises windpipe.', effects: ['S1', 'NK'], wounds: [] },
    { rank: 2, damage: 10, message: 'Sprained neck.', effects: ['S2', 'K'], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Hard pull on head strains neck.', effects: ['S4', 'K'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Hard head twist sends jolts of pain up the neck!', effects: ['S6', 'K'], wounds: ['R1'] },
    { rank: 5, damage: 25, message: 'Neck grapple, loud *pop* as the bones strain!', effects: ['S8', 'K'], wounds: ['R2'] },
    { rank: 6, damage: 30, message: 'Something gives in the [target]\'s neck!', effects: ['S10', 'K'], wounds: ['R2'] },
    { rank: 7, damage: 35, message: 'Grab to the head sprains the [target]\'s neck badly before it hits the ground.', effects: ['S12', 'K'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Neck twisted entirely around, quite dead!', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 50, message: 'Throat driven into spine by awesome grapple! *SNAP*', effects: ['F'], wounds: ['R3'] }
  ],
  RIGHT_EYE: [
    { rank: 0, damage: 0, message: 'Lame eye gouge, barely close to the head.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Weak eye gouge, probably distracting.', effects: ['S1', 'NK'], wounds: [] },
    { rank: 2, damage: 10, message: 'Eye gouge, that hurt!', effects: ['S3', 'K'], wounds: [] },
    { rank: 3, damage: 15, message: 'Head maneuver catches eye. Painful!', effects: ['S5', 'K'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Move scratches the eye which quickly fills with tears.', effects: ['S7', 'K'], wounds: ['R1'] },
    { rank: 5, damage: 25, message: 'Dirt gets in the [target]\'s eyes as it is pushed to the ground.', effects: ['S10', 'K'], wounds: ['R1'] },
    { rank: 6, damage: 30, message: 'Eye struck as the [target] lands face first, swelling it shut.', effects: ['S12', 'NK'], wounds: ['R2'] },
    { rank: 7, damage: 35, message: 'Strong grapple to the head gouges eye!', effects: ['S16', 'K'], wounds: ['R2'] },
    { rank: 8, damage: 40, message: 'Nasty eye gouge forces eye into skull!', effects: ['S18', 'K'], wounds: ['R3'] },
    { rank: 9, damage: 45, message: 'Eyeball annihilated with a loud *POP*!', effects: ['S20', 'K'], wounds: ['R3'] }
  ],
  LEFT_EYE: [
    { rank: 0, damage: 0, message: 'Lame eye gouge, barely close to the head.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Weak eye gouge, probably distracting.', effects: ['S1', 'NK'], wounds: [] },
    { rank: 2, damage: 10, message: 'Eye gouge, that hurt!', effects: ['S3', 'K'], wounds: [] },
    { rank: 3, damage: 15, message: 'Head maneuver catches eye. Painful!', effects: ['S5', 'K'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Move scratches the eye which quickly fills with tears.', effects: ['S7', 'K'], wounds: ['R1'] },
    { rank: 5, damage: 25, message: 'Dirt gets in the [target]\'s eyes as it is pushed to the ground.', effects: ['S10', 'K'], wounds: ['R1'] },
    { rank: 6, damage: 30, message: 'Eye struck as the [target] lands face first, swelling it shut.', effects: ['S12', 'NK'], wounds: ['R2'] },
    { rank: 7, damage: 35, message: 'Strong grapple to the head gouges eye!', effects: ['S16', 'K'], wounds: ['R2'] },
    { rank: 8, damage: 40, message: 'Nasty eye gouge forces eye into skull!', effects: ['S18', 'K'], wounds: ['R3'] },
    { rank: 9, damage: 45, message: 'Eyeball annihilated with a loud *POP*!', effects: ['S20', 'K'], wounds: ['R3'] }
  ],
  CHEST: [
    { rank: 0, damage: 0, message: 'Impotent blow.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Attempt to snare chest shrugged off.', effects: ['NK'], wounds: [] },
    { rank: 2, damage: 10, message: 'Chest grapple, decent grip.', effects: ['S1', 'NK'], wounds: [] },
    { rank: 3, damage: 15, message: 'Solid chest grapple, a [target] is winded!', effects: ['S3', 'K'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Hard shove to the chest staggers the [target].', effects: ['S5', 'K'], wounds: ['R1'] },
    { rank: 5, damage: 25, message: 'Hard blow to chest knocks the [target] back and winds it.', effects: ['S7', 'K'], wounds: ['R1'] },
    { rank: 6, damage: 30, message: 'Blow to the chest takes the [target]\'s breath away.', effects: ['S9', 'NK'], wounds: ['R1'] },
    { rank: 7, damage: 35, message: 'Impressive chest grapple snaps ribs!', effects: ['S12', 'K'], wounds: ['R2'] },
    { rank: 8, damage: 40, message: 'Awesome chest grapple, sternum cracks!', effects: ['S14', 'NK'], wounds: ['R2'] },
    { rank: 9, damage: 55, message: 'Huge grapple, chest gives slightly, several ribs snap!', effects: ['S16', 'K'], wounds: ['R3'] }
  ],
  ABDOMEN: [
    { rank: 0, damage: 0, message: 'Barely touched.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Attempt to snare hips shaken loose.', effects: ['NK'], wounds: [] },
    { rank: 2, damage: 10, message: 'Blow to the diaphragm.', effects: ['S1', 'NK'], wounds: [] },
    { rank: 3, damage: 15, message: 'Solid abdomen grapple, stomach bruised!', effects: ['S3', 'K'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Hard shove to the midriff staggers the [target].', effects: ['S5', 'K'], wounds: ['R1'] },
    { rank: 5, damage: 25, message: 'Hard blow to stomach knocks the [target] back and winds it.', effects: ['S7', 'K'], wounds: ['R1'] },
    { rank: 6, damage: 30, message: 'Blow to the stomach makes the [target] gasp for air.', effects: ['S11', 'NK'], wounds: ['R1'] },
    { rank: 7, damage: 35, message: 'The [target] takes a hard fall from being, cracking its hip!', effects: ['S12', 'K'], wounds: ['R2'] },
    { rank: 8, damage: 40, message: 'Fierce grapple injures internal organs!', effects: ['S14', 'NK'], wounds: ['R2'] },
    { rank: 9, damage: 45, message: 'Internal organs crushed!', effects: ['S16', 'K'], wounds: ['R3'] }
  ],
  BACK: [
    { rank: 0, damage: 0, message: 'Low grazing shot.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Attempt to grab from behind shrugged off.', effects: ['NK'], wounds: [] },
    { rank: 2, damage: 10, message: 'Blow to the kidneys.', effects: ['S1', 'NK'], wounds: [] },
    { rank: 3, damage: 15, message: 'Solid grapple to the back, back muscles pulled!', effects: ['S3', 'K'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Hard shove to the back staggers the [target].', effects: ['S5', 'K'], wounds: ['R1'] },
    { rank: 5, damage: 25, message: 'Hard blow to back sends the [target] sprawling.', effects: ['S7', 'K'], wounds: ['R1'] },
    { rank: 6, damage: 30, message: 'Hard maneuver throws the [target] to the ground. Lands painfully on its back.', effects: ['S9', 'K'], wounds: ['R1'] },
    { rank: 7, damage: 35, message: 'Vertebrae snap in succession!', effects: ['S12', 'K'], wounds: ['R2'] },
    { rank: 8, damage: 40, message: 'Wicked grapple of the back, followed by the snapping of vertebrae!', effects: ['S14', 'NK'], wounds: ['R2'] },
    { rank: 9, damage: 45, message: 'Grapple to the back crushes several useful bones!', effects: ['S16', 'K'], wounds: ['R3'] }
  ],
  RIGHT_ARM: [
    { rank: 0, damage: 0, message: 'Try thumb wrestling.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Loose arm hold.', effects: ['NK'], wounds: [] },
    { rank: 2, damage: 10, message: 'Arm lock.', effects: ['S1', 'NK'], wounds: [] },
    { rank: 3, damage: 15, message: 'Hard pull to the arm throws the [target] off balance.', effects: ['S2', 'K'], wounds: [] },
    { rank: 4, damage: 20, message: 'Fierce arm lock twists a [target]\'s right arm!', effects: ['S3', 'K'], wounds: ['R1'] },
    { rank: 5, damage: 25, message: 'Solid arm grapple, pulls muscles to their limits!', effects: ['S4', 'K'], wounds: ['R1'] },
    { rank: 6, damage: 30, message: 'Arm twists painfully behind the back as the [target] is thrown forward!', effects: ['S5', 'K'], wounds: ['R1'] },
    { rank: 7, damage: 35, message: 'Grapple pins weapon arm, and twists it severely!', effects: ['S6', 'K'], wounds: ['R1'] },
    { rank: 8, damage: 40, message: 'Weapon arm grappled, twisted until it breaks!', effects: ['S8', 'NK'], wounds: ['R2'] },
    { rank: 9, damage: 50, message: 'Arm grappled, almost ripped from the socket!', effects: ['S10', 'A', 'K'], wounds: ['R3'] }
  ],
  LEFT_ARM: [
    { rank: 0, damage: 0, message: 'Lame attempt.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Loose arm hold.', effects: ['NK'], wounds: [] },
    { rank: 2, damage: 10, message: 'Arm lock.', effects: ['S1', 'NK'], wounds: [] },
    { rank: 3, damage: 15, message: 'Hard pull to the arm throws the [target] off balance.', effects: ['S2', 'K'], wounds: [] },
    { rank: 4, damage: 20, message: 'Fierce arm lock twists a [target]\'s left arm!', effects: ['S3', 'K'], wounds: ['R1'] },
    { rank: 5, damage: 25, message: 'Solid arm grapple, pulls muscles to their limits!', effects: ['S4', 'K'], wounds: ['R1'] },
    { rank: 6, damage: 30, message: 'Arm twists painfully behind the back as the [target] is thrown forward!', effects: ['S5', 'K'], wounds: ['R1'] },
    { rank: 7, damage: 35, message: 'Grapple pins shield arm, and twists it severely!', effects: ['S6', 'K'], wounds: ['R1'] },
    { rank: 8, damage: 40, message: 'Shield arm grappled, twisted until it breaks!', effects: ['S8', 'NK'], wounds: ['R2'] },
    { rank: 9, damage: 50, message: 'Arm grappled, almost ripped from the socket!', effects: ['S10', 'A', 'K'], wounds: ['R3'] }
  ],
  RIGHT_HAND: [
    { rank: 0, damage: 0, message: 'Ineffectual strike.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Loose wrist lock.', effects: ['NK'], wounds: [] },
    { rank: 2, damage: 10, message: 'Solid wrist lock but the [target] slips away!', effects: ['NK'], wounds: [] },
    { rank: 3, damage: 15, message: 'Hard pull to the hand hurts but not much else.', effects: ['S1', 'NK'], wounds: [] },
    { rank: 4, damage: 20, message: 'Finger and wrist grappled, twists hand!', effects: ['S2', 'K'], wounds: [] },
    { rank: 5, damage: 25, message: 'Strong wrist lock, tendons strained!', effects: ['S3', 'K'], wounds: ['R1'] },
    { rank: 6, damage: 30, message: 'Hand twists painfully behind the back as the [target] is thrown forward!', effects: ['S4', 'K'], wounds: ['R1'] },
    { rank: 7, damage: 35, message: 'The [target]\'s right hand is wrenched hard as she is thrown to the ground!', effects: ['S5', 'K'], wounds: ['R1'] },
    { rank: 8, damage: 40, message: 'Fingers dislocated and snap like twigs!', effects: ['S6', 'K'], wounds: ['R1'] },
    { rank: 9, damage: 45, message: 'Hand crushed by massive grapple, that had to hurt!', effects: ['S7', 'K'], wounds: ['R2'] }
  ],
  LEFT_HAND: [
    { rank: 0, damage: 0, message: 'Unconvincing strike.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Loose wrist lock.', effects: ['NK'], wounds: [] },
    { rank: 2, damage: 10, message: 'Solid wrist lock but the [target] slips away!', effects: ['NK'], wounds: [] },
    { rank: 3, damage: 15, message: 'Hard pull to the hand hurts but not much else.', effects: ['S1', 'NK'], wounds: [] },
    { rank: 4, damage: 20, message: 'Finger and wrist grappled, twists hand!', effects: ['S2', 'K'], wounds: [] },
    { rank: 5, damage: 25, message: 'Strong wrist lock, tendons strained!', effects: ['S3', 'K'], wounds: ['R1'] },
    { rank: 6, damage: 30, message: 'Hand twists painfully behind the back as the [target] is thrown forward!', effects: ['S4', 'K'], wounds: ['R1'] },
    { rank: 7, damage: 35, message: 'The [target]\'s left hand is wrenched hard as she is thrown to the ground!', effects: ['S5', 'K'], wounds: ['R1'] },
    { rank: 8, damage: 40, message: 'Fingers dislocated and snap like twigs!', effects: ['S6', 'K'], wounds: ['R1'] },
    { rank: 9, damage: 45, message: 'Hand crushed by massive grapple, that had to hurt!', effects: ['S7', 'K'], wounds: ['R2'] }
  ],
  RIGHT_LEG: [
    { rank: 0, damage: 0, message: 'Weak blow.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Slight leg hold.', effects: ['NK'], wounds: [] },
    { rank: 2, damage: 10, message: 'Leg grapple, twisted ankle but the [target] is not knocked down.', effects: ['S1', 'NK'], wounds: [] },
    { rank: 3, damage: 15, message: 'Leg sweep keeps a [target]\'s feet overhead.', effects: ['S3', 'K'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Tough leg grapple followed by a *snap* in the left leg!', effects: ['S5', 'K'], wounds: ['R1'] },
    { rank: 5, damage: 25, message: 'Solid leg grapple, pulls muscles to their limits!', effects: ['S7', 'K'], wounds: ['R1'] },
    { rank: 6, damage: 30, message: 'Leg grappled, knee *pops* audibly!', effects: ['S9', 'K'], wounds: ['R1'] },
    { rank: 7, damage: 35, message: 'The [target]\'s right leg is wrenched hard as it is thrown to the ground!', effects: ['S11', 'K'], wounds: ['R1'] },
    { rank: 8, damage: 40, message: 'Leg grapple snaps right leg in several places', effects: ['S13', 'K'], wounds: ['R2'] },
    { rank: 9, damage: 55, message: 'Leg twisted at hideous angle, snaps in several places!', effects: ['S15', 'K'], wounds: ['R2'] }
  ],
  LEFT_LEG: [
    { rank: 0, damage: 0, message: 'Barely touched.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Slight leg hold.', effects: ['NK'], wounds: [] },
    { rank: 2, damage: 10, message: 'Leg grapple, twisted ankle but the [target] is not knocked down.', effects: ['S1', 'NK'], wounds: [] },
    { rank: 3, damage: 15, message: 'Leg sweep keeps a [target]\'s feet overhead.', effects: ['S3', 'K'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Tough leg grapple followed by a *snap* in the left leg!', effects: ['S5', 'K'], wounds: ['R1'] },
    { rank: 5, damage: 25, message: 'Solid leg grapple, pulls muscles to their limits!', effects: ['S7', 'K'], wounds: ['R1'] },
    { rank: 6, damage: 30, message: 'Leg grappled, knee *pops* audibly!', effects: ['S9', 'K'], wounds: ['R1'] },
    { rank: 7, damage: 35, message: 'The [target]\'s left leg is wrenched hard as it is thrown to the ground!', effects: ['S11', 'K'], wounds: ['R1'] },
    { rank: 8, damage: 40, message: 'Leg grapple snaps left leg in several places', effects: ['S13', 'K'], wounds: ['R2'] },
    { rank: 9, damage: 55, message: 'Leg twisted at hideous angle, snaps in several places!', effects: ['S15', 'K'], wounds: ['R2'] }
  ]
};

