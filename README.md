# El Cofre que Aún No Abrimos

Experiencia romántica interactiva creada para Dacia.

## Estructura

dacia-love-story/
│
├── index.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── scenes.js
│   ├── audio.js
│   └── main.js
│
└── README.md

## تشغيل المشروع

لا يحتاج المشروع إلى Node.js أو قاعدة بيانات.

يمكن رفع المجلد بالكامل إلى GitHub Pages.

تأكد من الحفاظ على أسماء المجلدات والملفات كما هي.

## ترتيب ملفات JavaScript

في `index.html` يجب أن تكون الملفات بهذا الترتيب:

<script src="js/scenes.js"></script>
<script src="js/audio.js"></script>
<script src="js/main.js"></script>

لا تغيّر الترتيب لأن `main.js` يعتمد على البيانات الموجودة في `scenes.js`
ونظام الصوت الموجود في `audio.js`.

## المتطلبات

- HTML5
- CSS3
- Vanilla JavaScript
- Web Audio API
- Responsive Design
- GitHub Pages compatible
- No backend
- No framework

## تشغيل الصوت

بعض المتصفحات تمنع تشغيل الصوت تلقائياً.

لذلك يبدأ الصوت بعد أول تفاعل من المستخدم مع الصفحة.

## حفظ التقدم

يتم حفظ الذكريات التي تم اكتشافها باستخدام:

localStorage

ويمكن إعادة القصة من البداية باستخدام زر إعادة التشغيل.

## الوصول Accessibility

المشروع يتضمن:

- دعم لوحة المفاتيح
- Screen Reader announcements
- Focus management
- Focus trap
- Reduced Motion
- ARIA attributes
- Visible focus states
- Touch targets مناسبة للموبايل

## النشر على GitHub Pages

ارفع المجلد إلى Repository ثم فعّل GitHub Pages.

يجب أن يكون:

index.html

في المجلد الرئيسي للمشروع.

بعدها ستعمل الملفات:

css/style.css

js/scenes.js

js/audio.js

js/main.js

بشكل نسبي من نفس المشروع.
