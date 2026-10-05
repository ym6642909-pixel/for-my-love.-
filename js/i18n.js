const translations = {
    es: {
        tag: "12,600 KM",
        title: "Entre El Cairo y Tegucigalpa",
        subtitle: "Dos lugares, un mismo sentimiento.",
        "cairo-city": "El Cairo",
        "tegu-city": "Tegucigalpa",
        "card1-front-title": "Un pensamiento",
        "card1-back-text": "Un día compartiremos un café real, sin pantallas de por medio.",
        "card2-front-title": "El tiempo",
        "card2-back-text": "Las horas de diferencia no cambian la cercanía de nuestras conversaciones.",
        "card3-front-title": "Lo que viene",
        "card3-back-text": "Aún no tenemos fotos juntos, pero tenemos historias por escribir.",
        "tap-hint": "Haz clic",
        "letter-text": "Esta página es solo un pequeño detalle para recordarte que la distancia es solo geográfica. Gracias por cada momento y por estar presente a pesar de los kilómetros.",
        signature: "Con cariño 🌸"
    },
    ar: {
        tag: "١٢,٦٠٠ كم",
        title: "بين القاهرة وتيغوسيجالبا",
        subtitle: "مكانان، وشعور واحد.",
        "cairo-city": "القاهرة",
        "tegu-city": "تيغوسيجالبا",
        "card1-front-title": "فكرة بسيطة",
        "card1-back-text": "في يوم من الأيام هنشرب فنجان قهوة حقيقي مع بعض، من غير شاشات.",
        "card2-front-title": "الوقت",
        "card2-back-text": "فرق الساعات ما بيغيرش قرب المحادثات بيننا.",
        "card3-front-title": "اللي جاي",
        "card3-back-text": "لسه معندناش صور مع بعض، بس عندنا حكايات كتير هنكتبها سوا.",
        "tap-hint": "اضغطي هنا",
        "letter-text": "الموقع ده لمسة بسيطة عشان أفكّرك إن المسافة مجرد أرقام. شكراً على كل لحظة وعلى وجودك الجميل رغم كل الكيلومترات.",
        signature: "مع كل الود 🌸"
    }
};

let currentLang = 'es';

function toggleLanguage() {
    currentLang = currentLang === 'es' ? 'ar' : 'es';
    
    if (currentLang === 'ar') {
        document.body.classList.add('rtl');
        document.documentElement.setAttribute('lang', 'ar');
        document.documentElement.setAttribute('dir', 'rtl');
    } else {
        document.body.classList.remove('rtl');
        document.documentElement.setAttribute('lang', 'es');
        document.documentElement.setAttribute('dir', 'ltr');
    }

    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[currentLang][key]) {
            el.innerText = translations[currentLang][key];
        }
    });
}
