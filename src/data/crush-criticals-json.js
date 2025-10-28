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
  ]
};

