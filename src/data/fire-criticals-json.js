'use strict';

/**
 * Fire Critical Hit Table Data
 */
module.exports = {
  HEAD: [
    { rank: 0, damage: 0, message: 'Blast of hot air to head dries foe\'s hair.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Minor burns to head. That hurts a bit.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Burst of flames to head catches ears on fire! Yeeoww!', effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Burst of flames char forehead a crispy black.', effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 20, message: 'Flames engulf head searing hair and scalp. Sickening!', effects: ['S6'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Flames incinerate scalp completely and blacken scullcap.', effects: ['S10'], wounds: ['R3'] },
    { rank: 6, damage: 30, message: 'Head explodes in flames! Grab some marshmallows.', effects: ['F'], wounds: ['R3'] },
    { rank: 7, damage: 35, message: 'Flame sets a [target]\'s head alight like a torch. Burned beyond recognition.', effects: ['F'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Head reduced to a charred stump.', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 50, message: 'Head explodes, splattering sizzling bits of flesh and bone everywhere.', effects: ['F'], wounds: ['R3'] }
  ],
  NECK: [
    { rank: 0, damage: 0, message: 'Flames brush foe\'s neck. Some sweat but not much else.', effects: [], wounds: [] },
    { rank: 1, damage: 2, message: 'Minor burns to neck. Looks uncomfortable.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 5, message: 'Burst of flames to neck. Yuck!', effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 10, message: 'Burst of flames chars neck a crispy black.', effects: ['S2'], wounds: ['R2'] },
    { rank: 4, damage: 12, message: 'Flames incinerate muscle tissue in neck exposing trachea. More than you ever wanted to see.', effects: ['S4'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: 'Flames burn neck into a bubbling mass of flesh. Forget lunch.', effects: ['S8'], wounds: ['R3'] },
    { rank: 6, damage: 20, message: 'Fire burns through neck and destroys carotid artery. Painfully bloody way to die.', effects: ['F'], wounds: ['R3'] },
    { rank: 7, damage: 25, message: 'A [target] takes a breath of super-heated air and expires gasping.', effects: ['F'], wounds: ['R3'] },
    { rank: 8, damage: 30, message: 'Neck consumed in flame and charred to a crisp.', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: 'Neck completely incinerated; head drops to the ground and rolls to your feet!', effects: ['F'], wounds: ['R3'] }
  ],
  RIGHT_EYE: [
    { rank: 0, damage: 0, message: 'Flames tickle right eye. Eyebrow singed.', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Minor burns to right eye. Foe blinks back the tears.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Burst of flames to right eye bakes eyelid.', effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 5, message: 'Burst of flames to right eye incinerates eyelid. Gruesome.', effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 10, message: 'Horrid burns seal right eye. Consider an eyepatch.', effects: ['S5'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: 'Flames toast right cornea. Consider an eyepatch.', effects: ['S10'], wounds: ['R3'] },
    { rank: 6, damage: 30, message: 'Right eye propelled out of socket by fiery explosion!', effects: ['S12'], wounds: ['R3'] },
    { rank: 7, damage: 40, message: 'Right eye catches fire, quickly bringing [target]\'s brain to a boil.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 8, damage: 45, message: 'Right eye evaporates in a burst of flame. Death from shock follows.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 9, damage: 50, message: 'Super-heated flame causes right eye to explode inward.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] }
  ],
  LEFT_EYE: [
    { rank: 0, damage: 0, message: 'Flames tickle left eye. Eyebrow singed.', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Minor burns to left eye. Foe blinks back the tears.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Burst of flames to left eye bakes eyelid.', effects: ['S1'], wounds: ['R1'] },
    { rank: 3, damage: 5, message: 'Burst of flames to left eye incinerates eyelid. Gruesome.', effects: ['S3'], wounds: ['R2'] },
    { rank: 4, damage: 10, message: 'Horrid burns seal left eye. Consider an eyepatch.', effects: ['S5'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: 'Flames toast left cornea. Consider an eyepatch.', effects: ['S10'], wounds: ['R3'] },
    { rank: 6, damage: 30, message: 'Left eye propelled out of socket by fiery explosion!', effects: ['S12'], wounds: ['R3'] },
    { rank: 7, damage: 40, message: 'Flame engulfs foe\'s left eye, setting it ablaze. Mercifully, death follows quickly.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 8, damage: 45, message: 'Intense heat causes left eye to evaporate. Death from shock is unavoidable.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] },
    { rank: 9, damage: 50, message: 'Left eye explodes. Sizzling pieces of brain drip from the empty socket.', effects: ['F'], wounds: ['R3 eye', 'R3 head'] }
  ],
  CHEST: [
    { rank: 0, damage: 0, message: 'Burst of flames to chest. Didn\'t hurt much.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Minor burns to chest. That hurts a bit.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Burst of flames to chest toasts skin nicely.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Burst of flames char chest a crisp black.', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Nasty burns to chest make you wish you never heard of heartburn.', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Flames burn hole in chest exposing ribs.', effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 30, message: 'Flames cook a [target]\'s chest. Looks about medium well.', effects: ['S6'], wounds: ['R3'] },
    { rank: 7, damage: 50, message: 'Skin and some muscle burnt off chest.', effects: ['S8'], wounds: ['R3'] },
    { rank: 8, damage: 60, message: 'Flames engulf body. Chest left a smoldering ruin.', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 70, message: 'Fire completely surrounds [target]. Blood boils and heart stops.', effects: ['F'], wounds: ['R3'] }
  ],
  ABDOMEN: [
    { rank: 0, damage: 0, message: 'Burst of flames to abdomen. Didn\'t hurt much.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Minor burns to abdomen. Looks painful.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Burst of flames to abdomen toasts skin nicely.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Burst of flames chars abdomen a crispy black.', effects: ['S1'], wounds: ['R2'] },
    { rank: 4, damage: 20, message: 'Nasty burns to abdomen, [target] shrieks in pain!', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Abdomen bursts into flames. Would be funny without the blood.', effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 30, message: 'Flames cook [target]\'s abdomen. Looks about medium well.', effects: ['S6'], wounds: ['R3'] },
    { rank: 7, damage: 50, message: 'Permanently debilitating burns across stomach.', effects: ['S8'], wounds: ['R3'] },
    { rank: 8, damage: 60, message: 'Intestines rupture from intense heat; dies a slow, painful death.', effects: ['F'], wounds: ['R3'] },
    { rank: 9, damage: 70, message: 'Flame burns through abdomen. Greasy smoke billows forth.', effects: ['F'], wounds: ['R3'] }
  ],
  BACK: [
    { rank: 0, damage: 0, message: 'Blast of flames to back. More bother than pain.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Minor burns to back. Looks uncomfortable.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Burst of flames to back toasts skin nicely.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Burst of flames to back fries shoulder blades.', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 20, message: 'Nasty burns to back. Won\'t be sleeping on that for awhile.', effects: ['S3'], wounds: ['R2'] },
    { rank: 5, damage: 25, message: 'Back bursts into a spectacular display of flames. Bet it hurts too.', effects: ['S5'], wounds: ['R2'] },
    { rank: 6, damage: 30, message: 'Flames cook [target]\'s back. Looks about medium well.', effects: ['S6'], wounds: ['R3'] },
    { rank: 7, damage: 50, message: 'A large patch of flesh is seared off [target]\'s back.', effects: ['S8'], wounds: ['R3'] },
    { rank: 8, damage: 60, message: 'Flame engulfs back: [target] flambe!', effects: ['F'], wounds: ['R3 back', 'R3 nerves'] },
    { rank: 9, damage: 70, message: 'Back burnt to the bone. Smoke curls up from what\'s left..', effects: ['F'], wounds: ['R3 back', 'R3 nerves'] }
  ],
  RIGHT_ARM: [
    { rank: 0, damage: 0, message: 'Flames tickle right arm. Hair singed.', effects: [], wounds: [] },
    { rank: 1, damage: 3, message: 'Minor burns to right arm. That hurts a bit.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 7, message: 'Burst of flames to right arm burns skin bright red.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 8, message: 'Burst of flames to right arm toasts skin to elbows.', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 10, message: 'Nasty burns to right arm. Gonna need lots of butter.', effects: ['S2'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: 'Flames incinerate right arm to the bone. Not a pleasant sight.', effects: ['S3'], wounds: ['R2'] },
    { rank: 6, damage: 20, message: 'Extreme heat causes [target]\'s right arm to expand and snap. That must hurt!', effects: ['S5'], wounds: ['R2'] },
    { rank: 7, damage: 25, message: 'Right arm scorched so bad it might as well be gone.', effects: ['S6', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 35, message: 'Right forearm burned clean off. At least it\'s cauterized.', effects: ['S8', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: 'Flame consumes [target]\'s right arm all the way to the shoulder.', effects: ['S10', 'A'], wounds: ['R3'] }
  ],
  LEFT_ARM: [
    { rank: 0, damage: 0, message: 'Flames tickle left arm. Hair singed.', effects: [], wounds: [] },
    { rank: 1, damage: 3, message: 'Minor burns to left arm. That hurts a bit.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 7, message: 'Burst of flames to left arm burns skin bright red.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 8, message: 'Burst of flames to left arm toasts skin to elbows.', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 10, message: 'Nasty burns to left arm. Gonna need lots of butter.', effects: ['S2'], wounds: ['R2'] },
    { rank: 5, damage: 15, message: 'Flames incinerate left arm to the bone. Not a pleasant sight.', effects: ['S3'], wounds: ['R2'] },
    { rank: 6, damage: 20, message: 'Extreme heat causes [target]\'s left arm to expand and snap. That must hurt!', effects: ['S5'], wounds: ['R2'] },
    { rank: 7, damage: 25, message: 'Blaze chars [target]\'s left arm. What\'s left is unusable.', effects: ['S6', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 35, message: 'Left arm burnt away at elbow. Ointment won\'t help.', effects: ['S8', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 40, message: 'Left arm incinerated. Unfortunate.', effects: ['S10', 'A'], wounds: ['R3'] }
  ],
  RIGHT_HAND: [
    { rank: 0, damage: 0, message: 'Burst of flame to right hand singes knuckles.', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Minor burns to right hand. Ouch!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Burst of flames to right hand burns fingers bright red.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 5, message: 'Burst of flames to right hand fries palm. Ouch!', effects: [], wounds: ['R1'] },
    { rank: 4, damage: 7, message: 'Nasty burns to right hand. Gonna need lots of butter.', effects: ['S1'], wounds: ['R2'] },
    { rank: 5, damage: 8, message: 'Right hand fried to a crisp. Think barbecue sauce.', effects: ['S2'], wounds: ['R2'] },
    { rank: 6, damage: 10, message: 'Extreme heat melts the skin off [target]\'s right hand. Gross!', effects: ['S3'], wounds: ['R2'] },
    { rank: 7, damage: 15, message: 'Skin and muscle seared off right hand. Not much left.', effects: ['S4', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 25, message: 'Right hand reduced to smoking ash. Too bad would have come in handy.', effects: ['S5', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 30, message: 'Unbelievable heat melts hand down to the wrist.', effects: ['S7', 'A'], wounds: ['R3'] }
  ],
  LEFT_HAND: [
    { rank: 0, damage: 0, message: 'Burst of flame to left hand singes knuckles.', effects: [], wounds: [] },
    { rank: 1, damage: 1, message: 'Minor burns to left hand. Ouch!', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 3, message: 'Burst of flames to left hand burns fingers bright red.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 5, message: 'Burst of flames to left hand fries palm. Ouch!', effects: [], wounds: ['R1'] },
    { rank: 4, damage: 7, message: 'Nasty burns to left hand. Gonna need lots of butter.', effects: ['S1'], wounds: ['R2'] },
    { rank: 5, damage: 8, message: 'Left hand fried to a crisp. Think barbecue sauce.', effects: ['S2'], wounds: ['R2'] },
    { rank: 6, damage: 10, message: 'Extreme heat melts the skin off [target]\'s left hand. Gross!', effects: ['S3'], wounds: ['R2'] },
    { rank: 7, damage: 15, message: 'Several fingers consumed from left hand. The rest are unusable.', effects: ['S4', 'A'], wounds: ['R3'] },
    { rank: 8, damage: 25, message: 'Flame burns everything but the bones from left hand.', effects: ['S5', 'A'], wounds: ['R3'] },
    { rank: 9, damage: 30, message: 'Left hand burned off. Only a stump remains.', effects: ['S7', 'A'], wounds: ['R3'] }
  ],
  RIGHT_LEG: [
    { rank: 0, damage: 0, message: 'Flames tickle right leg. Feels warm.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Minor burns to right leg. That hurts a bit.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Burst of flames to right leg burns skin bright red.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Burst of flames to right leg blackens kneecap.', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 17, message: 'Nasty burns to right leg. Gonna need lots of butter.', effects: ['S3', 'K'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: 'Flames incinerate right leg to the bone. Not a pleasant sight.', effects: ['S5', 'K'], wounds: ['R2'] },
    { rank: 6, damage: 25, message: 'Extreme heat causes right leg to expand and snap. That must hurt!', effects: ['S6', 'K'], wounds: ['R2'] },
    { rank: 7, damage: 30, message: 'Right leg horribly scorched. Won\'t be usable for weeks.', effects: ['S8', 'A', 'K'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'The lower half of [target]\'s right leg is almost completely burned away.', effects: ['S10', 'A', 'K'], wounds: ['R3'] },
    { rank: 9, damage: 45, message: 'Right leg aflame. When the smoke clears, there\'s nothing left.', effects: ['S12', 'A', 'K'], wounds: ['R3'] }
  ],
  LEFT_LEG: [
    { rank: 0, damage: 0, message: 'Flames tickle left leg. Feels warm.', effects: [], wounds: [] },
    { rank: 1, damage: 5, message: 'Minor burns to left leg. That hurts a bit.', effects: [], wounds: ['R1'] },
    { rank: 2, damage: 10, message: 'Burst of flames to left leg burns skin bright red.', effects: [], wounds: ['R1'] },
    { rank: 3, damage: 15, message: 'Burst of flames to left leg blackens kneecap.', effects: ['S1'], wounds: ['R1'] },
    { rank: 4, damage: 17, message: 'Nasty burns to left leg. Gonna need lots of butter.', effects: ['S3', 'K'], wounds: ['R2'] },
    { rank: 5, damage: 20, message: 'Flames incinerate left leg to the bone. Not a pleasant sight.', effects: ['S5', 'K'], wounds: ['R2'] },
    { rank: 6, damage: 25, message: 'Extreme heat causes left leg to expand and snap. That must hurt!', effects: ['S6', 'K'], wounds: ['R2'] },
    { rank: 7, damage: 30, message: 'Scorching heat shrivels left leg to a useless black mass.', effects: ['S8', 'A', 'K'], wounds: ['R3'] },
    { rank: 8, damage: 40, message: 'Left leg burned off at the knee. Ouch.', effects: ['S10', 'A', 'K'], wounds: ['R3'] },
    { rank: 9, damage: 45, message: 'Left leg completely charred.', effects: ['S12', 'A', 'K'], wounds: ['R3'] }
  ]
};

