"""One list of projects, used by the website and by the reveal animation so they never disagree."""

GITHUB = "https://github.com/awsaalibdeh-a11y/"

# Fill this in once Homebase is deployed; until then the card says "coming soon".
HOMEBASE_URL = "https://homebase-family.onrender.com"

PROJECTS = [
    {
        "id": "homebase", "name": "Homebase", "emoji": "🏠", "hue": 215, "kind": "app",
        "tag": "Family map, calls and screen time, honest about every bit.",
        "about": "A family app for Android, Windows and the browser: see where everyone is, message, and make calls that really ring in their own window. "
                 "Parents see each child's screen time today, can lock a device or ground certain apps (with a minute's warning), and set jobs and points. "
                 "It is built to never feel controlling: the child sees exactly what the family sees, can pause sharing, and every lock or grounding is announced in the family chat.",
        "stack": ["Kotlin", "Jetpack Compose", "C# Windows tracker", "WebRTC", "Flask"],
        "url": HOMEBASE_URL, "repo": "homebase",
        "steps": ["Open it in the browser, or install the Android app", "Create a family, or join with a code", "Share the map, call, and see screen time"],
    },
    {
        "id": "scout", "name": "Scout", "emoji": "🧭", "hue": 160, "kind": "ai",
        "tag": "A map that you can talk to.",
        "about": "A local-search map with an AI concierge. Ask for what you want in plain words and it finds real places near you, "
                 "using a local index of 103,000 Saudi places so answers come back in about a second.",
        "stack": ["Flask", "Leaflet", "Overture Maps", "OpenAI"],
        "url": "https://scout-15t6.onrender.com", "repo": "scout",
        "steps": ["Type what you want, like a quiet cafe with wifi", "The concierge searches real places near you", "Tap a pin for hours and directions"],
    },
    {
        "id": "unwritten", "name": "Unwritten", "emoji": "📖", "hue": 280, "kind": "game",
        "tag": "A life simulator where the AI types your story live.",
        "about": "A BitLife-style game. Every year the AI writes an event for your life, word by word as you watch, "
                 "and the choices you make change your money, health, relationships and ending.",
        "stack": ["Flask", "Vanilla JS", "OpenAI streaming"],
        "url": "https://unwritten-dulm.onrender.com", "repo": "unwritten",
        "steps": ["Be born and pick a name", "Watch each year's event type itself out", "Choose, age up, and see how it ends"],
    },
    {
        "id": "cookify", "name": "Cookify", "emoji": "🍳", "hue": 25, "kind": "tool",
        "tag": "Recipes that already know your allergies.",
        "about": "A recipe site with an allergy and diet engine, ingredient swaps, and a step-by-step cook mode, "
                 "so what you see is only what you can safely eat.",
        "stack": ["Flask", "Vanilla JS", "OpenAI"],
        "url": "https://cookify-6auu.onrender.com", "repo": "cookify",
        "steps": ["Tell it your allergies and diet", "Search, or let the AI find recipes", "Cook along in cook mode"],
    },
    {
        "id": "crosswind", "name": "Crosswind", "emoji": "✈️", "hue": 200, "kind": "game",
        "tag": "A flight simulator that lives in a browser tab.",
        "about": "A flight sim with a real flight model: lift, stall, drag and thrust in SI units on a 16 km generated island. "
                 "Four aircraft, hand-written sky, sea and clouds, no installs.",
        "stack": ["Three.js", "Custom shaders", "Flask"],
        "url": "https://crosswind-w8g9.onrender.com", "repo": "crosswind",
        "steps": ["Pick one of the four aircraft", "Full throttle, then ease back at about 60 knots", "Fly the island and land on the runway"],
    },
    {
        "id": "platter", "name": "Platter", "emoji": "🍽️", "hue": 90, "kind": "tool",
        "tag": "A recipe box with 1,103 recipes.",
        "about": "A three-pane recipe box in the style of Plate It. Diet filters, an AI helper, price estimates, "
                 "a weekly planner, pantry, and it works offline.",
        "stack": ["Flask", "Vanilla JS", "Service worker"],
        "url": "https://platter-87b0.onrender.com", "repo": "platter",
        "steps": ["Browse more than a thousand recipes", "Filter by diet, or ask the AI helper", "Plan the week and get a shopping list"],
    },
    {
        "id": "alibi", "name": "Alibi", "emoji": "🕵️", "hue": 340, "kind": "game",
        "tag": "A murder mystery where one of your friends is the killer.",
        "about": "A multiplayer party game. The AI writes a fresh case, one player is secretly the killer, "
                 "and everyone plays on their own phone: question suspects, search rooms, and solve it before time runs out.",
        "stack": ["Flask", "Polling", "OpenAI"],
        "url": "https://alibi-d9tn.onrender.com", "repo": "alibi",
        "steps": ["Make a room and share the code", "Roles are handed out in secret", "Question, search and name the killer"],
    },
    {
        "id": "tripmate", "name": "Tripmate", "emoji": "🧳", "hue": 45, "kind": "ai",
        "tag": "A travel agent that respects your budget.",
        "about": "An AI trip planner. Say where you are going and what you can spend and it researches flights and stays, "
                 "checks the total against your budget, and shows the route on a map.",
        "stack": ["Flask", "Leaflet", "OpenAI + web search"],
        "url": "https://tripmate-yecg.onrender.com", "repo": "tripmate",
        "steps": ["Say where, when and your budget", "The agent researches flights and stays", "Compare, save, and export to your calendar"],
    },
    {
        "id": "cramly", "name": "Cramly", "emoji": "🎓", "hue": 255, "kind": "ai",
        "tag": "Turn your notes into something you can actually learn.",
        "about": "An AI study app. Drop in notes, a PDF, slides or a photo and get a study plan, flashcards, quizzes "
                 "and a tutor that knows your material, plus match and swipe games to make it stick.",
        "stack": ["Flask", "Postgres", "OpenAI"],
        "url": "https://cramly-twz5.onrender.com", "repo": "cramly",
        "steps": ["Upload notes, a PDF or a photo", "Get a plan, flashcards and quizzes", "Ask the tutor and play the games"],
    },
    {
        "id": "womanten", "name": "Womanten", "emoji": "🌱", "hue": 12, "kind": "app",
        "tag": "A confidence and habits coach with a push-up app lock.",
        "about": "An app for building confidence and healthy habits: an AI coach, a weekly plan, AI-made workout and food plans, habits, a journal, a cycle tracker and challenges with friends. "
                 "On Android, TikTok, Instagram and YouTube stay locked until you do a push-up on camera, and each push-up earns 10 scrolls. It never rates looks and never counts calories.",
        "stack": ["Kotlin", "ML Kit pose detection", "Flask", "OpenAI"],
        "url": "https://womanten.onrender.com", "repo": "womanten",
        "steps": ["Open the site, or install the Android app", "Pick what you want to work on and build your week", "Lock your scrolling apps and earn scrolls with push-ups"],
    },
    {
        "id": "whatif", "name": "Whatif", "emoji": "🌀", "hue": 25, "kind": "ai",
        "tag": "Type a what-if and watch the world change.",
        "about": "An alternate-history storyteller. Ask any what-if and the AI writes a timeline that fills in while you watch, the domino chain of cause and effect, "
                 "who wins and loses and how believable it is. Change any event to branch a new story, keep them all in your own Multiverse, and share one as a link or a poster.",
        "stack": ["Flask", "OpenAI", "Streaming"],
        "url": "https://whatif-kkq1.onrender.com", "repo": "whatif",
        "steps": ["Type a what-if or pick today's", "Watch the timeline write itself", "Change an event to branch it, then share the link"],
    },
    {
        "id": "nonsense", "name": "Totally Normal Website", "emoji": "🤪", "hue": 310, "kind": "game",
        "tag": "A deliberately terrible website. Nothing makes sense.",
        "about": "A joke site with a bad UI on purpose: a runaway button, a potato to chat with, a calculator where 2+2 is fish, a download bar for more RAM and a dozen more toys. "
                 "It opens with a photosensitivity warning and has a Calm mode with no flashing or movement.",
        "stack": ["Flask", "Vanilla JS", "Web Audio"],
        "url": "https://totally-normal-website.onrender.com", "repo": "totally-normal-website",
        "steps": ["Read the warning and pick Calm mode or the chaos", "Press anything. Most things do something", "Try to catch the button. It gives up eventually"],
    },
    {
        "id": "control", "name": "Cramly Control", "emoji": "🛠️", "hue": 0, "kind": "tool", "private": True,
        "tag": "The owner panel for Cramly.",
        "about": "A separate private panel for running Cramly: see accounts, send a personal message with a unique link, "
                 "ban or time out an account, and flip a kill switch. Owner only.",
        "stack": ["Flask", "Admin API"],
        "url": "https://cramly-control.onrender.com", "repo": "cramly-control",
        "steps": ["Sign in with the owner password", "See accounts and message people", "Ban, time out, or use the kill switch"],
    },
]

HOMEBASE_FEATURES = [
    ("📍", "Shared map", "Everyone who is sharing shows up, parents too. Offline? You still see the last place."),
    ("📞", "Calls that ring", "A real ringing window on Windows and full-screen calls on phones, not a quiet notification."),
    ("⏱️", "Honest screen time", "Counts playing and watching per app, never homework. The child sees exactly what parents see."),
    ("🔒", "Locks, 4 hours a day max", "A parent can lock a device; the family chat announces it and the child can ask to be unlocked."),
    ("🚫", "Ground certain apps", "Pick real apps from the child's computer, get a one-minute warning, and only that app closes."),
    ("💻", "Windows tracker", "A small tray app with its own pop-ups that updates itself and works for two brothers on one laptop."),
    ("✅", "Jobs and points", "Parents set jobs, children tick them off, parents approve them for points."),
    ("🙋", "Ask, don't track", "\"Where are you?\" is a request the child can answer or say not now to."),
    ("🏡", "Home area", "Know when someone gets home, using a place the family sets together."),
]

HOMEBASE_STEPS = [
    ("Open it", "On any phone or laptop just open the website and tap Add to Home screen. It is always the newest version. Or download the Android app."),
    ("Create or join", "A parent creates the family. Everyone else joins with an 8-character code."),
    ("Read and agree", "The child sees exactly what is shared and what never will be, then chooses."),
    ("Link the laptop", "On Windows, link the tracker with a 6-digit code so screen time counts games and videos, never homework."),
]


# How each project was made: my idea and decisions first, Claude helping, and what the OpenAI side did.
MADE = {
    "homebase": {
        "steps": [
            "I wanted a family app that never feels controlling",
            "I set the rules: consent first, honest screen time, nothing secret. Claude helped write the Android app, the Windows tracker and the server",
            "We tested on my real laptop and tablet, fixed what broke (grounding, ringing, two tabs), and I shipped it"
        ],
        "ai": ""
    },
    "scout": {
        "steps": [
            "I wanted a map I could talk to",
            "I chose the data and the look. Claude helped build the place index and concierge",
            "I tuned it until it was fast, then put it online"
        ],
        "ai": "OpenAI API"
    },
    "unwritten": {
        "steps": [
            "I asked for BitLife, but written by AI",
            "I designed the game. Claude helped with the rules and live typing; the OpenAI API writes each event",
            "I played it, gave feedback, and we balanced it"
        ],
        "ai": "OpenAI API"
    },
    "cookify": {
        "steps": [
            "I wanted recipes that respect allergies",
            "I planned the features. Claude helped build the allergy engine; the OpenAI API powers AI search",
            "I tested it and put it online"
        ],
        "ai": "OpenAI API"
    },
    "crosswind": {
        "steps": [
            "I said: make me a plane sim like MSFS",
            "I picked the aircraft and the feel. Claude helped with the flight physics and the sky",
            "I flew it, said what felt wrong, and we fixed it"
        ],
        "ai": ""
    },
    "platter": {
        "steps": [
            "I found an app I loved and wanted my own",
            "I sent the screenshot. Claude helped rebuild it and add 1,103 recipes",
            "I chose the extras and put it online"
        ],
        "ai": "OpenAI API"
    },
    "alibi": {
        "steps": [
            "I wanted a murder mystery where a friend is the killer",
            "I came up with the rules. Claude helped build the multiplayer server; the OpenAI API writes each case",
            "I played it with bots and friends, then shipped it"
        ],
        "ai": "OpenAI API"
    },
    "tripmate": {
        "steps": [
            "I started in ChatGPT Agent Builder and built the agent myself",
            "Claude taught me step by step, then helped move my agent into code with the OpenAI API",
            "I added the extras I wanted and put it online"
        ],
        "ai": "ChatGPT Agent Builder + OpenAI API"
    },
    "cramly": {
        "steps": [
            "I wanted a study app that was actually good",
            "I designed the study flow. Claude helped build it on the OpenAI API",
            "I asked for more features each round until it felt right"
        ],
        "ai": "OpenAI API"
    },
    "womanten": {
        "steps": [
            "I wanted an app like Critique AI, mixing the confidence coach and the habit tracker, and I named it Womanten",
            "I decided what it must never do (rate looks, count calories) and what it must do: lock the scrolling apps until you do a push-up. Claude helped build it; the OpenAI API writes the plans and coaches",
            "I asked for it to be more useful, tested it, fixed what felt wrong, and put it online"
        ],
        "ai": "OpenAI API"
    },
    "whatif": {
        "steps": [
            "I asked for website ideas and picked the what-if one",
            "I decided it should write the story live, let you branch any event and share it as a link. Claude helped build it; the OpenAI API writes the stories",
            "I tested it on real questions, fixed where the AI slipped, and put it online"
        ],
        "ai": "OpenAI API"
    },
    "nonsense": {
        "steps": [
            "I wanted the worst website I could think of, on purpose",
            "I chose every bad idea: the colours, the runaway button, the potato, the nonsense answers",
            "I asked for a seizure warning and a Calm mode, tested the buttons until they worked, and put it online"
        ],
        "ai": ""
    },
    "control": {
        "steps": [
            "I wanted a private owner panel for Cramly",
            "I decided what it could do. Claude helped build it",
            "I set the password and put it online"
        ],
        "ai": ""
    }
}

for _p in PROJECTS:
    _p["made"] = MADE[_p["id"]]["steps"]
    _p["ai"] = MADE[_p["id"]]["ai"]

PROCESS = [
    ("me", "I come up with the idea", "A sentence, a screenshot, or a feeling: make me a plane sim, or a murder mystery with my friends."),
    ("me", "I decide how it should work", "What it does, how it looks, what it must never do. Every project starts with my choices."),
    ("claude", "Claude helps me build it", "I describe it, Claude helps write the code, and we keep going until it reads clean."),
    ("both", "We test it for real", "Browsers, Android phones, real calls. I say what feels wrong and we fix it."),
    ("me", "I put it online", "Then I decide what to make better next, and we go round again."),
]

# Order matters: the first one is the biggest credit.
CREDITS = [
    ("Me", "Every idea, design decision, test and \"make it better\". I made these.", "primary"),
    ("Claude", "Anthropic's AI, helped me write and test the code and get it online.", "helper"),
    ("ChatGPT Agent Builder", "Where I first built the Tripmate agent and learned how agents work.", "tool"),
    ("OpenAI API", "Powers the AI inside Scout, Unwritten, Cookify, Platter, Alibi, Tripmate, Cramly, Womanten and Whatif.", "tool"),
]


# Real milestones, newest first. Only things that actually shipped.
NEWS = [
    ("Homebase", "Two tabs everywhere, a ringing call window on Windows, and a built-in update guide for the old app."),
    ("Homebase", "Parents see each child's screen time today on the Family tab, on the web and on Android."),
    ("Homebase", "Grounding fixed so only the grounded app closes. The tracker now updates itself."),
    ("Homebase", "Windows tracker, locks with a 4-hour daily cap, grounding with a one-minute warning, jobs and points."),
    ("Cramly", "One Cramly account works across every app, with owner switches for bans, time-outs and a kill switch."),
    ("Showcase", "The reveal got sound, live online/waking status, search and a share image."),
]

FAQ = [
    ("Are these real?", "Yes. Every card links to a live site you can open now. Free-tier sites sleep when nobody visits, so the first load can take up to 30 seconds. The Wake all sites button warms them up."),
    ("Who made them?", "I did: the ideas, the choices and the testing. Claude helped me write and test the code, and some projects use the OpenAI API for their AI."),
    ("Is Homebase spying on kids?", "No. The child sees exactly what the family sees, can pause sharing, and every lock or grounding is announced in the family chat. It never hides itself."),
    ("Why does Homebase count screen time?", "So a parent can talk about it with real numbers. It counts playing and watching, never homework, and the minutes are never changed in secret."),
    ("Can I use them on my phone?", "Yes. Everything works in a phone browser, and most can be added to the home screen."),
]
