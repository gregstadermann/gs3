'use strict';

/**
 * Slash Critical Hit Table Data
 * Structure: Body part -> Array of rank entries (0-9)
 */
module.exports = {
  HEAD: [
    { rank: 0, damage: 0, message: 'Flashy swing! Too bad it only bopped the [target]\'s nose.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Quick slash catches the [target]\'s cheek! Dimples are always nice.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Blade slashes across the [target]\'s face! Nice nose job.', effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Blow to head!', effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 20, message: 'Quick flick of the wrist! The [target] is slashed across its forehead!', effects: ['S6'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Hard blow to the [target]\'s ear! Deep gash and a terrible headache!', effects: ['S8'], wounds: ['R3'] },
    { rank: 6, damage: 30, message: 'Gruesome slash opens the [target]\'s forehead! Grey matter spills forth!', effects: ['F'], wounds: ['R3'] },
    { rank: 7, damage: 35, message: 'Wild upward slash remove the [target]\'s face from its skull! Interesting way to die.', effects: ['F'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Horrible slash to the [target]\'s head! Brain matter goes flying! Looks like it never felt a thing.', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 50, message: 'Gruesome, slashing blow to the side of the [target]\'s head! Skull split open! Brain (and life) vanishes in a fine mist.', effects: ['F'], wounds: ['R3'] }
  ],
  NECK: [
    { rank: 0, damage: 0, message: 'Close shave! The [target] takes a quick step back.', effects: [], wounds: [] },
    { rank: 1, damage: 2, message: 'Attack hits the [target]\'s throat but doesn\'t break the skin. Close!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 5, message: 'Strike dents the [target]\'s larynx. Swallowing will be fun.', effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 10, message: 'Deft swing strikes the [target]\'s neck. Maybe not fatal but it\'s sure distracting.', effects: ['S2'], wounds: ['R2'] },
    { rank: 4, damage: 12, message: 'Strong slash to throat nicks a few blood vessels.', effects: ['S4'], wounds: ['R3'] },
    { rank: 5, damage: 15, message: 'Fast slash to the [target]\'s neck exposes its windpipe. Quick anatomy lesson, anyone?', effects: ['S8'], wounds: ['R3'] },
    { rank: 6, damage: 20, message: 'Deep slash to the [target]\'s neck severs an artery! The [target] chokes to death on its own blood.', effects: ['F'], wounds: ['R3'] },
    { rank: 7, damage: 25, message: 'Gruesome slash to the [target]\'s throat! That stings... for about a second.', effects: ['F'], wounds: ['R3'] },
    { rank: 8, damage: 30, message: 'Awful slash nearly decapitates the [target]! That\'s one way to lose your head.', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: 'Incredible slash to the [target]\'s neck! Throat and vocal cords destroyed! Zero chance of survival.', effects: ['F'], wounds: ['R3'] }
  ],
  CHEST: [
    { rank: 0, damage: 0, message: 'Weak slash across chest! Slightly less painful than heartburn.', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Deft slash across chest draws blood! The [target] takes a deep breath.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Slash to the [target]\'s chest! That heart\'s not broken, it\'s only scratched.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Slash to [target]\'s chest. Breathe deep, it\'ll feel better in a minute.', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Slashing blow to chest knocks the [target] back a few paces!', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Crossing slash to the chest catches the [target]\'s attention!', effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 45, message: 'Hard slash to the [target]\'s side opens its spleen!', effects: ['S6'], wounds: ['R3 chest', 'R2 back'] },
    { rank: 7, damage: 60, message: 'Quick, powerful slash! The [target]\'s chest is ripped open!', effects: ['S8'], wounds: ['R3 chest', 'R2 back'] },
    { rank: 8, damage: 65, message: 'Slash to the [target]\'s ribs opens a sucking chest wound!', effects: ['F'], wounds: ['R3 chest', 'R3 abdomen'] },
    { rank: 9, damage: 70, message: 'Wicked slash slices open the [target]\'s chest! Heart and lung pureed! Sickening!', effects: ['F'], wounds: ['R3 chest', 'R3 abdomen'] }
  ],
  ABDOMEN: [
    { rank: 0, damage: 0, message: 'Light slash to the [target]\'s abdomen! Barely nicked.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Awkward slash to the [target]\'s stomach! Everyone needs another belly button.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Smooth slash to the [target]\'s hip! Nice crunching sound.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Hard slash to belly severs a few nerve endings.', effects: ['S3'], wounds: ['R2 R1 nerve'] },
    { rank: 4, damage: 20, message: 'Diagonal slash leaves a bloody trail across the [target]\'s torso.', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'The [target] is backed up by a strong slash to its abdomen!', effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 30, message: 'Deep slash to the [target]\'s right side! Several inches of padding sliced off hip.... From the inside!', effects: ['S6', 'K'], wounds: ['R3 abs', 'R2 back'] },
    { rank: 7, damage: 50, message: 'Amazing slash to the [target]\'s belly! Nothing quite like that empty feeling inside.', effects: ['S8'], wounds: ['R3 abs', 'R2 back'] },
    { rank: 8, damage: 60, message: 'Bloody slash to the [target]\'s side! Instant death, due to lack of intestines.', effects: ['F'], wounds: ['R3 abs', 'R3 back'] },
    { rank: 9, damage: 75, message: 'Terrible slash to the [target]\'s side! Entrails spill out, onto the ground! Death can be SO messy.', effects: ['F'], wounds: ['R3 abs', 'R3 back'] }
  ],
  RIGHT_EYE: [
    { rank: 0, damage: 0, message: 'Quick slash at the [target]\'s right eye. Strike lands but misses target.', effects: [], wounds: [] },
    { rank: 1, damage: 3, message: 'Slashing strike near forehead nicks an eyebrow! That must sting!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Gash to the [target]\'s right eyebrow. That\'s going to be quite a shiner!', effects: ['S1'], wounds: ['R2'] },
    { rank: 3, damage: 5, message: 'Grazing slash to the [target]\'s face! Scratch to its eyelids. "When blood gets in your eyes..."', effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 20, message: 'Upward slash gouges the [target]\'s cheek! Right eye lost! Pity.', effects: ['S5'], wounds: ['R3 eye', 'R2 head'] },
    { rank: 5, damage: 25, message: 'Slash strikes the [target]\'s right eye. Seems there was a brain there after all.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 6, damage: 30, message: 'Slash to head destroys the [target]\'s right eye! Doesn\'t do its brain any good either.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 7, damage: 40, message: 'Slash to the [target]\'s right eye! Vitreous fluid spews forth! Seeya!', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 8, damage: 45, message: 'Horrifying slash to the [target]\'s head! Right eye sliced open! Brain pureed!', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 9, damage: 50, message: 'Blast to the [target]\'s head destroys right eye! Brain obliterated! Disgusting, but painful only for a second.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] }
  ],
  LEFT_EYE: [
    { rank: 0, damage: 0, message: 'Quick slash to the [target]\'s left eye. Strike lands but misses target.', effects: [], wounds: [] },
    { rank: 1, damage: 3, message: 'Slashing strike near forehead nicks an eyelid! That must sting!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Gash to the [target]\'s left eyebrow. That\'s going to be quite a shiner!', effects: ['S1'], wounds: ['R2'] },
    { rank: 3, damage: 5, message: 'Grazing slash to the [target]\'s face! Scratches its left eye. Ouch!', effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 20, message: 'Upward slash gouges the [target]\'s cheek! Left eye lost! Pity.', effects: ['S5'], wounds: ['R3 eye', 'R2 head'] },
    { rank: 5, damage: 25, message: 'Slash strikes the [target]\'s left eye. Seems there was a brain there after all.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 6, damage: 30, message: 'Slash to head destroys the [target]\'s left eye! Doesn\'t do its brain any good either.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 7, damage: 40, message: 'Slash to the [target]\'s left eye! Vitreous fluid spews forth! Seeya!', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 8, damage: 45, message: 'Horrifying slash to the [target]\'s head! Left eye sliced open! Brain pureed!', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 9, damage: 50, message: 'Blast to the [target]\'s head destroys left eye! Brain obliterated! Disgusting, but painful only for a second.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] }
  ],
  BACK: [
    { rank: 0, damage: 0, message: 'Glancing blow to the [target]\'s back. That could have been better.', effects: [], wounds: [] },
    { rank: 1, damage: 3, message: 'Weak slash to the [target]\'s lower back!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Feint to the left goes astray as the [target] dodges! You scratch my back...', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Slash along the [target]\'s lower back.', effects: ['S2'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Slash to the [target]\'s lower back! Pain shoots up along [target]\'s spine.', effects: ['S2'], wounds: ['R1'] },
    { rank: 5, damage: 25, message: 'Feint left spins the [target] around! Jagged slash to lower back.', effects: ['S3'], wounds: ['R2'] },
    { rank: 6, damage: 30, message: 'The [target] twists away but is caught with a hard slash! Back is broken!', effects: ['S5', 'K'], wounds: ['R3'] },
    { rank: 7, damage: 50, message: 'Deft slash! The [target] is spun around and hit hard in its lower back.', effects: ['S6', 'K'], wounds: ['R3 back', 'R2 abs'] },
    { rank: 8, damage: 60, message: 'Slash to the [target]\'s lower back! Kidneys sliced and diced! Death is slow and painful.', effects: ['F'], wounds: ['R3 back/nerves'] },
    { rank: 9, damage: 75, message: 'Masterful slash to the [target]\'s lower back! Spinal cord and life are just memories now.', effects: ['F'], wounds: ['R3 back/nerves'] }
  ],
  RIGHT_ARM: [
    { rank: 0, damage: 0, message: 'Weak slash to the [target]\'s right arm. That doesn\'t even sting.', effects: [], wounds: [] },
    { rank: 1, damage: 3, message: 'Quick slash to the [target]\'s upper right arm! Just a nick.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 7, message: 'Hesitant slash to the [target]\'s upper right arm! Just a scratch.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 8, message: 'Slash to the [target]\'s right arm! Slices neatly through the skin and meets bone!', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 10, message: 'Powerful slash just cracks the [target]\'s weapon arm!', effects: ['S2'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: 'Deep slash to the [target]\'s right forearm!', effects: ['S3'], wounds: ['R2'] },
    { rank: 6, damage: 20, message: 'Quick, hard slash to the [target]\'s right arm! "CRACK"', effects: ['S5'], wounds: ['R2'] },
    { rank: 7, damage: 25, message: 'Hard slash to the [target]\'s side! Right arm no longer available for use.', effects: ['S6', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 35, message: 'Spectacular slash! The [target]\'s right arm is neatly amputated!', effects: ['S8', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: 'Awesome slash sever the [target]\'s right arm! A jagged stump is all that remains!', effects: ['S10', 'A'], wounds: ['R3'] }
  ],
  LEFT_ARM: [
    { rank: 0, damage: 0, message: 'Hard blow, but deflected. Not much damage.', effects: [], wounds: [] },
    { rank: 1, damage: 3, message: 'Quick slash to the [target]\'s upper left arm! Just a nick.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 7, message: 'Slash to the [target]\'s shield arm! Shears off a thin layer of skin!', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 8, message: 'Glancing slash to the [target]\'s shield arm!', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 10, message: 'Powerful slash just cracks the [target]\'s shield arm!', effects: ['S2'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: 'Deep slash to the [target]\'s left forearm!', effects: ['S3'], wounds: ['R2'] },
    { rank: 6, damage: 20, message: 'Off-balance slash to the [target]\'s left arm shatters its elbow. "CRUNCH"', effects: ['S5'], wounds: ['R2'] },
    { rank: 7, damage: 25, message: 'Hard slash to the [target]\'s side! Left arm no longer available for use.', effects: ['S6', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 35, message: 'Spectacular slash! The [target]\'s left arm is neatly amputated!', effects: ['S8', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: 'Awesome slash severs the [target]\'s left arm! A jagged stump is all that remains!', effects: ['S10', 'A'], wounds: ['R3'] }
  ],
  RIGHT_HAND: [
    { rank: 0, damage: 0, message: 'Near-miss! That\'ll hurt tomorrow.', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Diagonal slash to the [target]\'s weapon arm. Strike misses but bruises a few knuckles.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Wild slash bounces off the back of the [target]\'s hand.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 5, message: 'Feint to the [target]\'s head! Quick flick at its weapon hand! Nasty cut to right hand!', effects: [], wounds: ['R1'] },
    { rank: 4, damage: 7, message: 'Strong slash to the [target]\'s right hand cuts deep.', effects: ['S1'], wounds: ['R2'] },
    { rank: 5, damage: 5, message: 'Slash to the [target]\'s weapon hand! Several fingers fly!', effects: ['S2'], wounds: ['R2'] },
    { rank: 6, damage: 10, message: 'Rapped the [target]\'s knuckles hard! Right hand sounds broken.', effects: ['S3'], wounds: ['R2'] },
    { rank: 7, damage: 15, message: 'Jagged slash to the [target]\'s right arm! Cut clean through at the wrist. Need a hand?', effects: ['S4', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 25, message: 'Powerful slash trims the [target]\'s fingernails... and the remainder of its right hand!', effects: ['S5', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 30, message: 'Off-balanced slash! Enough force to sever the [target]\'s right hand! Amazing!', effects: ['S10', 'A'], wounds: ['R3'] }
  ],
  LEFT_HAND: [
    { rank: 0, damage: 0, message: 'Near-miss! Knuckles kissed but little damage.', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Slash to the [target]\'s shield arm. Strike trims off a few fingernails.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Wild slash scratches the back of the [target]\'s hand.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 5, message: 'Slice to the [target]\'s left fingers. Nice move.', effects: [], wounds: ['R1'] },
    { rank: 4, damage: 7, message: 'Deep cut to the [target]\'s left hand! Seems to have broken some fingers too.', effects: ['S1'], wounds: ['R2'] },
    { rank: 5, damage: 8, message: 'Slash to the [target]\'s shield hand! Several fingers fly!', effects: ['S2'], wounds: ['R2'] },
    { rank: 6, damage: 10, message: 'Rapped the knuckles hard! Left hand sounds broken.', effects: ['S3'], wounds: ['R2'] },
    { rank: 7, damage: 15, message: 'Jagged slash to the [target]\'s left arm! Cut clean through at the wrist. Need a hand?', effects: ['S4', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 25, message: 'Powerful slash trims the [target]\'s fingernails... and the remainder of its left hand!', effects: ['S5', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 30, message: 'Off-balanced slash! Enough force to sever the [target]\'s left hand! Amazing!', effects: ['S10', 'A'], wounds: ['R3'] }
  ],
  RIGHT_LEG: [
    { rank: 0, damage: 0, message: 'Quick feint to the [target]\'s right foot! Little extra damage.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Slash to the [target]\'s right leg hits high! Kinda makes your knees weak, huh?', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Banged the [target]\'s right shin. That\'ll raise a good welt.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 10, message: 'Downward slash across the [target]\'s right thigh! Might not scar.', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 17, message: 'Deep, bloody slash to the [target]\'s right thigh!', effects: ['S3', 'K'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: 'Quick, powerful slash to the [target]\'s right knee!', effects: ['S5', 'K'], wounds: ['R2'] },
    { rank: 6, damage: 25, message: 'Strong slash to the [target]\'s right leg! Muscles exposed! Not a pretty sight.', effects: ['S6', 'K'], wounds: ['R2'] },
    { rank: 7, damage: 30, message: 'Wild downward slash severs the [target]\'s right foot! Bloody stump, anyone?', effects: ['S8', 'K', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Powerful slash! The [target]\'s right leg is severed at the knee!', effects: ['S10', 'K', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 45, message: 'Powerful slash leaves the [target] without a right leg!', effects: ['S12', 'K', 'A'], wounds: ['R3'] }
  ],
  LEFT_LEG: [
    { rank: 0, damage: 0, message: 'Light, bruising slash to the [target]\'s left thigh.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Slash to the [target]\'s left leg hits high! Kinda makes your knees weak, huh?', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Banged the [target]\'s left shin. That\'ll raise a good welt.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 10, message: 'Downward slash across the [target]\'s left thigh! Gouges bone!', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 17, message: 'Deft slash to the [target]\'s left leg digs deep! Bone is chipped!', effects: ['S3', 'K'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: 'Quick, powerful slash to the [target]\'s left knee!', effects: ['S5', 'K'], wounds: ['R2'] },
    { rank: 6, damage: 25, message: 'Weak diagonal slash catches the [target]\'s left knee! It is dislocated.', effects: ['S6', 'K'], wounds: ['R2'] },
    { rank: 7, damage: 30, message: 'Wild downward slash severs the [target]\'s left foot! Bloody stump, anyone?', effects: ['S8', 'K', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Powerful slash! The [target]\'s left leg is severed at the knee!', effects: ['S10', 'K', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 45, message: 'Powerful slash leaves the [target] without a left leg!', effects: ['S12', 'K', 'A'], wounds: ['R3'] }
  ]
};

