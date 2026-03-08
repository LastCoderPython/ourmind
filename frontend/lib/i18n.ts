// OurMind i18n — Translation map for EN, HI, AS

export type Locale = "en" | "hi" | "as";

const translations: Record<string, Record<Locale, string>> = {
    // --- Header ---
    "header.quickExit": { en: "Quick Exit", hi: "त्वरित निकास", as: "দ্ৰুত প্ৰস্থান" },

    // --- Bottom Nav ---
    "nav.chat": { en: "Chat", hi: "चैट", as: "চ্যাট" },
    "nav.stats": { en: "Stats", hi: "आँकड़े", as: "পৰিসংখ্যা" },
    "nav.library": { en: "Library", hi: "पुस्तकालय", as: "পুথিভঁৰাল" },
    "nav.wall": { en: "Wall", hi: "दीवार", as: "বেৰ" },

    // --- Login ---
    "login.title": { en: "Welcome to OurMind", hi: "OurMind में आपका स्वागत है", as: "OurMind লৈ আপোনাক স্বাগতম" },
    "login.subtitle": { en: "Your safe, anonymous space", hi: "आपका सुरक्षित, गुमनाम स्थान", as: "আপোনাৰ সুৰক্ষিত, বেনামী স্থান" },
    "login.nickname": { en: "Choose a Nickname", hi: "उपनाम चुनें", as: "এটা ডাকনাম বাছক" },
    "login.pin": { en: "Secret PIN", hi: "गुप्त पिन", as: "গোপন পিন" },
    "login.ghostMode": { en: "Ghost Mode", hi: "भूत मोड", as: "ভূত মোড" },
    "login.ghostDesc": { en: "Auto-clear session after 30 min of inactivity", hi: "30 मिनट की निष्क्रियता के बाद सत्र स्वतः साफ़ करें", as: "৩০ মিনিট নিষ্ক্ৰিয়তাৰ পিছত স্বয়ংক্ৰিয়ভাৱে ছেছন মচক" },
    "login.enter": { en: "Enter OurMind", hi: "OurMind में प्रवेश करें", as: "OurMind ত প্ৰৱেশ কৰক" },
    "login.newUser": { en: "New nickname? We'll create your space.", hi: "नया उपनाम? हम आपका स्थान बनाएँगे।", as: "নতুন ডাকনাম? আমি আপোনাৰ স্থান সৃষ্টি কৰিম।" },

    // --- Chat ---
    "chat.placeholder": { en: "Share what's on your mind…", hi: "अपने मन की बात साझा करें…", as: "আপোনাৰ মনৰ কথা কওক…" },
    "chat.welcome": { en: "Hey there 🌿 Welcome to your safe space. I'm here to listen and help you build emotional resilience. How are you feeling today?", hi: "नमस्ते 🌿 आपके सुरक्षित स्थान में आपका स्वागत है। मैं सुनने और भावनात्मक लचीलापन बनाने में आपकी मदद करने के लिए यहाँ हूँ। आज आप कैसा महसूस कर रहे हैं?", as: "নমস্কাৰ 🌿 আপোনাৰ সুৰক্ষিত স্থানলৈ আপোনাক স্বাগতম। মই শুনিবলৈ আৰু আৱেগিক স্থিতিস্থাপকতা গঢ়াত সহায় কৰিবলৈ ইয়াত আছোঁ। আজি আপোনাৰ কেনে লাগিছে?" },
    "chat.send": { en: "Send", hi: "भेजें", as: "পঠাওক" },

    // --- Crisis ---
    "crisis.title": { en: "You're Not Alone 💛", hi: "आप अकेले नहीं हैं 💛", as: "আপুনি অকলশৰীয়া নহয় 💛" },
    "crisis.text": { en: "It sounds like you're going through a really difficult time. Please reach out to one of these verified helplines — trained counselors are available 24/7.", hi: "ऐसा लगता है कि आप बहुत कठिन समय से गुज़र रहे हैं। कृपया इन सत्यापित हेल्पलाइनों में से किसी एक से संपर्क करें — प्रशिक्षित परामर्शदाता 24/7 उपलब्ध हैं।", as: "আপুনি সঁচাকৈয়ে কঠিন সময়ৰ মাজেৰে পাৰ হৈ আছে যেন লাগিছে। অনুগ্ৰহ কৰি এই প্ৰমাণিত হেল্পলাইনসমূহৰ এটাৰ সৈতে যোগাযোগ কৰক — প্ৰশিক্ষিত পৰামৰ্শদাতা ২৪/৭ উপলব্ধ।" },
    "crisis.dismiss": { en: "I understand, go back to chat", hi: "मैं समझता/समझती हूँ, चैट पर वापस जाएँ", as: "মই বুজি পাইছোঁ, চ্যাটলৈ উভতি যাওক" },

    // --- Stats ---
    "stats.title": { en: "Your Dashboard", hi: "आपका डैशबोर्ड", as: "আপোনাৰ ডেছব'ৰ্ড" },
    "stats.subtitle": { en: "Track your emotional resilience journey", hi: "अपनी भावनात्मक लचीलापन यात्रा को ट्रैक करें", as: "আপোনাৰ আৱেগিক স্থিতিস্থাপকতাৰ যাত্ৰা অনুসৰণ কৰক" },
    "stats.moodScore": { en: "Current Mood Score", hi: "वर्तमान मूड स्कोर", as: "বৰ্তমান মেজাজৰ স্ক'ৰ" },
    "stats.streak": { en: "Check-in streak 🔥 Keep going!", hi: "चेक-इन स्ट्रीक 🔥 जारी रखें!", as: "চেক-ইন ষ্ট্ৰীক 🔥 আগবাঢ়ি যাওক!" },
    "stats.weeklyTrend": { en: "Weekly Trend", hi: "साप्ताहिक प्रवृत्ति", as: "সাপ্তাহিক ধাৰা" },

    // --- Assessment ---
    "assess.title": { en: "Daily Check-in", hi: "दैनिक चेक-इन", as: "দৈনিক চেক-ইন" },
    "assess.subtitle": { en: "How are you feeling right now?", hi: "अभी आप कैसा महसूस कर रहे हैं?", as: "এতিয়া আপোনাৰ কেনে লাগিছে?" },
    "assess.mood": { en: "Mood", hi: "मनोदशा", as: "মেজাজ" },
    "assess.sleep": { en: "Sleep Quality", hi: "नींद की गुणवत्ता", as: "টোপনিৰ মান" },
    "assess.stress": { en: "Stress Level", hi: "तनाव का स्तर", as: "মানসিক চাপৰ স্তৰ" },
    "assess.submit": { en: "Submit Check-in", hi: "चेक-इन जमा करें", as: "চেক-ইন জমা দিয়ক" },

    // --- Library ---
    "library.title": { en: "Coping Library", hi: "मुकाबला पुस्तकालय", as: "মোকাবিলা পুথিভঁৰাল" },
    "library.subtitle": { en: "Personalized strategies for your resilience toolkit", hi: "आपके लचीलापन टूलकिट के लिए व्यक्तिगत रणनीतियाँ", as: "আপোনাৰ স্থিতিস্থাপকতা সঁজুলিৰ বাবে ব্যক্তিগতকৃত কৌশল" },

    // --- Wall ---
    "wall.title": { en: "Community Wall", hi: "सामुदायिक दीवार", as: "সম্প্ৰদায় বেৰ" },
    "wall.subtitle": { en: "Share anonymously. Support each other. Grow together.", hi: "गुमनाम रूप से साझा करें। एक-दूसरे का समर्थन करें। साथ बढ़ें।", as: "বেনামীভাৱে শ্বেয়াৰ কৰক। ইজনে সিজনক সমৰ্থন কৰক। একেলগে বাঢ়ক।" },
    "wall.shareStory": { en: "Share your story", hi: "अपनी कहानी साझा करें", as: "আপোনাৰ কাহিনী শ্বেয়াৰ কৰক" },
    "wall.placeholder": { en: "Write something positive and kind…", hi: "कुछ सकारात्मक और दयालु लिखें…", as: "ইতিবাচক আৰু দয়ালু কিবা লিখক…" },
    "wall.post": { en: "Post Anonymously", hi: "गुमनाम रूप से पोस्ट करें", as: "বেনামীভাৱে পোষ্ট কৰক" },
    "wall.support": { en: "Support", hi: "समर्थन", as: "সমৰ্থন" },
    "wall.growth": { en: "Growth", hi: "विकास", as: "বিকাশ" },
    "wall.relate": { en: "Relate", hi: "संबंध", as: "সম্পৰ্ক" },
    "wall.strength": { en: "Strength", hi: "शक्ति", as: "শক্তি" },
    "wall.posted": { en: "Your post is now on the wall!", hi: "आपकी पोस्ट अब दीवार पर है!", as: "আপোনাৰ পোষ্ট এতিয়া বেৰত আছে!" },
    "wall.justNow": { en: "Just now", hi: "अभी", as: "এইমাত্ৰ" },
};

export function t(key: string, locale: Locale): string {
    const entry = translations[key];
    if (!entry) return key;
    return entry[locale] || entry["en"] || key;
}
