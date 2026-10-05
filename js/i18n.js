const translations = {
    es: {
        "hero-tag": "12,600 KM • DOS CONTINENTES",
        title: "A Través del Tiempo y la Distancia",
        subtitle: "Diferentes zonas horarias, un mismo cielo.",
        "cairo-label": "Hora Local",
        "tegu-label": "Hora Local",
        "card1-title": "Horizontes Paralelos",
        "card1-desc": "Cuando el sol se levanta sobre el Nilo, la noche descansa en las montañas hondureñas.",
        "card2-title": "Un Lenguaje Compartido",
        "card2-desc": "Creando un vocabulario único entre la calidez egipcia y la gracia catracha.",
        "card3-title": "El Primer Encuentro",
        "card3-desc": "Una promesa silenciosa para compartir un café frente a frente en el futuro.",
        "ticket-title": "NOTA PRIVADA",
        "ticket-status": "TOCA PARA REVELAR",
        "letter-body": "Aunque los océanos nos separan hoy, cada conversación ha acortado la distancia. Este espacio es un pequeño recordatorio de que, sin importar los kilómetros, mis pensamientos se dirigen naturalmente hacia ti."
    },
    ar: {
        "hero-tag": "١٢,٦٠٠ كم • قارتين",
        title: "عبر الوقت والمسافات",
        subtitle: "توقيت مختلف، وسماء واحدة تجمعنا.",
        "cairo-label": "التوقيت المحلي",
        "tegu-label": "التوقيت المحلي",
        "card1-title": "آفاق متوازية",
        "card1-desc": "عندما تشرق الشمس على النيل، تهدأ الليالي فوق جبال هندوراس.",
        "card2-title": "لغة خاصة",
        "card2-desc": "ننسج تفاصيل ورسائل تجمع بين دفء مصر وجمال هندوراس.",
        "card3-title": "اللقاء الأول",
        "card3-desc": "وعد غير مكتوب بفنجان قهوة نتشاركه سوياً في المستقبل.",
        "ticket-title": "رسالة خاصة",
        "ticket-status": "اضغطي للقراءة",
        "letter-body": "رغم أن المحيطات تفصل بيننا اليوم، إلا أن كل حديث بيننا كان يقرّب المسافات. هذا الموقع هو تذكير بسيط بأنه مهما بلغت الكيلومترات، فإن أفكاري تجد طريقها دائماً إليكِ."
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
