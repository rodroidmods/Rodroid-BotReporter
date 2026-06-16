// Simple i18n utility — maps language codes to translation strings.

type TranslationKey =
  | "welcome"
  | "help"
  | "report_cancelled"
  | "select_app"
  | "app_selected"
  | "enter_description"
  | "send_text_please"
  | "select_severity"
  | "send_media_prompt"
  | "photo_received"
  | "video_received"
  | "file_received"
  | "send_valid_media"
  | "compiling_report"
  | "report_submitted"
  | "send_failed"
  | "action_cancelled"
  | "how_it_works"
  | "report_bug"
  | "back"
  | "my_reports_title"
  | "no_reports"
  | "report_status_line"
  | "status_open"
  | "status_in_progress"
  | "status_resolved"
  | "status_closed"
  | "severity_critical"
  | "severity_major"
  | "severity_minor"
  | "severity_suggestion"
  | "stats_title"
  | "stats_total"
  | "stats_apps"
  | "stats_severity"
  | "stats_status"
  | "edit_prompt"
  | "edit_no_recent"
  | "edit_window_expired"
  | "edit_updated"
  | "edit_sent_new_desc"
  | "reply_forwarded"
  | "reply_failed"
  | "search_no_results"
  | "search_results"
  | "dev_reply_header";

type LangPack = Record<TranslationKey, string>;

const en: LangPack = {
  welcome: `<b>Welcome to the Official Support Bot!</b> 🚀\n\nI am here to help you report bugs and issues directly to the development team.\nPlease choose an action below to get started.\n\n<i>Your reports help us improve our apps!</i>`,
  help: `<b>How to report a bug:</b>\n\n1️⃣ Click <b>Report a Bug</b>\n2️⃣ Select the app you are reporting for\n3️⃣ Provide a detailed text description\n4️⃣ Choose bug severity\n5️⃣ Send screenshots, videos, or log files (.zip, .txt)\n6️⃣ Type <b>done</b> when you are finished\n\nYou can type /cancel at any time to abort the process.`,
  report_cancelled: "Report cancelled.",
  select_app: "Which application are you reporting a bug for?",
  app_selected: "<b>{app}</b> selected.\n\nPlease provide a <b>detailed description</b> of the bug. You can paste crash logs or code snippets here too.\n(Type /cancel to abort)",
  enter_description: "Please send a text description, or type /cancel to abort.",
  send_text_please: "Please send a text description, or type /cancel to abort.",
  select_severity: "How severe is this bug?",
  send_media_prompt: "Great. Now, please send any relevant <b>Screenshots, Videos, or Files</b> (.zip, .txt).\n\nWhen you are finished, click the button below.",
  photo_received: "✅ Photo received! Click <b>Next</b> when done.",
  video_received: "✅ Video received! Click <b>Next</b> when done.",
  file_received: "✅ File received! Click <b>Next</b> when done.",
  send_valid_media: "Please send a valid file/media, or click <b>Next</b>.",
  compiling_report: "⏳ Compiling and sending your report...",
  report_submitted: "🎉 <b>Your report has been successfully submitted!</b>\n\nYour report ID: <code>{id}</code>\nUse /status {id} to check its status.",
  send_failed: "❌ Failed to send your report. Please contact the developer directly.",
  action_cancelled: "Action cancelled. Use /start to begin again.",
  how_it_works: "❓ How it works",
  report_bug: "🐛 Report a Bug",
  back: "⬅️ Back",
  my_reports_title: "<b>Your Recent Reports ({count}):</b>\n\n",
  no_reports: "You haven't submitted any reports yet.",
  report_status_line: "📋 <code>{id}</code> — {app}\n   Status: {status} | Severity: {severity}\n",
  status_open: "🟢 Open",
  status_in_progress: "🟡 In Progress",
  status_resolved: "🔵 Resolved",
  status_closed: "⚪ Closed",
  severity_critical: "🔴 Critical",
  severity_major: "🟠 Major",
  severity_minor: "🟢 Minor",
  severity_suggestion: "💡 Suggestion",
  stats_title: "<b>📊 Report Statistics</b>\n\n",
  stats_total: "📦 <b>Total Reports:</b> {total}\n",
  stats_apps: "\n📱 <b>By App:</b>\n{apps}",
  stats_severity: "\n⚠️ <b>By Severity:</b>\n{severities}",
  stats_status: "\n📌 <b>By Status:</b>\n{statuses}",
  edit_prompt: "Send the updated description for report <code>{id}</code>:",
  edit_no_recent: "You have no recent report to edit.",
  edit_window_expired: "The 5-minute edit window for report {id} has expired.",
  edit_updated: "✅ Report <code>{id}</code> description has been updated!",
  edit_sent_new_desc: "Please send the new description as text:",
  reply_forwarded: "✅ Reply successfully forwarded to the user.",
  reply_failed: "❌ Failed to forward the reply. The user might have blocked the bot.",
  search_no_results: "No reports found matching your query.",
  search_results: "<b>Search Results ({count}):</b>\n\n",
  dev_reply_header: "🧑‍💻 <b>Developer Reply</b>\n\n",
};

const ar: LangPack = {
  welcome: `<b>مرحبًا بك في بوت الدعم الرسمي!</b> 🚀\n\nأنا هنا لمساعدتك في الإبلاغ عن الأخطاء والمشكلات مباشرة إلى فريق التطوير.\nالرجاء اختيار إجراء أدناه للبدء.\n\n<i>تقاريرك تساعدنا في تحسين تطبيقاتنا!</i>`,
  help: `<b>كيفية الإبلاغ عن خطأ:</b>\n\n1️⃣ انقر <b>الإبلاغ عن خطأ</b>\n2️⃣ اختر التطبيق الذي تبلغ عنه\n3️⃣ قدم وصفًا نصيًا مفصلاً\n4️⃣ اختر درجة الخطورة\n5️⃣ أرسل لقطات شاشة أو فيديوهات أو ملفات (.zip, .txt)\n6️⃣ اكتب <b>done</b> عند الانتهاء\n\nيمكنك كتابة /cancel في أي وقت لإلغاء العملية.`,
  report_cancelled: "تم إلغاء التقرير.",
  select_app: "ما التطبيق الذي تريد الإبلاغ عن خطأ فيه؟",
  app_selected: "تم اختيار <b>{app}</b>.\n\nيرجى تقديم <b>وصف مفصل</b> للخطأ. يمكنك لصق سجلات الأعطال أو مقتطفات التعليمات البرمجية هنا أيضًا.\n(اكتب /cancel للإلغاء)",
  enter_description: "يرجى إرسال وصف نصي، أو اكتب /cancel للإلغاء.",
  send_text_please: "يرجى إرسال وصف نصي، أو اكتب /cancel للإلغاء.",
  select_severity: "ما مدى خطورة هذا الخطأ؟",
  send_media_prompt: "ممتاز. الآن، يرجى إرسال أي <b>لقطات شاشة أو فيديوهات أو ملفات</b> ذات صلة (.zip, .txt).\n\nعند الانتهاء، انقر على الزر أدناه.",
  photo_received: "✅ تم استلام الصورة! انقر <b>التالي</b> عند الانتهاء.",
  video_received: "✅ تم استلام الفيديو! انقر <b>التالي</b> عند الانتهاء.",
  file_received: "✅ تم استلام الملف! انقر <b>التالي</b> عند الانتهاء.",
  send_valid_media: "يرجى إرسال ملف/وسائط صالحة، أو انقر <b>التالي</b>.",
  compiling_report: "⏳ جاري تجميع وإرسال تقريرك...",
  report_submitted: "🎉 <b>تم تقديم تقريرك بنجاح!</b>\n\nمعرف التقرير: <code>{id}</code>\nاستخدم /status {id} للتحقق من حالته.",
  send_failed: "❌ فشل إرسال التقرير. يرجى الاتصال بالمطور مباشرة.",
  action_cancelled: "تم إلغاء الإجراء. استخدم /start للبدء من جديد.",
  how_it_works: "❓ كيف يعمل",
  report_bug: "🐛 الإبلاغ عن خطأ",
  back: "⬅️ رجوع",
  my_reports_title: "<b>تقاريرك الأخيرة ({count}):</b>\n\n",
  no_reports: "لم تقم بتقديم أي تقارير بعد.",
  report_status_line: "📋 <code>{id}</code> — {app}\n   الحالة: {status} | الخطورة: {severity}\n",
  status_open: "🟢 مفتوح",
  status_in_progress: "🟡 قيد المعالجة",
  status_resolved: "🔵 تم الحل",
  status_closed: "⚪ مغلق",
  severity_critical: "🔴 حرج",
  severity_major: "🟠 رئيسي",
  severity_minor: "🟢 ثانوي",
  severity_suggestion: "💡 اقتراح",
  stats_title: "<b>📊 إحصائيات التقارير</b>\n\n",
  stats_total: "📦 <b>إجمالي التقارير:</b> {total}\n",
  stats_apps: "\n📱 <b>حسب التطبيق:</b>\n{apps}",
  stats_severity: "\n⚠️ <b>حسب الخطورة:</b>\n{severities}",
  stats_status: "\n📌 <b>حسب الحالة:</b>\n{statuses}",
  edit_prompt: "أرسل الوصف المحدث للتقرير <code>{id}</code>:",
  edit_no_recent: "ليس لديك تقرير حديث لتعديله.",
  edit_window_expired: "انتهت نافذة التعديل (5 دقائق) للتقرير {id}.",
  edit_updated: "✅ تم تحديث وصف التقرير <code>{id}</code>!",
  edit_sent_new_desc: "يرجى إرسال الوصف الجديد كنص:",
  reply_forwarded: "✅ تم إعادة توجيه الرد إلى المستخدم بنجاح.",
  reply_failed: "❌ فشل إعادة توجيه الرد. ربما قام المستخدم بحظر البوت.",
  search_no_results: "لم يتم العثور على تقارير تطابق بحثك.",
  search_results: "<b>نتائج البحث ({count}):</b>\n\n",
  dev_reply_header: "🧑‍💻 <b>رد المطور</b>\n\n",
};

const ru: LangPack = {
  welcome: `<b>Добро пожаловать в официальный бот поддержки!</b> 🚀\n\nЯ здесь, чтобы помочь вам сообщать об ошибках и проблемах напрямую команде разработчиков.\nПожалуйста, выберите действие ниже, чтобы начать.\n\n<i>Ваши отчёты помогают нам улучшать наши приложения!</i>`,
  help: `<b>Как сообщить об ошибке:</b>\n\n1️⃣ Нажмите <b>Сообщить об ошибке</b>\n2️⃣ Выберите приложение\n3️⃣ Предоставьте подробное текстовое описание\n4️⃣ Выберите степень серьёзности\n5️⃣ Отправьте скриншоты, видео или файлы (.zip, .txt)\n6️⃣ Напишите <b>done</b> когда закончите\n\nВы можете написать /cancel в любой момент.`,
  report_cancelled: "Отчёт отменён.",
  select_app: "Для какого приложения вы сообщаете об ошибке?",
  app_selected: "Выбрано <b>{app}</b>.\n\nПожалуйста, предоставьте <b>подробное описание</b> ошибки. Вы также можете вставить логи или фрагменты кода.\n(Напишите /cancel для отмены)",
  enter_description: "Пожалуйста, отправьте текстовое описание или /cancel.",
  send_text_please: "Пожалуйста, отправьте текстовое описание или /cancel.",
  select_severity: "Насколько серьезна эта ошибка?",
  send_media_prompt: "Отлично. Теперь отправьте <b>скриншоты, видео или файлы</b> (.zip, .txt).\n\nКогда закончите, нажмите кнопку ниже.",
  photo_received: "✅ Фото получено! Нажмите <b>Далее</b> когда готово.",
  video_received: "✅ Видео получено! Нажмите <b>Далее</b> когда готово.",
  file_received: "✅ Файл получен! Нажмите <b>Далее</b> когда готово.",
  send_valid_media: "Пожалуйста, отправьте файл/медиа или нажмите <b>Далее</b>.",
  compiling_report: "⏳ Компиляция и отправка отчёта...",
  report_submitted: "🎉 <b>Ваш отчёт успешно отправлен!</b>\n\nID отчёта: <code>{id}</code>\nИспользуйте /status {id} для проверки статуса.",
  send_failed: "❌ Не удалось отправить отчёт. Свяжитесь с разработчиком напрямую.",
  action_cancelled: "Действие отменено. Используйте /start чтобы начать заново.",
  how_it_works: "❓ Как это работает",
  report_bug: "🐛 Сообщить об ошибке",
  back: "⬅️ Назад",
  my_reports_title: "<b>Ваши последние отчёты ({count}):</b>\n\n",
  no_reports: "Вы ещё не отправляли отчёты.",
  report_status_line: "📋 <code>{id}</code> — {app}\n   Статус: {status} | Серьёзность: {severity}\n",
  status_open: "🟢 Открыт",
  status_in_progress: "🟡 В работе",
  status_resolved: "🔵 Решён",
  status_closed: "⚪ Закрыт",
  severity_critical: "🔴 Критический",
  severity_major: "🟠 Важный",
  severity_minor: "🟢 Незначительный",
  severity_suggestion: "💡 Предложение",
  stats_title: "<b>📊 Статистика отчётов</b>\n\n",
  stats_total: "📦 <b>Всего отчётов:</b> {total}\n",
  stats_apps: "\n📱 <b>По приложениям:</b>\n{apps}",
  stats_severity: "\n⚠️ <b>По серьёзности:</b>\n{severities}",
  stats_status: "\n📌 <b>По статусу:</b>\n{statuses}",
  edit_prompt: "Отправьте обновлённое описание для отчёта <code>{id}</code>:",
  edit_no_recent: "У вас нет недавних отчётов для редактирования.",
  edit_window_expired: "Окно редактирования (5 мин) для отчёта {id} истекло.",
  edit_updated: "✅ Описание отчёта <code>{id}</code> обновлено!",
  edit_sent_new_desc: "Пожалуйста, отправьте новое описание текстом:",
  reply_forwarded: "✅ Ответ успешно переслан пользователю.",
  reply_failed: "❌ Не удалось переслать ответ. Возможно, пользователь заблокировал бота.",
  search_no_results: "Отчёты по вашему запросу не найдены.",
  search_results: "<b>Результаты поиска ({count}):</b>\n\n",
  dev_reply_header: "🧑‍💻 <b>Ответ разработчика</b>\n\n",
};

const packs: Record<string, LangPack> = { en, ar, ru };

const FALLBACK_LANG = "en";

function resolveLang(ctxLang: string | undefined): string {
  if (!ctxLang) return FALLBACK_LANG;
  const code = ctxLang.split("-")[0].toLowerCase();
  if (packs[code]) return code;
  return FALLBACK_LANG;
}

export function t(key: TranslationKey, lang: string, vars?: Record<string, string | number>): string {
  const pack = packs[lang] || packs[FALLBACK_LANG];
  let msg = pack[key] || packs[FALLBACK_LANG][key] || `{${key}}`;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      msg = msg.replace(`{${k}}`, String(v));
    }
  }
  return msg;
}

export function detectLanguage(ctx: { from?: { language_code?: string } }): string {
  return resolveLang(ctx.from?.language_code);
}
