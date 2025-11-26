'use strict';

const ArgParser = require('../core/ArgParser');
const { findItemWithOther } = require('../utils/keywordMatcher');

// Speech verbs list (from GemStone IV)
const SPEECH_VERBS = new Set([
  'accuse', 'acknowledge', 'acquiesce', 'add', 'admit', 'admonish', 'advance', 'advise', 'advocate',
  'affirm', 'agonize', 'agree', 'allege', 'allow', 'amend', 'announce', 'answer', 'apologize',
  'appease', 'approve', 'argue', 'articulate', 'ask', 'assert', 'assure', 'attempt', 'attest', 'aver',
  'babble', 'banter', 'bark', 'bawl', 'beg', 'begin', 'bellow', 'bemoan', 'beseech', 'bite out',
  'blather', 'bleat', 'blubber', 'blurt', 'bluster', 'boast', 'boom', 'brag', 'bray', 'breathe',
  'cackle', 'cajole', 'call', 'carp', 'caution', 'challenge', 'chant', 'chastise', 'chatter',
  'cheer', 'chide', 'chime in', 'chirp', 'choke out', 'cite', 'claim', 'clarify', 'cluck', 'coax',
  'command', 'commend', 'comment', 'commiserate', 'complain', 'compliment', 'concede', 'conclude',
  'concur', 'condescend', 'confess', 'confide', 'confirm', 'congratulate', 'consider', 'console',
  'conspire', 'contemplate', 'contend', 'contest', 'continue', 'coo', 'correct', 'cough', 'council',
  'counter', 'criticize', 'critique', 'croak', 'croon', 'crow', 'cry', 'curse',
  'deadpan', 'debate', 'declaim', 'declare', 'demand', 'demur', 'denounce', 'deny', 'deter', 'direct',
  'disagree', 'disclose', 'dismiss', 'dissuade', 'distract', 'divulge', 'drawl', 'droll', 'drone',
  'echo', 'effuse', 'elaborate', 'emphasize', 'encourage', 'enthuse', 'entreat', 'enunciate',
  'exclaim', 'exhort', 'expound', 'explain', 'express', 'exult',
  'falter', 'flatter', 'fret', 'fuss',
  'gasp', 'gloat', 'glower', 'goad', 'gossip', 'grant', 'grate', 'greet', 'gripe', 'groan',
  'grouse', 'grovel', 'growl', 'grumble', 'grunt', 'guess', 'gush',
  'hail', 'hazard', 'heckle', 'hedge', 'hint', 'hiss', 'holler', 'hoot', 'howl', 'hum', 'hush',
  'implore', 'imply', 'indicate', 'infer', 'inform', 'inquire', 'insinuate', 'insist', 'instruct',
  'interject', 'interrogate', 'interrupt', 'intimate', 'intone', 'introduce',
  'jest', 'joke',
  'keen',
  'lambaste', 'lament', 'laud', 'laugh', 'lecture', 'lisp',
  'maintain', 'marvel', 'maunder', 'mention', 'moan', 'mock', 'mouth', 'mumble', 'murmur', 'muse', 'mutter',
  'nag', 'narrate', 'needle', 'note',
  'object', 'oblige', 'observe', 'offer', 'opine', 'orate', 'order',
  'persuade', 'placate', 'plead', 'point out', 'ponder', 'pontificate', 'posit', 'postulate', 'pout',
  'praise', 'prattle', 'pray', 'preach', 'predicate', 'press', 'proclaim', 'prod', 'profess', 'promise',
  'prompt', 'pronounce', 'propose', 'propound', 'protest', 'purr',
  'quarrel', 'quaver', 'query', 'quibble', 'quip', 'quote',
  'ramble', 'rasp', 'rattle off', 'rave', 'razz', 'read', 'reaffirm', 'reason', 'reassure', 'rebuke',
  'rebut', 'recall', 'recite', 'reconsider', 'regale', 'rehearse', 'reinforce', 'reiterate', 'rejoice',
  'relay', 'relent', 'remark', 'remind', 'reminisce', 'repeat', 'reply', 'report', 'reprimand',
  'reproach', 'request', 'resolve', 'respond', 'retort', 'reveal', 'ridicule', 'roar',
  'say', 'scoff', 'scold', 'scream', 'screech', 'seethe', 'share', 'shout', 'shriek', 'sigh', 'simper',
  'singsong', 'slur', 'snap', 'snarl', 'sneer', 'snicker', 'sniff', 'snipe', 'snivel', 'sob', 'soothe',
  'sound out', 'specify', 'speculate', 'spit', 'sputter', 'squall', 'squawk', 'squeak', 'stammer',
  'state', 'stipulate', 'stress', 'stutter', 'submit', 'suggest', 'sulk', 'supply', 'swear',
  'taunt', 'tease', 'testify', 'threaten', 'toast', 'translate', 'trill',
  'upbraid', 'urge',
  'vent', 'venture', 'vow',
  'wail', 'warble', 'warn', 'wheedle', 'wheeze', 'whimper', 'whine', 'whisper aloud', 'wish', 'witter',
  'wonder', 'worry',
  'yammer', 'yell', 'yelp'
]);

// Valid tones (subset - can be expanded)
const VALID_TONES = new Set([
  'abashed', 'abrupt', 'absent', 'absentminded', 'accusing', 'acerbic', 'acid', 'acrid', 'adamant',
  'admiring', 'adoring', 'affable', 'affected', 'affectionate', 'affronted', 'aggravated', 'aggressive',
  'agitated', 'agonize', 'agreeable', 'airy', 'alert', 'aloof', 'ambivalent', 'amiable', 'amicable',
  'amorous', 'amused', 'angry', 'animated', 'annoyed', 'annoying', 'anxious', 'apathetic', 'apocryphal',
  'apologetic', 'apoplectic', 'appreciative', 'apprehensive', 'approving', 'arch', 'ardent', 'argumentative',
  'arrogant', 'ashamed', 'assertive', 'astounded', 'audacious', 'austere', 'authoritative', 'avaricious',
  'avid', 'awkward', 'baffled', 'baffling', 'bashful', 'bawdy', 'befuddled', 'begrudging', 'belated',
  'belligerent', 'bemused', 'bewildered', 'bewildering', 'biting', 'bitter', 'bland', 'bleak', 'bleary',
  'blithe', 'blunt', 'bold', 'bored', 'boring', 'bossy', 'brash', 'brazen', 'breathless', 'breezy',
  'brief', 'bright', 'brisk', 'broad', 'brusque', 'cagey', 'callous', 'calm', 'candid', 'cantankerous',
  'careful', 'careless', 'casual', 'caustic', 'cautious', 'charming', 'chaste', 'cheeky', 'cheerful',
  'churlish', 'clear', 'clinical', 'cloying', 'clueless', 'coarse', 'coaxing', 'cold', 'comforting',
  'comical', 'commanding', 'complacent', 'compliant', 'compulsive', 'concerned', 'condescending',
  'confident', 'confidential', 'confiding', 'conflicted', 'confused', 'consoling', 'contemptuous',
  'contented', 'contentious', 'contrite', 'cool', 'cordial', 'covetous', 'coy', 'crafty', 'cranky',
  'crass', 'crisp', 'cross', 'crude', 'cruel', 'cryptic', 'curious', 'curt', 'daft', 'dark', 'dazed',
  'decided', 'decisive', 'decorous', 'deep', 'defeated', 'defensive', 'defiant', 'dejected', 'deliberate',
  'delicate', 'delighted', 'delirious', 'demure', 'deprecating', 'depressing', 'derisive', 'despairing',
  'desperate', 'despondent', 'detached', 'determined', 'devilish', 'devoted', 'diabolical', 'didactic',
  'diffident', 'diligent', 'diplomatic', 'dire', 'disagreeable', 'disappointed', 'disapproving',
  'disbelieving', 'disconsolate', 'discreet', 'disdainful', 'disgruntled', 'disgusted', 'disheartened',
  'disinterested', 'dismissive', 'disoriented', 'disparaging', 'dispirited', 'disrespectful', 'distant',
  'distasteful', 'distracted', 'docile', 'doleful', 'doubtful', 'dramatic', 'dreadful', 'dreamy', 'droll',
  'drunken', 'dry', 'dubious', 'dull', 'dumbfounded', 'dutiful', 'eager', 'earnest', 'ecstatic',
  'embarrassed', 'emotional', 'emphatic', 'enchanted', 'encouraging', 'enticing', 'erudite', 'evasive',
  'even', 'exasperated', 'excited', 'expectant', 'explicit', 'express', 'exultant',
  'facetious', 'faint', 'fanciful', 'fascinated', 'fearful', 'feeble', 'feisty', 'fervent', 'fierce',
  'firm', 'flat', 'flippant', 'flirtatious', 'flustered', 'fond', 'forced', 'forceful', 'forlorn',
  'formal', 'frank', 'frantic', 'fretful', 'frightened', 'frosty', 'frustrated', 'furious', 'furtive',
  'fussy', 'gallant', 'generous', 'gentle', 'gleeful', 'glib', 'gloomy', 'glowing', 'glum', 'gracious',
  'grandiose', 'grateful', 'grating', 'grave', 'greedy', 'grim', 'grudging', 'gruff', 'grumpy',
  'guarded', 'guilty', 'half-hearted', 'halting', 'happy', 'harsh', 'hasty', 'hateful', 'haughty',
  'heartbroken', 'heartless', 'hearty', 'heated', 'heavy', 'heedless', 'helpful', 'helpless', 'hesitant',
  'hoarse', 'hollow', 'honest', 'hopeful', 'hopeless', 'horrified', 'hostile', 'humble', 'hungry',
  'hurried', 'hushed', 'husky', 'hysterical', 'icy', 'idle', 'impartial', 'impassive', 'impatient',
  'imperious', 'impertinent', 'impish', 'imploring', 'impudent', 'impulsive', 'inane', 'inconsolable',
  'incredulous', 'indecisive', 'indifferent', 'indignant', 'indistinct', 'indolent', 'indulgent',
  'informal', 'ingratiating', 'innocent', 'inquisitive', 'insincere', 'insipid', 'insistent', 'insolent',
  'insulting', 'interested', 'intimidating', 'intoxicated', 'introspective', 'inviting', 'ironic',
  'irreverent', 'irritated', 'jaded', 'jealous', 'joking', 'jovial', 'jubilant', 'kind', 'knowing',
  'laborious', 'laconic', 'lame', 'languid', 'lascivious', 'laughing', 'lazy', 'lewd', 'licentious',
  'lifeless', 'light', 'listless', 'lofty', 'longing', 'loud', 'lovelorn', 'loving', 'loyal', 'lusty',
  'magnanimous', 'malevolent', 'malicious', 'measured', 'meditative', 'meek', 'melodic', 'menacing',
  'mendacious', 'merciless', 'merry', 'mild', 'mischievous', 'miserable', 'mocking', 'modest', 'monotone',
  'morose', 'mournful', 'mushy', 'musing', 'mysterious', 'nagging', 'naive', 'nasal', 'nasty', 'nervous',
  'neutral', 'nonchalant', 'noncommittal', 'nonplussed', 'nonsensical', 'nostalgic', 'oblivious',
  'obnoxious', 'obsequious', 'obsessive', 'offended', 'offhanded', 'ominous', 'optimistic', 'outraged',
  'outrageous', 'painful', 'passionate', 'passive', 'patient', 'patronizing', 'pawky', 'pedantic',
  'peeved', 'peevish', 'pensive', 'perfunctory', 'perky', 'perplexed', 'perspicacious', 'persuasive',
  'petulant', 'philosophic', 'pious', 'piqued', 'pitiless', 'pitying', 'placating', 'placid', 'plain',
  'plaintive', 'playful', 'pleading', 'pleasant', 'pleased', 'plodding', 'pointed', 'polite', 'pompous',
  'pragmatic', 'praiseful', 'prayerful', 'pretentious', 'prim', 'prompt', 'proud', 'prudish', 'puzzled',
  'quavering', 'querulous', 'quick', 'quiet', 'rabid', 'rapt', 'rapturous', 'raspy', 'reasonable',
  'reasoned', 'reassuring', 'reflective', 'regretful', 'rejoicing', 'relieved', 'reluctant', 'remorseful',
  'reproachful', 'reproving', 'resentful', 'resigned', 'resolute', 'resolved', 'respectful', 'reticent',
  'reverent', 'rhetorical', 'riotous', 'roguish', 'rough', 'rousing', 'rude', 'rueful', 'sad', 'sadistic',
  'sagacious', 'sage', 'sarcastic', 'sardonic', 'sassy', 'satirical', 'savage', 'scandalous', 'scathing',
  'scornful', 'seductive', 'self-absorbed', 'self-assured', 'sensuous', 'serene', 'serious', 'severe',
  'shaky', 'shameless', 'sharp', 'sheepish', 'short', 'shrewd', 'shrill', 'shy', 'silky', 'simple',
  'sincere', 'skeptical', 'skittish', 'sleepy', 'slow', 'sly', 'smarmy', 'smooth', 'smug', 'snide',
  'snobbish', 'snotty', 'sober', 'soft', 'solemn', 'somber', 'soothing', 'sorrowful', 'sour', 'speculative',
  'speechless', 'spiteful', 'spurious', 'squeaky', 'squeamish', 'stalwart', 'staunch', 'steady', 'stern',
  'stiff', 'stilted', 'stoic', 'stout', 'strained', 'strict', 'strident', 'stubborn', 'stupid', 'suave',
  'sublime', 'submissive', 'subtle', 'sudden', 'suggestive', 'sulky', 'sullen', 'surprised', 'surreptitious',
  'suspicious', 'sweet', 'sycophantic', 'sympathetic', 'tame', 'tart', 'tearful', 'teasing', 'tenacious',
  'tender', 'tense', 'tentative', 'terrified', 'terse', 'testy', 'theatrical', 'thick', 'thoughtful',
  'thoughtless', 'threatening', 'throaty', 'thunderous', 'tight', 'timid', 'tired', 'toneless', 'tormented',
  'tremulous', 'trepidatious', 'trite', 'triumphant', 'truthful', 'unassuming', 'uncertain', 'uncomfortable',
  'unconvincing', 'uncouth', 'unctuous', 'understanding', 'uneasy', 'unexpected', 'unfeeling', 'ungracious',
  'unhappy', 'unhelpful', 'unkind', 'urbane', 'urgent', 'vacuous', 'vague', 'vapid', 'vehement', 'vengeful',
  'venomous', 'vexed', 'vicious', 'vigorous', 'vociferous', 'voracious', 'warm', 'warning', 'wary',
  'waspish', 'weak', 'weary', 'whimsical', 'whining', 'wicked', 'winning', 'wishful', 'wishy-washy',
  'wistful', 'withering', 'witty', 'woeful', 'wondering', 'wooden', 'worried', 'wounded', 'wrathful', 'wry'
]);

// Valid languages (can be expanded)
const VALID_LANGUAGES = new Set([
  'common', 'elven', 'dwarven', 'giantman', 'halfling', 'human', 'orcish', 'troll', 'dark', 'draconic',
  'faenor', 'gnomish', 'goblin', 'krolvin', 'sylvan', 'urgh', 'zombie'
]);

// Race to language mapping - players can only speak languages of their race
const RACE_LANGUAGES = {
  'human': ['common', 'human'],
  'elf': ['common', 'elven'],
  'dark_elf': ['common', 'dark'],
  'dwarf': ['common', 'dwarven'],
  'giantman': ['common', 'giantman'],
  'halfling': ['common', 'halfling'],
  'half_elf': ['common', 'elven'],
  'burghal_gnome': ['common', 'gnomish'],
  'forest_gnome': ['common', 'gnomish'],
  'sylvankind': ['common', 'sylvan'],
  'half_krolvin': ['common', 'krolvin'],
  'aelotoi': ['common', 'faenor'],
  'erithian': ['common']
};

/**
 * Check if a player can speak a given language based on their race
 */
function canSpeakLanguage(player, language) {
  if (!player || !player.race) {
    return false;
  }
  
  const raceKey = player.race.toLowerCase();
  const allowedLanguages = RACE_LANGUAGES[raceKey];
  
  if (!allowedLanguages) {
    // Unknown race - only allow common
    return language === 'common';
  }
  
  return allowedLanguages.includes(language.toLowerCase());
}

/**
 * Convert tone adjective to adverb form
 * Examples: wishful -> wishfully, venomous -> venomously, angry -> angrily
 */
function toneToAdverb(tone) {
  if (!tone) return '';
  
  const lower = tone.toLowerCase();
  
  // Already ends in -ly, return as-is
  if (lower.endsWith('ly')) {
    return tone;
  }
  
  // Special cases (irregular forms)
  const irregular = {
    'good': 'well',
    'fast': 'fast',
    'hard': 'hard',
    'late': 'late',
    'early': 'early',
    'straight': 'straight',
    'wrong': 'wrongly',
    'right': 'rightly',
    'public': 'publicly',
    'whole': 'wholly',
    'true': 'truly',
    'due': 'duly',
    'full': 'fully',
    'dull': 'dully',
    'shrill': 'shrilly'
  };
  
  if (irregular[lower]) {
    return irregular[lower];
  }
  
  // Adjectives ending in -ful -> -fully
  if (lower.endsWith('ful')) {
    return tone + 'ly';
  }
  
  // Adjectives ending in -ous -> -ously
  if (lower.endsWith('ous')) {
    return tone + 'ly';
  }
  
  // Adjectives ending in -y (but not -ly) -> -ily
  if (lower.endsWith('y') && !lower.endsWith('ly')) {
    // Check if preceded by a consonant
    const beforeY = lower.slice(0, -1);
    if (beforeY.length > 0) {
      const lastChar = beforeY[beforeY.length - 1];
      // If last char before y is a consonant, change y to i and add ly
      if (!['a', 'e', 'i', 'o', 'u'].includes(lastChar)) {
        return beforeY + 'ily';
      }
    }
    return tone + 'ly';
  }
  
  // Adjectives ending in -le (but not -lle) -> drop e and add -ly
  if (lower.endsWith('le') && !lower.endsWith('lle')) {
    return tone.slice(0, -1) + 'y';
  }
  
  // Adjectives ending in -ic -> -ically
  if (lower.endsWith('ic')) {
    return tone + 'ally';
  }
  
  // Adjectives ending in -ll -> -lly (just add -y)
  if (lower.endsWith('ll')) {
    return tone + 'y';
  }
  
  // Adjectives ending in -e (but not -le, -lle, -ce) -> just add -ly
  if (lower.endsWith('e') && !lower.endsWith('le') && !lower.endsWith('lle') && !lower.endsWith('ce')) {
    return tone + 'ly';
  }
  
  // Default: just add -ly
  return tone + 'ly';
}

/**
 * Parse SAY command modifiers
 * Returns: { tone, verb, language, directTarget, voiceTarget, message }
 */
function parseSayModifiers(input) {
  const result = {
    tone: null,
    verb: null,
    language: null,
    directTarget: null,
    voiceTarget: null,
    message: ''
  };

  // Initialize player state if needed
  if (!input.player.sayState) {
    input.player.sayState = {};
  }

  // Check for tone set by TONE command (applies to next message only)
  if (input.player.sayState.nextTone) {
    result.tone = input.player.sayState.nextTone;
    input.player.sayState.nextTone = null; // Clear after use
  }

  let remaining = input.args.join(' ');

  // Parse modifiers (order doesn't matter, but we'll process them)
  // Pattern: :{tone}, ::{target}/@{target}/{{target}}, ]{target}/[{target}], ~{language}, ={verb}
  // Modifiers can appear anywhere, but we'll extract them iteratively
  
  let changed = true;
  while (changed) {
    changed = false;
    const originalRemaining = remaining;

    // Extract tone: :{tone} (must be at start or after space)
    const toneMatch = remaining.match(/(?:^|\s):([a-z-]+)(?:\s|$)/i);
    if (toneMatch && !result.tone) {
      const tone = toneMatch[1].toLowerCase();
      if (VALID_TONES.has(tone)) {
        result.tone = tone;
        remaining = remaining.replace(toneMatch[0], ' ').trim();
        changed = true;
      }
    }

    // Extract verb: ={verb} (must be at start or after space)
    const verbMatch = remaining.match(/(?:^|\s)=([a-z\s]+?)(?:\s|$)/i);
    if (verbMatch && !result.verb) {
      const verb = verbMatch[1].toLowerCase().trim();
      if (SPEECH_VERBS.has(verb)) {
        result.verb = verb;
        remaining = remaining.replace(verbMatch[0], ' ').trim();
        changed = true;
      }
    }

    // Extract language: ~{language} (must be at start or after space)
    const langMatch = remaining.match(/(?:^|\s)~([a-z]+)(?:\s|$)/i);
    if (langMatch && !result.language) {
      const lang = langMatch[1].toLowerCase();
      if (VALID_LANGUAGES.has(lang)) {
        result.language = lang;
        remaining = remaining.replace(langMatch[0], ' ').trim();
        changed = true;
      }
    }

    // Extract direct target: ::{target} or @{target} (must be at start or after space)
    let directMatch = remaining.match(/(?:^|\s)(::|@)([^\s]+)(?:\s|$)/);
    if (!directMatch) {
      // Try {{target}} format
      directMatch = remaining.match(/(?:^|\s)\{([^}]+)\}(?:\s|$)/);
    }
    if (directMatch && !result.directTarget) {
      result.directTarget = directMatch[directMatch.length - 1];
      remaining = remaining.replace(directMatch[0], ' ').trim();
      changed = true;
    }

    // Extract voice target: ]{target} (must be at start or after space)
    let voiceMatch = remaining.match(/(?:^|\s)\]([^\s]+)(?:\s|$)/);
    if (!voiceMatch) {
      // Try [{target}] format
      voiceMatch = remaining.match(/(?:^|\s)\[([^\]]+)\](?:\s|$)/);
    }
    if (voiceMatch && !result.voiceTarget) {
      result.voiceTarget = voiceMatch[voiceMatch.length - 1];
      remaining = remaining.replace(voiceMatch[0], ' ').trim();
      changed = true;
    }

    // Prevent infinite loop
    if (remaining === originalRemaining) {
      break;
    }
  }

  // What's left is the message
  result.message = remaining.trim();

  return result;
}

/**
 * Find target (player, item, or NPC) in room
 */
async function findSayTarget(player, searchTerm) {
  if (!searchTerm) return null;

  const room = player.gameEngine.roomSystem.getRoom(player.room);
  if (!room) return null;

  const searchLower = searchTerm.toLowerCase();
  const db = player.gameEngine.roomSystem.db;

  // Search players
  const allPlayers = Array.from(player.gameEngine.players.values());
  const playersInRoom = allPlayers.filter(p => p.room === player.room && p.name !== player.name);
  const targetPlayer = ArgParser.findPartial(searchTerm, playersInRoom, (p) => p.name);
  if (targetPlayer) {
    return { type: 'player', entity: targetPlayer, name: targetPlayer.name };
  }

  // Search items in room
  if (room.items && Array.isArray(room.items) && db) {
    try {
      const itemIds = room.items.map(item => typeof item === 'string' ? item : (item.id || item.name || ''));
      const items = await db.collection('items')
        .find({ id: { $in: itemIds } })
        .toArray();
      
      const foundItem = findItemWithOther(searchLower, items);
      if (foundItem) {
        return { type: 'item', entity: foundItem, name: foundItem.name || foundItem.id };
      }
    } catch (error) {
      console.error('[SAY] Error fetching items:', error);
    }
  }

  // Search NPCs
  if (player.gameEngine && player.gameEngine.npcSystem) {
    const npcsInRoom = player.gameEngine.npcSystem.getNPCsInRoom(player.room);
    const npc = npcsInRoom.find(npc => {
      const name = (npc.name || npc.npcId || '').toLowerCase();
      if (name.includes(searchLower)) return true;
      if (npc.keywords && npc.keywords.some(kw => kw.toLowerCase().includes(searchLower))) return true;
      return false;
    });
    
    if (npc) {
      return { type: 'npc', entity: npc, name: npc.name || npc.npcId };
    }
  }

  return null;
}

/**
 * Format the say message output
 */
function formatSayMessage(player, parsed, directTargetInfo, voiceTargetInfo) {
  const modifiers = [];
  
  // Voice throwing prefix (only if voiceTarget is set)
  if (parsed.voiceTarget && voiceTargetInfo) {
    modifiers.push(`Throwing your voice behind ${voiceTargetInfo.name},`);
  }
  
  // Direct target prefix (for speaking TO something)
  if (parsed.directTarget && directTargetInfo) {
    if (directTargetInfo.type === 'player') {
      // When speaking to a player, format differently
      modifiers.push(`to ${directTargetInfo.name}`);
    } else {
      // When speaking to an object, use "Speaking to X,"
      modifiers.push(`to ${directTargetInfo.name}`);
    }
  }
  
  // Tone prefix (convert to adverb)
  if (parsed.tone) {
    modifiers.push(toneToAdverb(parsed.tone));
  }
  
  // Language prefix
  if (parsed.language) {
    modifiers.push(`in ${parsed.language.charAt(0).toUpperCase() + parsed.language.slice(1)}`);
  }
  
  // Verb (default: "say")
  const verb = parsed.verb || 'say';
  
  // Build the message
  let message = '';
  if (modifiers.length > 0) {
    // If speaking to an object (not a player), use "Speaking to X, [modifiers] you verb, "message""
    if (parsed.directTarget && directTargetInfo && directTargetInfo.type !== 'player') {
      const toneLang = [];
      if (parsed.tone) toneLang.push(toneToAdverb(parsed.tone));
      if (parsed.language) toneLang.push(`in ${parsed.language.charAt(0).toUpperCase() + parsed.language.slice(1)}`);
      
      if (toneLang.length > 0) {
        message = `Speaking ${toneLang.join(' ')} to ${directTargetInfo.name}, you ${verb}, "${parsed.message}"`;
      } else {
        message = `Speaking to ${directTargetInfo.name}, you ${verb}, "${parsed.message}"`;
      }
    } else if (parsed.voiceTarget && voiceTargetInfo) {
      // Voice throwing format
      const toneLang = [];
      if (parsed.tone) toneLang.push(toneToAdverb(parsed.tone));
      if (parsed.language) toneLang.push(`in ${parsed.language.charAt(0).toUpperCase() + parsed.language.slice(1)}`);
      
      if (toneLang.length > 0) {
        message = `Throwing your voice behind ${voiceTargetInfo.name}, ${toneLang.join(' ')}, you ${verb}, "${parsed.message}"`;
      } else {
        message = `Throwing your voice behind ${voiceTargetInfo.name}, you ${verb}, "${parsed.message}"`;
      }
    } else {
      // Standard format with modifiers
      message = `${modifiers.join(' ')} you ${verb}, "${parsed.message}"`;
    }
  } else {
    message = `You ${verb}, "${parsed.message}"`;
  }
  
  return message;
}

/**
 * Format message for other players
 */
function formatSayMessageOthers(player, parsed, directTargetInfo, voiceTargetInfo) {
  const modifiers = [];
  
  // Voice throwing prefix (only if voiceTarget is set)
  if (parsed.voiceTarget && voiceTargetInfo) {
    modifiers.push(`throwing their voice behind ${voiceTargetInfo.name},`);
  }
  
  // Direct target prefix (for speaking TO something)
  if (parsed.directTarget && directTargetInfo && directTargetInfo.type !== 'player') {
    modifiers.push(`to ${directTargetInfo.name}`);
  }
  
  // Tone prefix (convert to adverb)
  if (parsed.tone) {
    modifiers.push(toneToAdverb(parsed.tone));
  }
  
  // Language prefix
  if (parsed.language) {
    modifiers.push(`in ${parsed.language.charAt(0).toUpperCase() + parsed.language.slice(1)}`);
  }
  
  // Verb (default: "says")
  const verb = parsed.verb || 'says';
  const verbForm = verb === 'say' ? 'says' : (verb.endsWith('s') ? verb : verb + 's');
  
  // Build the message
  let message = '';
  if (modifiers.length > 0) {
    // If speaking to an object (not a player), use "PlayerName, speaking to X, [modifiers] verb, "message""
    if (parsed.directTarget && directTargetInfo && directTargetInfo.type !== 'player') {
      const toneLang = [];
      if (parsed.tone) toneLang.push(toneToAdverb(parsed.tone));
      if (parsed.language) toneLang.push(`in ${parsed.language.charAt(0).toUpperCase() + parsed.language.slice(1)}`);
      
      if (toneLang.length > 0) {
        message = `${player.name}, speaking ${toneLang.join(' ')} to ${directTargetInfo.name}, ${verbForm}, "${parsed.message}"`;
      } else {
        message = `${player.name}, speaking to ${directTargetInfo.name}, ${verbForm}, "${parsed.message}"`;
      }
    } else if (parsed.voiceTarget && voiceTargetInfo) {
      // Voice throwing format
      const toneLang = [];
      if (parsed.tone) toneLang.push(toneToAdverb(parsed.tone));
      if (parsed.language) toneLang.push(`in ${parsed.language.charAt(0).toUpperCase() + parsed.language.slice(1)}`);
      
      if (toneLang.length > 0) {
        message = `${player.name}, throwing their voice behind ${voiceTargetInfo.name}, ${toneLang.join(' ')}, ${verbForm}, "${parsed.message}"`;
      } else {
        message = `${player.name}, throwing their voice behind ${voiceTargetInfo.name}, ${verbForm}, "${parsed.message}"`;
      }
    } else {
      // Standard format with modifiers
      message = `${player.name} ${modifiers.join(' ')} ${verbForm}, "${parsed.message}"`;
    }
  } else {
    message = `${player.name} ${verbForm}, "${parsed.message}"`;
  }
  
  return message;
}

/**
 * Format message for direct target (if speaking to a player)
 */
function formatSayMessageTarget(player, parsed) {
  const parts = [];
  
  // Tone prefix (convert to adverb)
  if (parsed.tone) {
    parts.push(toneToAdverb(parsed.tone));
  }
  
  // Language prefix
  if (parsed.language) {
    parts.push(`in ${parsed.language.charAt(0).toUpperCase() + parsed.language.slice(1)}`);
  }
  
  // Verb (default: "says")
  const verb = parsed.verb || 'says';
  const verbForm = verb === 'say' ? 'says' : (verb.endsWith('s') ? verb : verb + 's');
  
  // Build the message
  let message = '';
  if (parts.length > 0) {
    message = `${player.name} ${parts.join(' ')} ${verbForm} to you, "${parsed.message}"`;
  } else {
    message = `${player.name} ${verbForm} to you, "${parsed.message}"`;
  }
  
  return message;
}

/**
 * Say Command
 * Allows players to speak with modifiers (tone, verb, language, targeting, voice throwing)
 */
module.exports = {
  name: 'say',
  aliases: ['"', "'"],
  description: 'Say something to everyone in the room (with optional modifiers)',
  usage: 'say [modifiers] <message>',
  
  async execute(player, args) {
    if (args.length === 0) {
      return { success: false, message: 'Say what?\r\n' };
    }

    const room = player.gameEngine.roomSystem.getRoom(player.room);
    if (!room) {
      return { success: false, message: 'You are nowhere.\r\n' };
    }

    // Parse modifiers
    const parsed = parseSayModifiers({ player, args });
    
    if (!parsed.message || parsed.message.length === 0) {
      return { success: false, message: 'Say what?\r\n' };
    }

    // Check if player can speak the requested language
    if (parsed.language) {
      if (!canSpeakLanguage(player, parsed.language)) {
        // Format race name nicely (e.g., "dark_elf" -> "Dark Elf")
        let raceName = 'Unknown';
        if (player.race) {
          raceName = player.race
            .split('_')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
        }
        const langName = parsed.language.charAt(0).toUpperCase() + parsed.language.slice(1);
        return { 
          success: false, 
          message: `You don't know how to speak ${langName}. As a ${raceName}, you can only speak languages native to your race.\r\n` 
        };
      }
    }

    // Find targets if specified
    let directTargetInfo = null;
    if (parsed.directTarget) {
      directTargetInfo = await findSayTarget(player, parsed.directTarget);
      if (!directTargetInfo) {
        return { success: false, message: `You don't see that here.\r\n` };
      }
    }

    let voiceTargetInfo = null;
    if (parsed.voiceTarget) {
      voiceTargetInfo = await findSayTarget(player, parsed.voiceTarget);
      if (!voiceTargetInfo) {
        return { success: false, message: `You don't see that here.\r\n` };
      }
    }

    // Get all players in the room
    const allPlayers = Array.from(player.gameEngine.players.values());
    const playersInRoom = allPlayers.filter(p => p.room === player.room);
    const otherPlayers = playersInRoom.filter(p => p.name !== player.name);

    // Helper function to send message to a player's connection
    const sendToPlayer = (targetPlayer, message) => {
      if (!targetPlayer.connection) {
        return;
      }
      
      if (typeof targetPlayer.connection.send === 'function') {
        // WebSocket
        targetPlayer.connection.send(message + '\r\n');
      } else if (typeof targetPlayer.connection.write === 'function') {
        // Telnet
        targetPlayer.connection.write(message + '\r\n');
      }
    };

    // Format and send messages
    const playerMessage = formatSayMessage(player, parsed, directTargetInfo, voiceTargetInfo);
    const othersMessage = formatSayMessageOthers(player, parsed, directTargetInfo, voiceTargetInfo);
    const targetMessage = directTargetInfo && directTargetInfo.type === 'player' 
      ? formatSayMessageTarget(player, parsed)
      : null;

    // Send to player
    sendToPlayer(player, playerMessage);

    // Send to other players
    otherPlayers.forEach(targetPlayer => {
      if (targetMessage && directTargetInfo && directTargetInfo.type === 'player' && 
          targetPlayer.name === directTargetInfo.name) {
        // Special message for direct target
        sendToPlayer(targetPlayer, targetMessage);
      } else {
        // Standard message for others
        sendToPlayer(targetPlayer, othersMessage);
      }
    });

    return { success: true };
  }
};
