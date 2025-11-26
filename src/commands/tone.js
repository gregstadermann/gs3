'use strict';

// Valid tones (same as in say.js)
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

/**
 * Tone Command
 * Sets the tone for the next SAY message
 * 
 * Usage:
 *   tone <tone>  - Set tone for next message
 *   tone        - Clear tone
 */
module.exports = {
  name: 'tone',
  aliases: [],
  description: 'Set the tone for your next message',
  usage: 'tone [tone]',
  
  execute(player, args) {
    // Initialize sayState if needed
    if (!player.sayState) {
      player.sayState = {};
    }

    // If no args, clear tone
    if (args.length === 0) {
      player.sayState.nextTone = null;
      return { success: true, message: 'Tone cleared. You will speak normally on your next message.\r\n' };
    }

    const input = args.join(' ').toLowerCase().trim();

    // Special case: "tone list" to show all available tones
    if (input === 'list') {
      const tones = Array.from(VALID_TONES).sort();
      let message = 'Available Tones:\r\n\r\n';
      
      // Display tones in columns (3 columns for readability)
      const columns = 3;
      for (let i = 0; i < tones.length; i += columns) {
        const row = tones.slice(i, i + columns);
        const paddedRow = row.map(tone => tone.padEnd(20));
        message += paddedRow.join('  ') + '\r\n';
      }
      
      message += `\r\nTotal: ${tones.length} tones available.\r\n`;
      message += 'Usage: TONE <tone> to set a tone for your next message.\r\n';
      
      return { success: true, message: message };
    }

    const tone = input;

    // Validate tone
    if (!VALID_TONES.has(tone)) {
      return { 
        success: false, 
        message: `"${tone}" is not a valid tone. Use TONE LIST to see available tones.\r\n` 
      };
    }

    // Set tone for next message
    player.sayState.nextTone = tone;

    return { 
      success: true, 
      message: `You will speak ${tone}ly on your next message.\r\n` 
    };
  }
};

