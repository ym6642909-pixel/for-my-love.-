// Dictionary translations (Spanish / Egyptian Arabic)
const translations = {
    es: {
        "title": "Entre Dos Mundos",
        "subtitle": "12,600 km no son nada cuando las almas están cerca",
        "cairo-label": "Egipto",
        "tegu-label": "Honduras",
        "card1-title": "Un café compartido",
        "card1-desc": "Algún día probaremos el café hondureño frente a las Pirámides de Guiza.",
        "card2-title": "Mismo cielo",
        "card2-desc": "Aunque tengamos horas de diferencia, contemplamos exactamente las mismas estrellas.",
        "card3-title": "Nuestras Palabras",
        "card3-desc": "Aprendiendo español por ti, mientras tú aprendes dialecto egipcio por mí.",
        "letter-body": "Querida mía... Aunque aún no nos hemos abrazado en persona, cada palabra contigo ha acortado esta gran distancia. Este sitio es mi pequeño regalo para recordarte que sin importar cuántos kilómetros nos separen, mi corazón siempre encuentra el camino hacia ti. 📜❤️",
        "envelope-hint": "Haz clic en el sobre para abrir la carta"
    },
    ar: {
        "title": "بين عالمين",
        "subtitle": "١٢,٦٠٠ كم ولا حاجة لما القلوب تكون قريبة",
        "cairo-label": "مصر",
        "tegu-label": "هندوراس",
        "card1-title": "فنجان قهوة سوا",
        "card1-desc": "في يوم من الأيام هنشرب القهوة الهندوراسية قدام أهرامات الجيزة.",
        "card2-title": "نفس السماء",
        "card2-desc": "مهما كان فرق الساعات بيننا، بنبص على نفس النجوم كل ليلة.",
        "card3-title": "حكاياتنا والكلمات",
        "card3-desc": "بتعلم إسباني عشانك، وأنتِ بتتعلمي مصري عشاني.",
        "letter-body": "يا أجمَل ما عرفت... رغم إننا لسه متقابلناش في الحقيقة، بس كل كلمة بيننا كانت بتقلل المسافة الكبيرة دي. الموقع ده هديتي البسيطة ليكي عشان أفكّرك إن مهما كانت الكيلومترات بيننا، قلبي دايماً بيعرف طريقه ليكي. 📜❤️",
        "envelope-hint": "اضغطي على المظروف عشان تفتحي الرسالة"
    }
};

let currentLang = 'es';

function toggleLanguage() {
    currentLang = currentLang === 'es' ? 'ar' : 'es';
    const body = document.body;

    // Toggle RTL class for Arabic
    if (currentLang === 'ar') {
        body.classList.add('rtl');
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
    } else {
        body.classList.remove('rtl');
        document.documentElement.setAttribute('dir',الآن سنقوم بكتابة ملفات الجافاسكريبت (**JS**) الخاصة بالتفاعلات والساعات وتغيير اللغة. 

أنشئ مجلداً باسم `js` بجانب ملف `index.html` وضع بداخل الملفات التالية بالترتيب:

---

### 4️⃣ الملف الأول: `js/clock.js`

هذا الملف مسؤول عن حساب وعرض الوقت المباشر بين القاهرة وتيغوسيجالبا (هندوراس) ثانية بثانية:

```javascript
function updateClocks() {
    const now = new Date();

    // Cairo Time (UTC+2 or UTC+3 depending on DST)
    const cairoOptions = { 
        timeZone: 'Africa/Cairo', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
    };
    const cairoTimeString = new Intl.DateTimeFormat('en-US', cairoOptions).format(now);
    
    // Tegucigalpa Time (UTC-6)
    const teguOptions = { 
        timeZone: 'America/Tegucigalpa', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit',
        hour12: false 
    };
    const teguTimeString = new Intl.DateTimeFormat('en-US', teguOptions).format(now);

    // Update HTML Elements
    const cairoElement = document.getElementById('cairo-clock');
    const teguElement = document.getElementById('tegu-clock');

    if (cairoElement) cairoElement.innerText = cairoTimeString;
    if (teguElement) teguElement.innerText = teguTimeString;
}

// Run update every second
setInterval(updateClocks, 1000);
updateClocks();
