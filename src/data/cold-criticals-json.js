'use strict';

// Cold (ice/water) criticals, partial table covering all body parts ranks 0-9
// Messages include [target] placeholder to be replaced at runtime

module.exports = {
  HEAD: [
    { rank: 0, damage: 0, message: "Cool breeze! Hear it whistling through the [target]'s ears?", wounds: [] },
    { rank: 1, damage: 5, message: "Chilly blast to the head. Bet the [target]'s ears are tingling!", wounds: ['R1'] },
    { rank: 2, damage: 10, message: "Cold blast to the ears. The [target] should have worn a hat!", effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 15, message: "Icy blast to the head and the [target] is reeling!", effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 20, message: "Solid blow to the head exposes grey matter on ice!", effects: ['S6'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: "Massive strike of icy shards shatters the [target]'s skull!", effects: ['S10'], wounds: ['R3'] },
    { rank: 6, damage: 30, message: "The [target] gets a glassy look in its eyes as blast connects solidly... or is that an icy stare?", effects: ['F'], wounds: ['R3'] },
    { rank: 7, damage: 35, message: "Head freezes solid and the [target] topples over, shattering skull on impact.", effects: ['F'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: "Icy shards bombard the [target]'s head and exit its ear, leaving little behind!", effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 50, message: "Freezing blast turns facial features a stunning, but very unhealthy shade of blue.", effects: ['F'], wounds: ['R3'] }
  ],
  NECK: [
    { rank: 0, damage: 0, message: "A cool breeze brushes the nape of the [target]'s neck.", wounds: [] },
    { rank: 1, damage: 2, message: "A frosty blow to the neck. Bet that smarts!", wounds: ['R1'] },
    { rank: 2, damage: 5, message: "Ouch! What a stiff neck.", effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 10, message: "Stiff blast of icy air to neck!", effects: ['S2'], wounds: ['R2'] },
    { rank: 4, damage: 12, message: "Frigid blast rearranges the [target]'s neck.", effects: ['S4'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: "Slivers of ice slice the [target]'s throat into ribbons of flesh and blood!", effects: ['S8'], wounds: ['R3'] },
    { rank: 6, damage: 20, message: "Icy blast to neck freezes the [target]'s words in mid-speech and leaves it speechless...permanently!", effects: ['F'], wounds: ['R3'] },
    { rank: 7, damage: 25, message: "Base of skull frozen, removing any feeling from the neck down. The [target] lives just long enough to realize a painless death!", effects: ['F'], wounds: ['R3'] },
    { rank: 8, damage: 30, message: "Icy shards slice through the [target]'s neck...leaving breathing no longer necessary -- or possible!", effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: "Blast to neck causes the [target] to jerk with pain. Unfortunately that snaps the now frozen neck like an icicle!", effects: ['F'], wounds: ['R3'] }
  ],
  RIGHT_EYE: [
    { rank: 0, damage: 0, message: "Frost forms on the [target]'s right eyebrow, aging it a bit.", wounds: [] },
    { rank: 1, damage: 1, message: "Near miss! Ice particles sting the [target]'s eye and it blinks rapidly.", wounds: ['R1'] },
    { rank: 2, damage: 3, message: "Chilly blast to the right eye leaves the [target] in tears.", effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 5, message: "Cold compresses will help the swelling of the [target]'s right eye!", effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 10, message: "Icy bolt to the right eye! Ouch! Ice cream headache!", effects: ['S5'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: "A frigid attack leaves the [target] blinded in its right eye. Bet it didn't see it coming!", effects: ['S10'], wounds: ['R3'] },
    { rank: 6, damage: 30, message: "Icy blast blinds the [target]'s eye. But it won't need eyes anyway!", effects: ['F'], wounds: ['R3'] },
    { rank: 7, damage: 30, message: "Wicked slash of frigid energy shatters right eye into a thousand tiny particles! Penetration to the brain causes instant death!", effects: ['F'], wounds: ['R3'] },
    { rank: 8, damage: 45, message: "Failed to evade blast! Eye and brain splintered beyond recognition.", effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 50, message: "Fatal strike to the right eye! Brain frozen and so is the [target]!", effects: ['F'], wounds: ['R3'] }
  ],
  LEFT_EYE: [
    { rank: 0, damage: 0, message: "Frost forms on the [target]'s left eyebrow, aging it a bit.", wounds: [] },
    { rank: 1, damage: 1, message: "Near miss! Ice particles sting the [target]'s eye and it blinks rapidly.", wounds: ['R1'] },
    { rank: 2, damage: 3, message: "Chilly blast to the left eye leaves the [target] in tears.", effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 5, message: "Cold compresses will help the swelling of the [target]'s left eye!", effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 10, message: "Icy bolt to the left eye! Ouch! Ice cream headache!", effects: ['S5'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: "A frigid attack leaves the [target] blinded in its left eye. Bet it didn't see it coming!", effects: ['S10'], wounds: ['R3'] },
    { rank: 6, damage: 30, message: "Icy blast blinds the [target]'s eye. But it won't need eyes anyway!", effects: ['F'], wounds: ['R3'] },
    { rank: 7, damage: 30, message: "Wicked slash of frigid energy shatters left eye into a thousand tiny particles! Penetration to the brain causes instant death!", effects: ['F'], wounds: ['R3'] },
    { rank: 8, damage: 45, message: "Failed to evade blast! Eye and brain splintered beyond recognition.", effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 50, message: "Fatal strike to the left eye! Brain frozen and so is the [target]!", effects: ['F'], wounds: ['R3'] }
  ],
  CHEST: [
    { rank: 0, damage: 0, message: "The [target] looks slightly uncomfortable.", wounds: [] },
    { rank: 1, damage: 5, message: "Chilly blast to the chest causes heart to skip a beat.", wounds: ['R1'] },
    { rank: 2, damage: 10, message: "A chilly blast strikes the [target] in the chest, knocking him back a step.", wounds: ['R1'] },
    { rank: 3, damage: 15, message: "The [target] failed to sidestep the chilly blast. Bruised ribs anyone?", effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: "Darn! Frozen ribs take longer to cook, and broken ones to boot!", effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: "Solid blast of ice square to the chest rocks the [target] back on its heels!", effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 30, message: "Freezing blast opens a gaping hole in the [target]'s chest!", effects: ['S6'], wounds: ['R3'] },
    { rank: 7, damage: 30, message: "Brrrrr! That was a cold blow to the chest!", effects: ['S8'], wounds: ['R3'] },
    { rank: 8, damage: 60, message: "The [target] drops in its tracks as the bitter cold freezes its lungs solid!", effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 70, message: "Icy blast deep freezes one perfectly good heart!", effects: ['F'], wounds: ['R3'] }
  ],
  ABDOMEN: [
    { rank: 0, damage: 0, message: "The [target] barely notices the cool burst of energy.", wounds: [] },
    { rank: 1, damage: 5, message: "Icy chill to the [target]'s midriff. Looks like a bowl of nice hot stew is in order.", wounds: ['R1'] },
    { rank: 2, damage: 10, message: "A chilly blow to the stomach winds the [target]!", wounds: ['R1'] },
    { rank: 3, damage: 15, message: "The icy blast tears into the [target]'s stomach!", effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: "A gallant effort to elude the blast, but you got the [target] in the hip!", effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: "Pieces of an icy substance slice the [target]'s abdomen to shreds!", effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 30, message: "A frigid burst of energy to the stomach leaves the [target] reeling.", effects: ['S6'], wounds: ['R2'] },
    { rank: 7, damage: 30, message: "The [target] reels from a direct hit to the stomach. No food for a while!", effects: ['S8'], wounds: ['R3'] },
    { rank: 8, damage: 60, message: "The [target] fails to avoid the icy blast and that, as the story goes, is it!", effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 70, message: "Belly is now a block of ice. So much for breakfast!", effects: ['F'], wounds: ['R3'] }
  ],
  BACK: [
    { rank: 0, damage: 0, message: "A slight shiver runs down the [target]'s back.", wounds: [] },
    { rank: 1, damage: 5, message: "My! It looks like the [target] will be stiff in the morning! Better ice down the bruises!", wounds: ['R1'] },
    { rank: 2, damage: 10, message: "An icy blast to the back! Sleeping will not be easy tonight.", effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 15, message: "Near miss! Cool blast to the lower back and the [target] staggers.", effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: "Icy strike to the back scores a direct hit!", effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: "Strange how the cold can burn.", effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 30, message: "Ouch! Slivers of ice in the strike easily penetrate to the [target]'s spine.", effects: ['S6'], wounds: ['R2'] },
    { rank: 7, damage: 30, message: "An icy slash across the lower back slices deep into the [target]'s muscle!", effects: ['S8'], wounds: ['R3'] },
    { rank: 8, damage: 60, message: "Deadly accurate hit! The [target]'s back is shattered into icy oblivion!", effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 70, message: "Deadly accuracy shatters the [target]'s spine into a thousand tiny icy shards!", effects: ['F'], wounds: ['R3'] }
  ],
  RIGHT_ARM: [
    { rank: 0, damage: 0, message: "Cool touch! Look at the goosebumps!", wounds: [] },
    { rank: 1, damage: 3, message: "The [target] winces at the cold blast to the right arm.", wounds: ['R1'] },
    { rank: 2, damage: 7, message: "The [target] just got the cold shoulder!", effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 8, message: "The [target]'s right arm trembles with the cold.", effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 10, message: "Cold blast rends muscles from bone!", effects: ['S2'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: "Right arm shattered by an extremely well placed hit!", effects: ['S3'], wounds: ['R2'] },
    { rank: 6, damage: 20, message: "The [target] pales as your chillingly accurate shot penetrates to the bone.", effects: ['S5'], wounds: ['R2'] },
    { rank: 7, damage: 25, message: "Icy blast takes right arm off at the shoulder!", effects: ['S6','A'], wounds: ['R3'] },
    { rank: 8, damage: 35, message: "Weapon arm freeze-dried! Add water and stir.", effects: ['S8','A'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: "Advanced case of frostbite removes right arm at the shoulder!", effects: ['S10','A'], wounds: ['R3'] }
  ],
  LEFT_ARM: [
    { rank: 0, damage: 0, message: "Cool touch! Look at the goosebumps!", wounds: [] },
    { rank: 1, damage: 3, message: "The [target] winces at the cold blast to the left arm.", wounds: ['R1'] },
    { rank: 2, damage: 7, message: "The [target] just got the cold shoulder!", effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 8, message: "The [target]'s left arm trembles with the cold.", effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 10, message: "Left arm is shattered by cold blast!", effects: ['S2'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: "Left arm fractured by an icy blast!", effects: ['S3'], wounds: ['R2'] },
    { rank: 6, damage: 20, message: "Boiling water would feel better than that!", effects: ['S5'], wounds: ['R2'] },
    { rank: 7, damage: 25, message: "The [target]'s left arm is shattered beyond recognition by frigid blow.", effects: ['S6','A'], wounds: ['R3'] },
    { rank: 8, damage: 35, message: "Oops. Shield arm freeze-dried!", effects: ['S8','A'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: "Advanced case of frostbite and shield arm is history!", effects: ['S10','A'], wounds: ['R3'] }
  ],
  RIGHT_HAND: [
    { rank: 0, damage: 0, message: "Cold hands, warm heart!", wounds: [] },
    { rank: 1, damage: 1, message: "The [target]'s right hand turns an interesting shade of light blue.", wounds: ['R1'] },
    { rank: 2, damage: 3, message: "Almost missed! A pair of gloves would have helped!", wounds: ['R1'] },
    { rank: 3, damage: 5, message: "The [target] jumps back as your chilly attack bruises its weapon hand!", wounds: ['R1'] },
    { rank: 4, damage: 8, message: "Icy blast freezes the [target]'s right hand!", effects: ['S1'], wounds: ['R2'] },
    { rank: 5, damage: 10, message: "Nice Strike! The [target]'s fingers snap as its right hand freezes solid.", effects: ['S3'], wounds: ['R2'] },
    { rank: 6, damage: 10, message: "The [target] grimaces as your attack fractures its right wrist.", effects: ['S3'], wounds: ['R2'] },
    { rank: 7, damage: 10, message: "Polar blast decimates the [target]'s right hand!", effects: ['S4','A'], wounds: ['R3'] },
    { rank: 8, damage: 25, message: "Right hand freezes solid before falling off! Say hello to Lefty!", effects: ['S5','A'], wounds: ['R3'] },
    { rank: 9, damage: 30, message: "Frigid blast renders the [target]'s right hand useless - missing even!", effects: ['S7','A'], wounds: ['R3'] }
  ],
  LEFT_HAND: [
    { rank: 0, damage: 0, message: "Cold hands, warm heart!", wounds: [] },
    { rank: 1, damage: 1, message: "The [target]'s left hand turns an interesting shade of light blue.", wounds: ['R1'] },
    { rank: 2, damage: 3, message: "Almost missed! Bet the [target] wants warm pockets now.", wounds: ['R1'] },
    { rank: 3, damage: 5, message: "The [target] jumps back as your chilly attack bruises his left hand!", wounds: ['R1'] },
    { rank: 4, damage: 8, message: "Icy blast freezes the [target]'s left hand!", effects: ['S1'], wounds: ['R2'] },
    { rank: 5, damage: 10, message: "Nice Strike! The [target]'s fingers snap as its left hand freezes solid.", effects: ['S3'], wounds: ['R2'] },
    { rank: 6, damage: 10, message: "The [target] grimaces as your attack fractures its left wrist.", effects: ['S3'], wounds: ['R2'] },
    { rank: 7, damage: 10, message: "Polar blast decimates the [target]'s left hand!", effects: ['S4','A'], wounds: ['R3'] },
    { rank: 8, damage: 25, message: "Hand freezes solid before falling off! Who needs a left hand anyway?", effects: ['S5','A'], wounds: ['R3'] },
    { rank: 9, damage: 30, message: "Frigid blast renders the [target]'s left hand useless - missing even!", effects: ['S7','A'], wounds: ['R3'] }
  ],
  RIGHT_LEG: [
    { rank: 0, damage: 0, message: "A cool breeze brushes the [target]'s right leg, barely raising a hair.", wounds: [] },
    { rank: 1, damage: 5, message: "Brrrr! That was a good hit to the right leg! Knocked the [target] silly.", wounds: ['R1'] },
    { rank: 2, damage: 10, message: "The [target] appears to be getting cold feet.", wounds: ['R1'] },
    { rank: 3, damage: 15, message: "The [target] dances as the blast of cold air contacts heretofore warm toes.", effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 17, message: "Blast of cold air to right knee causes a polar knee cap!", effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: "The [target] staggers as your icy attack shatters its right leg.", effects: ['S5','K'], wounds: ['R2'] },
    { rank: 6, damage: 25, message: "Pain fills the [target]'s face as its right ankle shatters from the icy blast.", effects: ['S6','K'], wounds: ['R2'] },
    { rank: 7, damage: 30, message: "What was once the [target]'s right leg shatters with your well placed strike!", effects: ['S8','A','K'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: "A freezing and accurate strike renders the [target]'s right leg a fond memory!", effects: ['S10','A','K'], wounds: ['R3'] },
    { rank: 9, damage: 45, message: "Frigid blast shatters the [target]'s right leg beyond all recognition!", effects: ['S12','A','K'], wounds: ['R3'] }
  ],
  LEFT_LEG: [
    { rank: 0, damage: 0, message: "A cool breeze brushes the [target]'s left leg, barely raising a hair.", wounds: [] },
    { rank: 1, damage: 5, message: "Brrrr! That was a good hit to the left leg! Knocked the [target] silly.", wounds: ['R1'] },
    { rank: 2, damage: 10, message: "The [target] looks as if a hot foot would feel good about now!", wounds: ['R1'] },
    { rank: 3, damage: 10, message: "The [target] falters as a chill blast of air strikes its left leg!", effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 17, message: "Blast of cold air to left knee causes a polar knee cap!", effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: "The [target] staggers as your icy attack shatters its left leg.", effects: ['S5','K'], wounds: ['R2'] },
    { rank: 6, damage: 25, message: "Pain fills the [target]'s face as his left ankle shatters from the icy blast.", effects: ['S6','K'], wounds: ['R2'] },
    { rank: 7, damage: 30, message: "What was once the [target]'s left leg shatters with your well placed strike!", effects: ['S8','A','K'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: "A freezing and accurate strike renders the [target]'s left leg a fond memory!", effects: ['S10','A','K'], wounds: ['R3'] },
    { rank: 9, damage: 45, message: "Frigid blast shatters the [target]'s left leg beyond all recognition!", effects: ['S12','A','K'], wounds: ['R3'] }
  ]
};


