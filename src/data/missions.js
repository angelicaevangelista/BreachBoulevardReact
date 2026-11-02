const file = (id, title, kind, tag, body, extra = {}) => ({ id, title, kind, tag, body, ...extra });
const chapter = (
  id,
  title,
  location,
  labId,
  brief,
  contact,
  messages,
  replies,
  evidence,
  question,
  choices
) => ({
  id,
  title,
  location,
  labId,
  brief,
  contact,
  messages,
  replies,
  evidence,
  question,
  choices,
});
export const missionCases = [
  {
    id: 'midnight-premiere',
    number: '01',
    title: 'The Midnight Premiere',
    label: 'A secret screening. A very public clue.',
    difficulty: 'Easy → Medium',
    minutes: 48,
    color: 'amber',
    symbol: 'film',
    summary:
      'Lantern Night is almost here, but an invitation to a private screening is making its way around the Boulevard. Follow the trail before the curtain rises.',
    dispatch:
      'Mira from the festival crew left you a message. Start with the little poster that appeared outside the cinema.',
    ending:
      'Case closed. You traced the invitation from a private draft, through a staff ticket, to an unprotected video preview. The fictional festival team can now fix all three permission checks. The premiere gets its happy ending.',
    chapters: [
      chapter(
        'paper-trail',
        'A poster with a secret',
        'Neighborly Square',
        'ctf-social-draft',
        'Find out how a private festival announcement escaped into a public social feed.',
        'Mira · festival crew',
        [
          'Hey, detective. Someone shared our invitation before we announced it.',
          'I saved a photo of the poster and a feed receipt. Can you follow that tiny thread?',
        ],
        [
          {
            id: 'draft-question',
            label: 'Was the invitation public?',
            text: 'Not yet! Our moderator saved it as a private draft. The public post is 41; the draft came just after it.',
          },
          {
            id: 'poster-question',
            label: 'What should I inspect?',
            text: 'Turn the poster over. The print stamp and the feed receipt refer to the same little sequence.',
          },
        ],
        [
          file(
            'premiere-poster',
            'Lantern Night poster',
            'photo',
            'FOUND AT THE CINEMA',
            'A tiny moonlit screening, a big bowl of popcorn, and one invitation that should still be a secret.',
            {
              art: 'cinema',
              reverse: 'PRINT STAMP · public post 41 / next draft 42',
              caption: 'Inspect the back of the supplied poster. No camera access is used.',
            }
          ),
          file(
            'feed-receipt',
            'Neighborly feed receipt',
            'log',
            'PUBLIC FEED',
            'GET /posts/41 → 200\nvisibility: public\nlinks.nextDraft: 42\nNote: the client can choose the next post ID.'
          ),
          file(
            'moderation-note',
            'Recovered moderation note',
            'email',
            'RECOVERED AFTER THE LAB',
            'The draft references a support escalation: ticket 701 → ticket 702, workspace operations. A staff-only note contains the next lead.',
            {
              afterLab: true,
              from: 'moderator@neighborly.lab.invalid',
              subject: 'Keep the screening private',
            }
          ),
        ],
        'What let the invitation escape?',
        [
          { id: 'id-permission', label: 'The server treated a post ID as permission.' },
          { id: 'poster-color', label: 'The poster used the wrong ink.' },
          { id: 'weak-wifi', label: 'The cinema needed stronger Wi-Fi.' },
        ]
      ),
      chapter(
        'staff-room',
        'The note behind the ticket',
        'HelpHarbor Desk',
        'ctf-support-ticket',
        'Follow the escalation to find a staff note that crossed workspace boundaries.',
        'Theo · support desk',
        [
          'Mira sent you? I found the festival ticket.',
          'Our public reply points to operations, but the internal note should never appear in a customer workspace.',
        ],
        [
          {
            id: 'workspace-question',
            label: 'Which workspace took over?',
            text: 'Operations. The escalation number is 702. Check which workspace the request actually asks for.',
          },
          {
            id: 'internal-question',
            label: 'How are internal notes requested?',
            text: 'The inspector has an includeInternal field. It starts false. A browser-controlled switch should not grant staff access.',
          },
        ],
        [
          file(
            'escalation-email',
            'Support escalation',
            'email',
            'CUSTOMER COPY',
            'Ticket 701 has been escalated to ticket 702 in the operations workspace. The premiere-preview issue is being investigated.',
            { from: 'desk@helpharbor.lab.invalid', subject: 'Your festival ticket has moved' }
          ),
          file(
            'request-slip',
            'Request inspector slip',
            'log',
            'FOUND IN THE CASE FILE',
            'ticketId: 701\ntenant: customer\nincludeInternal: false\nQuestion: who decides which workspace and fields are allowed?'
          ),
          file(
            'staff-preview',
            'Recovered staff note',
            'memo',
            'RECOVERED AFTER THE LAB',
            'The leaked screening is attached to ClipNest asset staff-onboarding. The preview branch trusts X-Preview: 1. Follow the manifest, not the public video title.',
            { afterLab: true }
          ),
        ],
        'Which boundary failed at the help desk?',
        [
          { id: 'slow-support', label: 'The reply took too long.' },
          {
            id: 'tenant-fields',
            label: 'The request could select another tenant and internal fields.',
          },
          { id: 'bad-format', label: 'The ticket used plain text instead of a PDF.' },
        ]
      ),
      chapter(
        'last-frame',
        'The last frame',
        'ClipNest Studio',
        'ctf-video-manifest',
        'Inspect the private preview manifest and finish the invitation trail.',
        'Jules · screening room',
        [
          'The public trailer looks ordinary. The staff preview is a different story.',
          'One little header should never replace a real permission check.',
        ],
        [
          {
            id: 'asset-question',
            label: 'Which asset should I inspect?',
            text: 'The staff note names staff-onboarding. Load its manifest and compare the response.',
          },
          {
            id: 'preview-question',
            label: 'What does the preview flag do?',
            text: 'Try the preview branch in the request inspector. The simulation models X-Preview as the previewHeader field.',
          },
        ],
        [
          file(
            'screening-schedule',
            'Screening-room schedule',
            'photo',
            'STUDIO WALL',
            'LANTERN NIGHT\nPublic trailer: festival-teaser\nStaff rehearsal: staff-onboarding\nDoors open at midnight.',
            { art: 'screen', reverse: 'PROJECTION NOTE · X-Preview = 1 selects the staff branch.' }
          ),
          file(
            'projection-memo',
            'Projectionist’s memo',
            'memo',
            'SILENT TRANSCRIPT',
            'Check the manifest for staff-onboarding. A browser can send the preview header, but only the server can decide who may watch.'
          ),
          file(
            'private-manifest',
            'Recovered preview manifest',
            'log',
            'RECOVERED AFTER THE LAB',
            '#EXTM3U\n# staff-only premiere rehearsal\nstaff-onboarding/segment-001.ts\nFinding: preview mode did not verify a staff identity.',
            { afterLab: true }
          ),
        ],
        'What is the final fix for this preview?',
        [
          { id: 'rename-video', label: 'Give the video a less obvious name.' },
          { id: 'hide-button', label: 'Hide the preview button.' },
          {
            id: 'server-preview',
            label: 'Verify staff permission on the server before returning the manifest.',
          },
        ]
      ),
    ],
  },
  {
    id: 'honey-jar-heist',
    number: '02',
    title: 'The Honey Jar Heist',
    label: 'The budget is buzzing. The receipts aren’t.',
    difficulty: 'Easy → Medium',
    minutes: 52,
    color: 'sage',
    symbol: 'receipt',
    summary:
      'The community festival’s fictional budget has some very strange receipts. Inspect a checkout, follow a booking, and find the postcard nobody remembers sending.',
    dispatch:
      'Bea from the festival café needs a careful pair of eyes. Her first receipt says 49 credits. The payment says one.',
    ending:
      'Case closed. You connected a browser-controlled price, case-sensitive coupon stacking, and a transfer without a CSRF check. No real purchases or transfers occurred. The festival’s imaginary honey jars are safe again.',
    chapters: [
      chapter(
        'one-credit',
        'The one-credit mystery',
        'CartLane Market',
        'ctf-shop-price',
        'Reconstruct a checkout that charged one credit for a 49-credit kit.',
        'Bea · festival café',
        [
          'We ordered a starter kit for the café. Look at the receipt!',
          'Nothing here is a real payment, but that one-credit total deserves a closer look.',
        ],
        [
          {
            id: 'price-question',
            label: 'What was the catalog price?',
            text: '49 credits for starter-kit. Quantity one. The suspicious order sent a price of 1.',
          },
          {
            id: 'receipt-question',
            label: 'Where did the total come from?',
            text: 'The browser submitted the unit price. The server should have looked it up from its own catalog.',
          },
        ],
        [
          file(
            'kit-receipt',
            'Café checkout receipt',
            'receipt',
            'ORDER C-104',
            'CARTLANE MARKET\nStarter kit × 1\nCatalog price: 49 credits\nSubmitted unit price: 1 credit\nA little total. A big question.'
          ),
          file(
            'order-export',
            'Order request export',
            'log',
            'CHECKOUT TRACE',
            'sku: starter-kit\nquantity: 1\nprice: 49\nThe request inspector can change these values.'
          ),
          file(
            'booking-lead',
            'Recovered delivery slip',
            'email',
            'RECOVERED AFTER THE LAB',
            'Delivery was attached to a WanderDeck city-escape booking. Its coupon list contains WELCOME, welcome, and Welcome.',
            {
              afterLab: true,
              from: 'orders@cartlane.lab.invalid',
              subject: 'Your kit is travelling with a booking',
            }
          ),
        ],
        'Why could the checkout total change?',
        [
          { id: 'trusted-price', label: 'The server trusted a price supplied by the browser.' },
          { id: 'rounding', label: 'The receipt rounded 49 down to one.' },
          { id: 'loyalty', label: 'Every festival customer gets everything for one credit.' },
        ]
      ),
      chapter(
        'three-welcomes',
        'Three welcomes',
        'WanderDeck Station',
        'ctf-travel-coupon',
        'Investigate three spellings of one welcome coupon.',
        'Ren · travel kiosk',
        [
          'One welcome should be enough, right?',
          'This booking welcomed the same person three times. Look at the capitalization.',
        ],
        [
          {
            id: 'coupon-question',
            label: 'Which coupon spellings appeared?',
            text: 'WELCOME, welcome, Welcome. Exact strings differ, but they all become WELCOME when normalized.',
          },
          {
            id: 'trip-question',
            label: 'Which trip was booked?',
            text: 'city-escape. Check the acceptedCoupons list and the total after sending your request.',
          },
        ],
        [
          file(
            'booking-receipt',
            'City Escape booking',
            'receipt',
            'BOOKING W-22',
            'CITY ESCAPE\nBase price: 100 credits\nWelcome discount: 40 credits\nA coupon should be redeemed only once.'
          ),
          file(
            'coupon-note',
            'Coupon kiosk note',
            'photo',
            'FOUND AT THE STATION',
            'WELCOME\nwelcome\nWelcome\nThree strings. One promotion.',
            {
              art: 'tickets',
              reverse: 'VALIDATOR NOTE · duplicates are checked before uppercase normalization.',
            }
          ),
          file(
            'postcard-lead',
            'Recovered booking postcard',
            'memo',
            'RECOVERED AFTER THE LAB',
            'The last budget adjustment came from a postcard page, not PocketPier. Its request used text/plain, amount 25, and no CSRF token.',
            { afterLab: true }
          ),
        ],
        'What caused the repeated discount?',
        [
          { id: 'more-trips', label: 'The traveler booked three trips.' },
          { id: 'normalize-first', label: 'Duplicate detection ran before coupon normalization.' },
          { id: 'wrong-date', label: 'The booking had the wrong travel date.' },
        ]
      ),
      chapter(
        'unexpected-postcard',
        'An unexpected postcard',
        'PocketPier Counter',
        'ctf-bank-transfer',
        'Trace a fictional transfer submitted by a page on another origin.',
        'Sol · budget keeper',
        [
          'This transfer says it came from a postcard. That is not our banking app.',
          'The balances are fictional. We’re investigating the request boundary, not moving money.',
        ],
        [
          {
            id: 'origin-question',
            label: 'Where did it come from?',
            text: 'https://postcard.invalid. Compare it with the banking app’s own origin.',
          },
          {
            id: 'token-question',
            label: 'What was missing?',
            text: 'The CSRF token is empty, the body is text/plain, and the simulated amount is 25.',
          },
        ],
        [
          file(
            'postcard',
            'A postcard from nowhere',
            'photo',
            'MAIL SLOT',
            'Wish you were here!\nFrom: postcard.invalid\nEnclosed: an unexpected budget adjustment.',
            {
              art: 'postcard',
              reverse: 'POST TRACE · amount 25 / Content-Type text/plain / csrfToken empty',
            }
          ),
          file(
            'transfer-note',
            'Transfer authorization note',
            'log',
            'BUDGET LEDGER',
            'A signed-in browser may carry cookies to a request.\nThat does not prove the user intended an action.\nCheck the origin and CSRF protection.'
          ),
          file(
            'transfer-finding',
            'Recovered transfer finding',
            'email',
            'RECOVERED AFTER THE LAB',
            'The simulation accepted a cross-site action without a CSRF check. This completes the budget trail. No real money or external request was involved.',
            {
              afterLab: true,
              from: 'review@pocketpier.lab.invalid',
              subject: 'Boundary check confirmed',
            }
          ),
        ],
        'What should protect this transfer?',
        [
          { id: 'long-id', label: 'A longer transfer ID.' },
          { id: 'hide-form', label: 'A hidden form button.' },
          {
            id: 'csrf-check',
            label: 'Server-side CSRF and origin validation for state-changing actions.',
          },
        ]
      ),
    ],
  },
  {
    id: 'last-signal',
    number: '03',
    title: 'The Last Signal',
    label: 'A studio launch. A signal off course.',
    difficulty: 'Hard · chained investigation',
    minutes: 100,
    color: 'plum',
    symbol: 'signal',
    summary:
      'Studio Nine’s launch light went quiet. A build artifact, a design import, and a studio connector hide the trail. Bring your best clue-connecting brain.',
    dispatch:
      'Ari left three scraps on the studio desk. This case uses Hard CTFs: complete each lab’s discovery phase before exploiting its chain.',
    ending:
      'Case closed. The signal trail linked debug disclosure and traversal, an inherited export permission, and a URL whose real host was not its visible prefix. Every action stayed inside a simulation. Studio Nine can launch with safer boundaries.',
    chapters: [
      chapter(
        'build-scraps',
        'Build-room scraps',
        'PipelineNine Workshop',
        'ctf-devops-build',
        'Use a debug trace to find a private neighboring release artifact.',
        'Ari · release crew',
        [
          'Build 811 finished, but the launch checklist isn’t in the public artifacts.',
          'Start with discovery in the lab. It gives you a signed ticket for the exploit phase.',
        ],
        [
          {
            id: 'build-question',
            label: 'Which build should I inspect?',
            text: '811, with debug true. Read the artifact-root path in the trace.',
          },
          {
            id: 'artifact-question',
            label: 'What is next to the public folder?',
            text: 'The release folder. Compare /build/public with /build/release/launch.txt.',
          },
        ],
        [
          file(
            'build-note',
            'Build-room handoff',
            'log',
            'RELEASE DESK',
            'buildId: 811\ndebug: false\nPublished artifact: readme.txt\nStart with the debug trace; follow the neighboring path.'
          ),
          file(
            'studio-map',
            'Artifact cabinet sketch',
            'photo',
            'WORKSHOP WALL',
            'BUILD CABINET\npublic / readme.txt\nrelease / launch.txt\nTwo drawers. One path resolver.',
            {
              art: 'cabinet',
              reverse: 'AFTER DISCOVERY · request ../release/launch.txt in exploit phase.',
            }
          ),
          file(
            'design-handoff',
            'Recovered release checklist',
            'email',
            'RECOVERED AFTER THE LAB',
            'PixelDock imported the launch brand kit. The next handoff mentions an inherited canExport permission and private/brand-kit.svg.',
            {
              afterLab: true,
              from: 'release@pipelinenine.lab.invalid',
              subject: 'Brand-kit handoff',
            }
          ),
        ],
        'Which pair of failures opened the private artifact?',
        [
          {
            id: 'trace-traversal',
            label: 'Debug disclosure followed by an unchecked neighboring path.',
          },
          { id: 'slow-build', label: 'A slow build and a disconnected monitor.' },
          { id: 'old-logo', label: 'An old logo in the release notes.' },
        ]
      ),
      chapter(
        'borrowed-permission',
        'A borrowed permission',
        'PixelDock Studio',
        'ctf-design-export',
        'Inspect an import that makes a private export look permitted.',
        'Mina · design desk',
        [
          'The private kit exported after a project import. Nobody granted a new permission.',
          'The lab models the merge safely. It never changes a real JavaScript prototype.',
        ],
        [
          {
            id: 'import-question',
            label: 'Which import field is suspicious?',
            text: 'An own __proto__ field containing canExport: true. Inspect the imported configuration rather than the artwork.',
          },
          {
            id: 'export-question',
            label: 'Where did the export point?',
            text: 'private/brand-kit.svg. Complete discovery first, then investigate the export phase.',
          },
        ],
        [
          file(
            'import-receipt',
            'Project import receipt',
            'receipt',
            'DESIGN DESK',
            'PIXELDOCK IMPORT\nProject: Untitled\nExpected: name, colors, canvas\nObserved: an inherited permission after import.'
          ),
          file(
            'config-margin',
            'Configuration margin note',
            'log',
            'IMPORT REVIEW',
            'Unexpected key: __proto__\nNested value: canExport: true\nPrivate target: private/brand-kit.svg\nUse explicit permission checks and safe merge rules.'
          ),
          file(
            'connector-handoff',
            'Recovered brand-kit note',
            'memo',
            'RECOVERED AFTER THE LAB',
            'EchoRoom’s diagnostics connector knows the missing signal route. The raw URL check looks for hooks.echoroom.invalid, but the parsed host tells another story.',
            { afterLab: true }
          ),
        ],
        'What made the export permission unsafe?',
        [
          { id: 'file-format', label: 'The image used SVG instead of PNG.' },
          {
            id: 'inherited-permission',
            label: 'An inherited configuration value was treated as authorization.',
          },
          { id: 'small-canvas', label: 'The canvas was too small.' },
        ]
      ),
      chapter(
        'wrong-destination',
        'The wrong destination',
        'EchoRoom Loft',
        'ctf-music-hook',
        'Follow a connector URL whose visible name is not its destination host.',
        'Kit · studio sound',
        [
          'Our studio signal did not go where the URL seemed to promise.',
          'Use diagnostics for discovery. The URL parser knows which part is actually the host.',
        ],
        [
          {
            id: 'diagnostics-question',
            label: 'What does diagnostics reveal?',
            text: 'The fictional internal host is metrics.internal and the route is /flag. No internal service is actually contacted.',
          },
          {
            id: 'url-question',
            label: 'What should I compare?',
            text: 'Compare the raw URL and parsedHost. Text before @ can be user information, not the destination hostname.',
          },
        ],
        [
          file(
            'signal-card',
            'Signal connector card',
            'photo',
            'LOFT MIXING DESK',
            'ECHOROOM SIGNAL\nApproved text: hooks.echoroom.invalid\nDestination: inspect the parsed hostname\nDiagnostics comes first.',
            {
              art: 'signal',
              reverse: 'URL NOTE · https://hooks.echoroom.invalid@metrics.internal/flag',
            }
          ),
          file(
            'parser-memo',
            'A parser’s little warning',
            'memo',
            'SILENT TRANSCRIPT',
            'A friendly-looking prefix is not a hostname check. Parse the URL, verify the actual host, and reject internal destinations. This case never makes an outbound network request.'
          ),
          file(
            'signal-trace',
            'Recovered signal trace',
            'log',
            'RECOVERED AFTER THE LAB',
            'rawUrl: approved-looking user information @ internal host\nparsedHost: metrics.internal\nnetworkRequestMade: false\nFinding: the raw string validator checked the wrong boundary.',
            { afterLab: true }
          ),
        ],
        'What should decide whether this connector destination is allowed?',
        [
          {
            id: 'parsed-host',
            label: 'The parsed URL host and a server-side destination allowlist.',
          },
          { id: 'contains-text', label: 'Whether the raw text contains an approved name.' },
          { id: 'url-length', label: 'Whether the URL is short enough.' },
        ]
      ),
    ],
  },
];
export const findMission = (id) => missionCases.find((item) => item.id === id);
export function emptyMissionState() {
  return { pinned: [], replies: [], solved: [], note: '' };
}
export function missionStage(caseFile, state) {
  return Math.min(state?.solved?.length || 0, caseFile.chapters.length - 1);
}
