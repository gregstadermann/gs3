'use strict';

/**
 * Non-Corporeal Critical Hit Table Data
 * For creatures without physical bodies (wraiths, phantoms, etc.)
 * Note: Damage values are variable (V) - depends on attack type
 * Note: Status effects and wounds not applicable (N/A)
 */
module.exports = {
  HEAD: [
    { rank: 0, damage: 0, message: 'Light tap to the [target]\'s head ruffles its appearance.', effects: [], wounds: [] },
    { rank: 1, damage: 0, message: 'Quick blow to the head. Swirls of vapor dance around the [target]\'s head.', effects: [], wounds: [] },
    { rank: 2, damage: 0, message: 'Light strike to the [target]\'s head. A wisp of vapor trickles earthward.', effects: [], wounds: [] },
    { rank: 3, damage: 0, message: 'Top of the head momentarily flattened.', effects: [], wounds: [] },
    { rank: 4, damage: 0, message: 'Swift strike would have hit more than an ear, if only it were there.', effects: [], wounds: [] },
    { rank: 5, damage: 0, message: 'The [target]\'s head wavers as your attack passes right through it!', effects: [], wounds: [] },
    { rank: 6, damage: 0, message: 'Strong blow to the head! The [target] enjoys the breeze.', effects: [], wounds: [] },
    { rank: 7, damage: 0, message: 'Your attack whistles right through the [target]\'s face. Dimples!', effects: [], wounds: [] },
    { rank: 8, damage: 0, message: 'The [target]\'s head is split cleanly in two, but reseals from the neck up!', effects: [], wounds: [] },
    { rank: 9, damage: 0, message: 'Strong attack separates head from shoulders. Head disappears in the breeze as a new one forms on the [target]\'s shoulders!', effects: [], wounds: [] }
  ],
  NECK: [
    { rank: 0, damage: 0, message: 'Light blow to the neck causes even more unpleasant groans and wails.', effects: [], wounds: [] },
    { rank: 1, damage: 0, message: 'Weak blow to neck wouldn\'t have scared the [target] even if it were still alive.', effects: [], wounds: [] },
    { rank: 2, damage: 0, message: 'Flashy attack passes through the side of the neck. Ethereal fluids spray forth and quickly vanish into vapor!', effects: [], wounds: [] },
    { rank: 3, damage: 0, message: 'Smoky tendrils rise from neck as your attack sweeps through.', effects: [], wounds: [] },
    { rank: 4, damage: 0, message: 'Powerful hit to the [target]\'s neck leaves trails of vapor in its wake!', effects: [], wounds: [] },
    { rank: 5, damage: 0, message: 'Strong attack rips through the neck! To your horror, the [target]\'s substance flows around the wound without leaving a trace!', effects: [], wounds: [] },
    { rank: 6, damage: 0, message: 'The [target] wails eerily as your blow passes through its vocal cords.', effects: [], wounds: [] },
    { rank: 7, damage: 0, message: 'Vicious blow to neck might have been fatal a few centuries ago.', effects: [], wounds: [] },
    { rank: 8, damage: 0, message: 'Brutal blow to the neck sends head flying! The head floats up and settles back in place as easily as a hat. What is this, a haberdashery?', effects: [], wounds: [] },
    { rank: 9, damage: 0, message: 'Tremendous strike! Vapor rushes from the neck following the blow!', effects: [], wounds: [] }
  ],
  RIGHT_EYE: [
    { rank: 0, damage: 0, message: 'The [target] blinks as the strike grazes the right eye.', effects: [], wounds: [] },
    { rank: 1, damage: 0, message: 'Quick strike to the face! Just nicked an eyelid!', effects: [], wounds: [] },
    { rank: 2, damage: 0, message: 'Nasty strike to the right eye causes it to dim a moment.', effects: [], wounds: [] },
    { rank: 3, damage: 0, message: 'Decent shot to the right eye would have blinded a normal foe!', effects: [], wounds: [] },
    { rank: 4, damage: 0, message: 'Quick strike sinks deep into the right eye socket.', effects: [], wounds: [] },
    { rank: 5, damage: 0, message: 'Hard blow strikes deep into the right eye socket. Within moments the eyeball pops back out!', effects: [], wounds: [] },
    { rank: 6, damage: 0, message: 'Smash to the cheek deforms right eye socket. Vapor swirls as the ethereal bones reform.', effects: [], wounds: [] },
    { rank: 7, damage: 0, message: 'Blow to the right eye slides through head. The [target] twitches violently, then shudders slightly as the wound seals.', effects: [], wounds: [] },
    { rank: 8, damage: 0, message: 'Hard blast to the side of the right eye. Strike carries right on through the bridge of the nose, the other eye, and the rest of the head!', effects: [], wounds: [] },
    { rank: 9, damage: 0, message: 'Surgical strike to the right eye removes the top of the head! The [target] goes still for a moment while its head reshapes.', effects: [], wounds: [] }
  ],
  LEFT_EYE: [
    { rank: 0, damage: 0, message: 'The [target] blinks as the strike grazes the left eye.', effects: [], wounds: [] },
    { rank: 1, damage: 0, message: 'Quick strike to the face! Just nicked an eyelid!', effects: [], wounds: [] },
    { rank: 2, damage: 0, message: 'Nasty strike to the left eye causes it to dim a moment.', effects: [], wounds: [] },
    { rank: 3, damage: 0, message: 'Decent shot to the left eye would have blinded a normal foe!', effects: [], wounds: [] },
    { rank: 4, damage: 0, message: 'Quick strike sinks deep into the left eye socket.', effects: [], wounds: [] },
    { rank: 5, damage: 0, message: 'Hard blow strikes deep into the left eye socket. Within moments the eyeball pops back out!', effects: [], wounds: [] },
    { rank: 6, damage: 0, message: 'Smash to the cheek deforms left eye socket. Vapor swirls as the ethereal bones reform.', effects: [], wounds: [] },
    { rank: 7, damage: 0, message: 'Blow to the left eye slides through head. The [target] twitches violently, then shudders slightly as the wound seals.', effects: [], wounds: [] },
    { rank: 8, damage: 0, message: 'Hard blast to the side of the left eye. Strike carries right on through the bridge of the nose, the other eye, and the rest of the head!', effects: [], wounds: [] },
    { rank: 9, damage: 0, message: 'Surgical strike to the left eye removes the top of the head! The [target] goes still for a moment while its head reshapes.', effects: [], wounds: [] }
  ],
  CHEST: [
    { rank: 0, damage: 0, message: 'Did you even connect? Nope, that was just wind damage.', effects: [], wounds: [] },
    { rank: 1, damage: 0, message: 'Weak blow leaves a brief imprint on the [target]\'s chest!', effects: [], wounds: [] },
    { rank: 2, damage: 0, message: 'Direct assault cleaves straight through the breastbone. Alas, it mends before you can make a wish.', effects: [], wounds: [] },
    { rank: 3, damage: 0, message: 'The [target] fades for a second as the blow passes through the chest.', effects: [], wounds: [] },
    { rank: 4, damage: 0, message: 'Smash to the chest! Good thing there were no ribs there to shatter.', effects: [], wounds: [] },
    { rank: 5, damage: 0, message: 'Attack whistles right through the chest! It\'s like fighting fog!', effects: [], wounds: [] },
    { rank: 6, damage: 0, message: 'Strong hit to the chest! Tendrils of mist explode as the strike passes right through.', effects: [], wounds: [] },
    { rank: 7, damage: 0, message: 'Brutal assault cuts a swath through the torso! Fortunately for the [target], it doesn\'t need lungs.', effects: [], wounds: [] },
    { rank: 8, damage: 0, message: 'Mighty blow rips through the [target]\'s chest, causing it to pause as it reforms.', effects: [], wounds: [] },
    { rank: 9, damage: 0, message: 'Massive strike to the chest crashes through the [target]\'s back in a cloud of vapor.', effects: [], wounds: [] }
  ],
  ABDOMEN: [
    { rank: 0, damage: 0, message: 'Half-hearted strike to the midsection. The [target] seems unfazed.', effects: [], wounds: [] },
    { rank: 1, damage: 0, message: 'Quick blow to the belly causes the [target] to drift backwards slightly.', effects: [], wounds: [] },
    { rank: 2, damage: 0, message: 'Glancing blow to the stomach. Good thing it won\'t be eating soon.', effects: [], wounds: [] },
    { rank: 3, damage: 0, message: 'Hit passes right through the midsection. Nothing hurts like an empty stomach.', effects: [], wounds: [] },
    { rank: 4, damage: 0, message: 'Strike swipes cleanly through the abdomen, but seals up a moment later!', effects: [], wounds: [] },
    { rank: 5, damage: 0, message: 'Massive blow strikes the [target] and drives it back! Good thing those ribs aren\'t made of bone.', effects: [], wounds: [] },
    { rank: 6, damage: 0, message: 'Strong strike splits the belly open, revealing ghostly organs. Haggis anyone?', effects: [], wounds: [] },
    { rank: 7, damage: 0, message: 'Hard strike to the abdomen. Ethereal entrails seem to spill from the [target]\'s mangled substance, vanishing into misty tendrils as they strike the ground.', effects: [], wounds: [] },
    { rank: 8, damage: 0, message: 'Strike to the abdomen goes right through, leaving misty trails in its wake.', effects: [], wounds: [] },
    { rank: 9, damage: 0, message: 'Amazing strike enters one side and exits the other, neatly cutting the [target] in half!', effects: [], wounds: [] }
  ],
  BACK: [
    { rank: 0, damage: 0, message: 'Light tap to the [target]\'s lower back. Seems more of an annoyance than anything else.', effects: [], wounds: [] },
    { rank: 1, damage: 0, message: 'Misjudged timing. You barely catch the [target] in the back!', effects: [], wounds: [] },
    { rank: 2, damage: 0, message: 'Hard strike connects with the [target]\'s back! A thin arc of mist spews forth, evaporating quickly.', effects: [], wounds: [] },
    { rank: 3, damage: 0, message: 'Quick strike connects with the [target]\'s lower back! Luckily there was nothing vital there.', effects: [], wounds: [] },
    { rank: 4, damage: 0, message: 'Hard shot to the [target]\'s back sends it drifting forward!', effects: [], wounds: [] },
    { rank: 5, damage: 0, message: 'Deft blow to the spine cuts along the ethereal bones. Fillet of soul?', effects: [], wounds: [] },
    { rank: 6, damage: 0, message: 'Attack whistles right through the lower back encountering little resistance!', effects: [], wounds: [] },
    { rank: 7, damage: 0, message: 'Body swirls violently from a strong hit to the back. Neat effect!', effects: [], wounds: [] },
    { rank: 8, damage: 0, message: 'Incredible strike to the [target]\'s back smashes through the chest! Too bad it melts back together.', effects: [], wounds: [] },
    { rank: 9, damage: 0, message: 'Amazing shot cleaves the torso in half at the waist! You watch agape as the misty form knits itself back together!', effects: [], wounds: [] }
  ],
  RIGHT_ARM: [
    { rank: 0, damage: 0, message: 'Ineffectual strike knocks a wisp of ether from the [target]\'s right arm.', effects: [], wounds: [] },
    { rank: 1, damage: 0, message: 'Glancing blow to the right arm leaves a trail of vapor in its wake.', effects: [], wounds: [] },
    { rank: 2, damage: 0, message: 'Large gash to the right arm seals as strike passes through.', effects: [], wounds: [] },
    { rank: 3, damage: 0, message: 'Quick strike rips right arm open! To your dismay it quickly closes on its own.', effects: [], wounds: [] },
    { rank: 4, damage: 0, message: 'Strong hit rips arm from wrist to elbow. The wound vanishes as the ethereal flesh swirls around in chaotic patterns.', effects: [], wounds: [] },
    { rank: 5, damage: 0, message: 'Good hit! Right shoulder is ripped from its socket, then wriggles back into place.', effects: [], wounds: [] },
    { rank: 6, damage: 0, message: 'Hard strike shatters arm into vapor. The arm reforms before your eyes!', effects: [], wounds: [] },
    { rank: 7, damage: 0, message: 'Right arm ripped in half at elbow! The fallen arm evaporates as a new one materializes.', effects: [], wounds: [] },
    { rank: 8, damage: 0, message: 'A massive blow to the right shoulder hoists the [target] high into the air. It hangs there a moment, suspended, before falling forward.', effects: [], wounds: [] },
    { rank: 9, damage: 0, message: 'Huge hit explodes right arm into cold, viscous mist. When you look again, the arm has reformed.', effects: [], wounds: [] }
  ],
  LEFT_ARM: [
    { rank: 0, damage: 0, message: 'Ineffectual strike knocks a wisp of ether from the [target]\'s left arm.', effects: [], wounds: [] },
    { rank: 1, damage: 0, message: 'Glancing blow to the left arm leaves a trail of vapor in its wake.', effects: [], wounds: [] },
    { rank: 2, damage: 0, message: 'Large gash to the left arm seals as strike passes through.', effects: [], wounds: [] },
    { rank: 3, damage: 0, message: 'Quick strike rips left arm open! To your dismay it quickly closes on its own.', effects: [], wounds: [] },
    { rank: 4, damage: 0, message: 'Strong hit rips arm from wrist to elbow. The wound vanishes as the ethereal flesh swirls around in chaotic patterns.', effects: [], wounds: [] },
    { rank: 5, damage: 0, message: 'Good hit! Left shoulder is ripped from its socket, then wriggles back into place.', effects: [], wounds: [] },
    { rank: 6, damage: 0, message: 'Hard strike shatters arm into vapor. The arm reforms before your eyes!', effects: [], wounds: [] },
    { rank: 7, damage: 0, message: 'Left arm ripped in half at the elbow! The fallen arm evaporates as a new one materializes.', effects: [], wounds: [] },
    { rank: 8, damage: 0, message: 'A massive blow to the left shoulder hoists the [target] high into the air. It hangs there a moment, suspended, before falling forward.', effects: [], wounds: [] },
    { rank: 9, damage: 0, message: 'Huge hit explodes left arm into cold, viscous mist. When you look again, the arm has reformed.', effects: [], wounds: [] }
  ],
  RIGHT_HAND: [
    { rank: 0, damage: 0, message: 'Weak blow to the hand. Rapping its knuckles will only make it mad!', effects: [], wounds: [] },
    { rank: 1, damage: 0, message: 'A weak slap on the wrist. That\'s not going to reform a soul.', effects: [], wounds: [] },
    { rank: 2, damage: 0, message: 'Weak attack slips silently through the [target]\'s fingers, stirring the breeze.', effects: [], wounds: [] },
    { rank: 3, damage: 0, message: 'The [target] glares maliciously as the strike slides through its right hand.', effects: [], wounds: [] },
    { rank: 4, damage: 0, message: 'Hard blow to the right hand sends fingers flying. Alas, they reform soundlessly from thin air.', effects: [], wounds: [] },
    { rank: 5, damage: 0, message: 'A fine blow splits the back of the hand. Tendrils of vapor intertwine as the wound seals before your eyes.', effects: [], wounds: [] },
    { rank: 6, damage: 0, message: 'The [target]\'s hand explodes from the brutal strike! Trails of ether spurt high into the air in all directions.', effects: [], wounds: [] },
    { rank: 7, damage: 0, message: 'Strong smash to the right hand! The [target] quails and sinks momentarily as its right hand reforms before your eyes.', effects: [], wounds: [] },
    { rank: 8, damage: 0, message: 'A strong blow cleaves the right wrist! The hand dangles, spinning slowly, and then snaps back in place!', effects: [], wounds: [] },
    { rank: 9, damage: 0, message: 'A mighty attack shatters the right hand into a thousand fragments. To your horror, the fragments turn to vapor and reform the hand.', effects: [], wounds: [] }
  ],
  LEFT_HAND: [
    { rank: 0, damage: 0, message: 'Weak blow to the hand. Rapping its knuckles will only make it mad!', effects: [], wounds: [] },
    { rank: 1, damage: 0, message: 'A weak slap on the wrist. That\'s not going to reform a soul.', effects: [], wounds: [] },
    { rank: 2, damage: 0, message: 'Weak attack slips silently through the [target]\'s fingers, stirring the breeze.', effects: [], wounds: [] },
    { rank: 3, damage: 0, message: 'The [target] glares maliciously as the strike slides through its left hand.', effects: [], wounds: [] },
    { rank: 4, damage: 0, message: 'Hard blow to the left hand sends fingers flying. Alas, they reform soundlessly from thin air.', effects: [], wounds: [] },
    { rank: 5, damage: 0, message: 'A fine blow splits the back of the hand. Tendrils of vapor intertwine as the wound seals before your eyes.', effects: [], wounds: [] },
    { rank: 6, damage: 0, message: 'The [target]\'s hand explodes from the brutal strike! Trails of ether spurt high into the air in all directions.', effects: [], wounds: [] },
    { rank: 7, damage: 0, message: 'Strong smash to the left hand! The [target] quails and sinks momentarily as its left hand reforms before your eyes.', effects: [], wounds: [] },
    { rank: 8, damage: 0, message: 'A strong blow cleaves the left wrist! The hand dangles, spinning slowly, and then snaps back in place!', effects: [], wounds: [] },
    { rank: 9, damage: 0, message: 'A mighty attack shatters the left hand into a thousand fragments. To your horror, the fragments turn to vapor and reform the hand.', effects: [], wounds: [] }
  ],
  RIGHT_LEG: [
    { rank: 0, damage: 0, message: 'A weak tap grazes the right ankle. Feeling nervous yet?', effects: [], wounds: [] },
    { rank: 1, damage: 0, message: 'Right ankle stung! The [target] stamps in silent annoyance.', effects: [], wounds: [] },
    { rank: 2, damage: 0, message: 'Wild attack passes through the right leg, viciously assaulting the air!', effects: [], wounds: [] },
    { rank: 3, damage: 0, message: 'A strong blow bursts the right calf open in a spray of vapor. New muscle erupts from the middle of the wound, consuming the injured tissue.', effects: [], wounds: [] },
    { rank: 4, damage: 0, message: 'A fine strike pins the right leg for an instant. The [target] looks miffed.', effects: [], wounds: [] },
    { rank: 5, damage: 0, message: 'Quick strike to the right leg! The [target] makes no bones about it.', effects: [], wounds: [] },
    { rank: 6, damage: 0, message: 'Strong assault amputates the leg at the knee. It floats in the air a moment before drifting back into place!', effects: [], wounds: [] },
    { rank: 7, damage: 0, message: 'Painful attack flays the leg from thigh to calf. New skin lies, snakelike, beneath the old.', effects: [], wounds: [] },
    { rank: 8, damage: 0, message: 'Massive blow obliterates the right knee. The [target] falters as a sickly light flows freely down its leg.', effects: [], wounds: [] },
    { rank: 9, damage: 0, message: 'Huge strike vaporizes the right thigh. The [target] convulses, falling inward upon itself while the leg mends.', effects: [], wounds: [] }
  ],
  LEFT_LEG: [
    { rank: 0, damage: 0, message: 'A weak tap grazes the left ankle. Feeling nervous yet?', effects: [], wounds: [] },
    { rank: 1, damage: 0, message: 'Left ankle stung! The [target] stamps in silent annoyance.', effects: [], wounds: [] },
    { rank: 2, damage: 0, message: 'Wild attack passes through the left leg, viciously assaulting the air!', effects: [], wounds: [] },
    { rank: 3, damage: 0, message: 'A strong blow bursts the left calf open in a spray of vapor. New muscle erupts from the middle of the wound, consuming the injured tissue.', effects: [], wounds: [] },
    { rank: 4, damage: 0, message: 'A fine strike pins the left leg for an instant. The [target] looks miffed.', effects: [], wounds: [] },
    { rank: 5, damage: 0, message: 'Quick strike to the left leg! The [target] makes no bones about it.', effects: [], wounds: [] },
    { rank: 6, damage: 0, message: 'Strong assault amputates the leg at the knee. It floats in the air a moment before drifting back into place!', effects: [], wounds: [] },
    { rank: 7, damage: 0, message: 'Painful attack flays the leg from thigh to calf. New skin lies, snakelike, beneath the old.', effects: [], wounds: [] },
    { rank: 8, damage: 0, message: 'Massive blow obliterates the left knee. The [target] falters as a sickly light flows freely down its leg.', effects: [], wounds: [] },
    { rank: 9, damage: 0, message: 'Huge strike vaporizes the left thigh. The [target] convulses, falling inward upon itself while the leg mends.', effects: [], wounds: [] }
  ]
};

