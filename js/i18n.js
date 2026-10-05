const translations = {
    es: {
        title: "Entre Dos Mundos",
        subtitle: "12,600 km no son nada cuando las almas están cerca",
        "cairo-label": "Egipto 🇪🇬",
        "tegu-label": "Honduras 🇭🇳",
        "card1-title": "Un café compartido",
        "card1-desc": "Algún día probaremos el café hondureño frente a las Pirámides de Guiza.",
        "card2-title": "Mismo cielo",
        "card2-desc": "Aunque tengamos horas de diferencia, contemplamos las mismas estrellas.",
        "card3-title": "Nuestras Palabras",
        "card3-desc": "Aprendiendo español por ti, mientras tú aprendes dialecto egipcio por mí.",
        "letter-body": "Querida mía... Esta carta es una promesa de que la distancia física actual es solo el comienzo de nuestra gran historia juntos. No tenemos fotos juntos aún, pero tenemos un futuro entero para crearlas. Te mando un abrazo desde El Cairo hasta Tegucigalpa.",
        "envelope-hint": "Haz clic en el sobre para abrir la carta"
    },
    ar: {
        title: "جسر بين عالمين 🇪🇬 🇭🇳",
        subtitle: "أكثر من 12,000 كم مش هتقدر تبعد القلوب القريبة",
        "cairo-label": "القاهرة 🇪🇬",
        "tegu-label": "تيغوسيجالبا 🇭🇳",
        "card1-title": "فنجان قهوة سوا",
        "card1-desc": "في يوم من الأيام هنشرب القهوة الهندوراسية الممتازة مع بعض قدام الأهرامات.",
        "card2-title": "نفس السماء",
        "card2-desc": "مهما كان فرق الساعات بيننا، نهارك أو ليلي، بنبص على نفس السماء والنجوم.",
        "card3-title": "حكاياتنا والكلمات",
        "card3-desc": "بتعلم إسباني عشانك، وأنتي بتتعلمي مصري عشاني، وبنعمل لغتنا الخاصة.",
        "letter-body": "عزيزتي... الجواب ده هو وعد بسيط إن المسافة اللي بينا دلوقتي هي مجرد بداية لقصة جميلة. ماعندناش صور مع بعض لسه، بس عندنا مستقبل كامل هنملاه بالصور والذكريات. ببعتلك كل مشاعري من القاهرة لـ تيغوسيجالبا.",
        "envelope-hint": "اضغطي على المظروف عشان تفتحي الرسالة"
    }
};

let currentLang = 'es';

function toggleLanguage() {
    currentLang = currentLang === 'es' ? 'ar' : 'es';
    
    // Toggle RTL class on body for Arabic
    if (currentLang === 'ar') {
        document.body.classList.add('rtl');
        document.documentElement.setAttribute('lang', 'ar');
        document.documentElement.setAttribute('dir', 'rtl');
    } else {
        document.body.classList.remove('rtl');
        document.documentElement.setAttribute('lang', 'es');
        document.documentElement.setAttribute('dir', 'ltr');
    }

    // Translate all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });
}
