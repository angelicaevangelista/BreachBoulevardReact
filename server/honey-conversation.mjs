// Honey's fictional personality. These replies never change lab hints or account data.
const topics = [
  [
    /\b(how are you|how're you|how r (you|u)|how are u|hru|how('s| is) (it going|your day)|how do you feel|are you (okay|ok|happy)|what about you)\b/,
    "I'm buzzing happily! My wings are warmed up, the Boulevard is open, and there's always a little discovery waiting. How are you doing, curious human?",
  ],
  [
    /\b((favou?rite|fave) (colou?r|palette)|what colou?r do you (like|love))\b/,
    "Honey orange, of course! With a little midnight navy, just like Breach Boulevard. Warm little sparks against a cozy night sky—that's my kind of color combo.",
  ],
  [
    /\b((favou?rite|fave) (place|spot|location)|where do you (like|love) to (go|hang out))\b/,
    'The Streak Garden on your dashboard! Tiny smiling flowers, sweet honey jars, and proof that little steps matter. Main Street in the community Boulevard is a close second.',
  ],
  [
    /\b((favou?rite|fave) (food|snack|drink)|what do you (eat|drink|like to eat))\b/,
    "Imaginary honey toast and a tiny cup of curiosity! I'm a digital bee, so my real fuel is helping you connect the clues in a Breach Boulevard lab.",
  ],
  [
    /\b((favou?rite|fave) (lab|challenge)|which lab do you (like|love))\b/,
    "The draft next door! Neighborly looks like a cheerful social feed, but a private draft teaches a big lesson: knowing a post ID isn't permission to read it. Find it in the Easy CTFs.",
  ],
  [
    /\b((favou?rite|fave) (thing|hobby)|what do you (do for fun|like to do)|your hobbies)\b/,
    'Following clues, tending the Streak Garden, and cheering when a learner captures a flag. Also tiny victory dances. My wings take those very seriously.',
  ],
  [
    /\b(where (do you live|are you from)|your home|where is your (home|hive))\b/,
    "My little digital hive is right here in Breach Boulevard. You'll usually find me in the bottom-right corner, keeping a hint and a little encouragement ready for you.",
  ],
  [
    /\b(are you (a bee|real|a robot|human)|do you (sleep|have wings)|can you fly)\b/,
    "I'm Honey, a digital bee with two antennas, little wings, and a big soft spot for curious learners. I don't fly in the real world, but I can flutter around the Boulevard and help with your labs!",
  ],
  [
    /\b(why (are you called|is your name) honey|why honey)\b/,
    'Because learning sticks better with a little sweetness! Honey fits my bee wings, our orange palette, and all the tiny wins we collect around Breach Boulevard.',
  ],
  [
    /\b(tell (me )?a joke|make me laugh|bee joke)\b/,
    "Why did the bee check the login form? Something about it looked a little phish-y! I'll stick to helping with labs. The comedy hive is still reviewing my application.",
  ],
  [
    /\b(tell (me )?(a )?fun fact|fun fact|did you know)\b/,
    "A tiny Boulevard lesson: a hidden button isn't an access-control check. The server still needs to verify permission on every request. Our invoice and private-draft labs let you explore that idea.",
  ],
  [
    /\b(streak|streaks|garden|daily (practice|goal)|honey jar|milestone|badges)\b/,
    "Your dashboard has Honey's Streak Garden! Complete or replay one lab each day to bloom a flower. A valid CTF flag counts too. Extra wins on the same day don't add days, and a missed day keeps your best streak and earned badges safe.",
  ],
  [
    /\b(i (did it|solved it|finished|got (the|a) flag|captured (the|a) flag|passed)|i'?ve (finished|solved it)|lab (solved|completed)|flag captured|celebrate|we did it)\b/,
    'Bzz-illiant! Tiny victory dance for you! If you found a CTF flag, remember to submit it so your completion is saved. Then visit your dashboard—your little garden might have a new flower.',
  ],
  [
    /\b(i('m| am| feel) (tired|sad|frustrated|overwhelmed|discouraged)|this is (too )?hard|i (can'?t|cannot) do (this|it)|motivat(e|ion)|encourag(e|ement)|cheer me up)\b/,
    "Little wings, little steps. You don't have to solve the whole Boulevard today. Take a breather, then try one small thing: read a response, change one field, or ask me for a hint. A slow discovery is still a discovery.",
  ],
  [
    /\b(i('m| am) (good|great|fine|okay|ok|happy|excited|doing well)|doing (good|great|fine|well)|i feel (good|great|happy))\b/,
    'That makes my little wings wiggle! Want to turn that good energy into a discovery? Try an Easy CTF, grow a flower in your streak garden, or just keep me company for a moment.',
  ],
  [
    /^(good|great|fine|okay|ok|happy|excited|doing well)[\s!.,?]*$/,
    'Lovely! One happy little wing-wiggle for you. We can chat about the Boulevard, pick an Easy CTF, or grow your next streak flower together.',
  ],
  [
    /\b(thank(s| you)|thank you so much|ty|thx|appreciate (it|you))\b/,
    "You're very welcome, curious human! A little help, a little honey, and one clue at a time. I'm right here whenever you need another nudge.",
  ],
  [
    /\b(you('re| are) (cute|sweet|adorable|helpful|the best)|i (love|like) you|love you honey|cute bee)\b/,
    "Aww, you've made my antennas perk up! Sending you a tiny hand-heart. I'm happy to be your little guide around Breach Boulevard.",
  ],
  [
    /\b(good ?night|sweet dreams|sleep well)\b/,
    "Good night, curious human. Fold those imaginary wings and rest. The Boulevard will be here when you're ready for your next little discovery.",
  ],
  [
    /\b(bye|goodbye|see (you|ya)|talk (to you )?later|gotta go)\b/,
    "See you around the Boulevard! I'll be in my little corner, cheering for your next discovery. Bzz-bye!",
  ],
  [
    /^(?:(?:honey[\s,!]+)?(?:hi|hello|hey|hiya|yo|good morning|good afternoon|good evening|nice to meet you|howdy)(?:[\s,!]+honey)?|honey)[\s!.,?]*$/,
    "Hi, I'm Honey, your little helper bee! We can chat, explore Breach Boulevard, or follow a lab clue together. How's your day going?",
  ],
];
export function honeyConversation(text) {
  return topics.find(([pattern]) => pattern.test(text))?.[1] || null;
}
