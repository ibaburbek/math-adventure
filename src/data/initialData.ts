/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Level, Character, ShopItem, StudentProgress, TeacherSettings } from '../types/game';

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'alen',
    avatarId: 'alen',
    type: 'hero',
    name: { kk: 'Әлен батыр', ru: 'Ален Следопыт' },
    description: { 
      kk: 'Батыл жас саяхатшы. Орман соқпақтарын жатқа біледі және есептерді тез шешеді.', 
      ru: 'Смелый юный следопыт. Знает все лесные тропы и быстро решает арифметические задачи.' 
    },
    cost: 0,
    unlockedByDefault: true,
    themeColor: '#10B981', // Emerald
    accentColor: '#F59E0B'
  },
  {
    id: 'ayla',
    avatarId: 'ayla',
    type: 'hero',
    name: { kk: 'Айла сиқыршы', ru: 'Айла Чародейка' },
    description: { 
      kk: 'Сиқыр мен геометрияны меңгерген ақылды қыз. Жұлдызды таяқшасымен есептерді шешеді.', 
      ru: 'Мудрая волшебница, владеющая магией чисел и геометрии. Её звёздный посох освещает путь.' 
    },
    cost: 0,
    unlockedByDefault: true,
    themeColor: '#8B5CF6', // Purple
    accentColor: '#EC4899'
  },
  {
    id: 'barshyn',
    avatarId: 'barshyn',
    type: 'animal',
    name: { kk: 'Баршын барыс', ru: 'Барс Баршын' },
    description: { 
      kk: 'Алатау шыңдарынан келген ақ барыс. Зерек, шапшаң және логикасы өте мықты.', 
      ru: 'Благородный снежный барс с горных вершин. Ловок, сообразителен и полон решимости.' 
    },
    cost: 0,
    unlockedByDefault: true,
    themeColor: '#06B6D4', // Cyan
    accentColor: '#3B82F6'
  },
  {
    id: 'tulki',
    avatarId: 'tulki',
    type: 'animal',
    name: { kk: 'Түлкібай', ru: 'Лисичка Плутовка' },
    description: { 
      kk: 'Қу әрі тапқыр орман түлкісі. Кез келген қиын жұмбақтың кілтін оңай табады.', 
      ru: 'Рыжая лесная лисичка. Невероятно смекалистая, с лёгкостью разгадывает хитрые загадки.' 
    },
    cost: 0,
    unlockedByDefault: true,
    themeColor: '#F97316', // Orange
    accentColor: '#EAB308'
  },
  {
    id: 'samruk',
    avatarId: 'samruk',
    type: 'creature',
    name: { kk: 'Самұрық құс', ru: 'Птица Самрук' },
    description: { 
      kk: 'Бәйтерек басындағы аңызға айналған алтын қауырсынды қасиетті құс.', 
      ru: 'Легендарная златокрылая птица из древних преданий, символ мудрости и победы.' 
    },
    cost: 100,
    unlockedByDefault: false,
    themeColor: '#EAB308', // Gold
    accentColor: '#EF4444'
  },
  {
    id: 'tulpar',
    avatarId: 'tulpar',
    type: 'creature',
    name: { kk: 'Қанатты Тұлпар', ru: 'Крылатый Тулпар' },
    description: { 
      kk: 'Жүйрік қанатты пырақ. Ойы ұшқыр, есептерді найзағайдай жылдам шешуге шабыттандырады.', 
      ru: 'Величественный крылатый пегас с золотыми копытами. Быстрее ветра и острее молнии.' 
    },
    cost: 150,
    unlockedByDefault: false,
    themeColor: '#3B82F6', // Blue
    accentColor: '#6366F1'
  },
  {
    id: 'ayu',
    avatarId: 'ayu',
    type: 'animal',
    name: { kk: 'Аюхан қорғаушы', ru: 'Медведь Аюхан' },
    description: { 
      kk: 'Орманның мейірімді алып қорғаушысы. Сабырлы әрі табанды.', 
      ru: 'Добрый лесной великан-хранитель. Символизирует стойкость, доброту и силу знаний.' 
    },
    cost: 200,
    unlockedByDefault: false,
    themeColor: '#78350F', // Warm brown
    accentColor: '#10B981'
  },
  {
    id: 'aydahar',
    avatarId: 'aydahar',
    type: 'creature',
    name: { kk: 'Жасыл Айдаһар', ru: 'Изумрудный Дракон' },
    description: { 
      kk: 'Сиқырлы орман үңгірін күзететін достық пейілді кішкентай ақылды айдаһар.', 
      ru: 'Дружелюбный лесной дракончик с изумрудной чешуёй, хранитель древних тайн чисел.' 
    },
    cost: 300,
    unlockedByDefault: false,
    themeColor: '#059669', // Emerald dark
    accentColor: '#F59E0B'
  }
];

export const INITIAL_SHOP_ITEMS: ShopItem[] = [
  // Hats
  {
    id: 'hat_wizard',
    category: 'hat',
    name: { kk: 'Сиқыршы қалпағы', ru: 'Шляпа архимага' },
    cost: 40,
    iconName: 'Sparkles',
    visualTag: 'wizard',
    description: { kk: 'Күлгін жұлдызды сүйір сиқырлы қалпақ.', ru: 'Фиолетовая шляпа со сверкающими звёздами.' }
  },
  {
    id: 'hat_crown',
    category: 'hat',
    name: { kk: 'Орман тәжі', ru: 'Лесной венец' },
    cost: 60,
    iconName: 'Crown',
    visualTag: 'crown',
    description: { kk: 'Алтын жапырақтардан өрілген корольдік тәж.', ru: 'Королевская корона, сплетённая из золотых листьев.' }
  },
  {
    id: 'hat_explorer',
    category: 'hat',
    name: { kk: 'Саяхатшы шлемі', ru: 'Шлем первооткрывателя' },
    cost: 30,
    iconName: 'Compass',
    visualTag: 'explorer',
    description: { kk: 'Қауырсын тағылған жеңіл саяхатшы бас киімі.', ru: 'Удобная шляпа следопыта с ярким пером.' }
  },
  {
    id: 'hat_flower',
    category: 'hat',
    name: { kk: 'Гүлді шеңбер', ru: 'Цветочный венок' },
    cost: 25,
    iconName: 'Flower',
    visualTag: 'flower',
    description: { kk: 'Сиқырлы көктемгі гүлдерден жасалған гүлдесте.', ru: 'Венок из ароматных волшебных лесных цветов.' }
  },

  // Clothing
  {
    id: 'cloth_cloak_green',
    category: 'clothing',
    name: { kk: 'Эльф шапаны', ru: 'Плащ лесного эльфа' },
    cost: 50,
    iconName: 'Shield',
    visualTag: 'cloak_green',
    description: { kk: 'Зүбәржат түсті жапырақ өрнекті сауыт-шапан.', ru: 'Изумрудный плащ с золотой фибулой.' }
  },
  {
    id: 'cloth_robe_star',
    category: 'clothing',
    name: { kk: 'Жұлдызды шапан', ru: 'Звёздная мантия' },
    cost: 80,
    iconName: 'Shirt',
    visualTag: 'robe_star',
    description: { kk: 'Түнгі аспандай күлгін, жұлдыздармен көмкерілген мантия.', ru: 'Мантия цвета полночного неба с сияющими звёздами.' }
  },
  {
    id: 'cloth_tunic_gold',
    category: 'clothing',
    name: { kk: 'Алтын кеудеше', ru: 'Золотая туника' },
    cost: 70,
    iconName: 'Award',
    visualTag: 'tunic_gold',
    description: { kk: 'Шампиньондар патшалығының алтын кестелі киімі.', ru: 'Роскошная туника с золотой окантовкой.' }
  },

  // Accessories
  {
    id: 'acc_magic_wand',
    category: 'accessory',
    name: { kk: 'Кристалл таяқша', ru: 'Хрустальный посох' },
    cost: 45,
    iconName: 'Wand2',
    visualTag: 'magic_wand',
    description: { kk: 'Математикалық энергия жинақтайтын жарқырауық таяқша.', ru: 'Посох с кристаллом, усиливающим точность вычислений.' }
  },
  {
    id: 'acc_golden_ruler',
    category: 'accessory',
    name: { kk: 'Алтын сызғыш', ru: 'Золотая линейка геометра' },
    cost: 35,
    iconName: 'Ruler',
    visualTag: 'golden_ruler',
    description: { kk: 'Кез келген кесінді мен бұрышты дәл өлшейтін қасиетті құрал.', ru: 'Инструмент для безупречного измерения любых фигур.' }
  },
  {
    id: 'acc_star_glasses',
    category: 'accessory',
    name: { kk: 'Сиқырлы көзілдірік', ru: 'Очки прозрения' },
    cost: 50,
    iconName: 'Glasses',
    visualTag: 'star_glasses',
    description: { kk: 'Жұмбақтардың жасырын құпиясын көрсететін көзілдірік.', ru: 'Очки, помогающие находить неочевидные закономерности.' }
  },
  {
    id: 'acc_lantern',
    category: 'accessory',
    name: { kk: 'Ақыл шырағы', ru: 'Фонарь мудрости' },
    cost: 40,
    iconName: 'Lamp',
    visualTag: 'lantern',
    description: { kk: 'Қараңғы үңгірлерде жол көрсететін сиқырлы шам.', ru: 'Освещает путь сквозь самые таинственные пещеры.' }
  }
];

export const INITIAL_LEVELS: Level[] = [
  // Level 1: Arithmetic Adventure
  {
    id: 'lvl_1_arithmetic',
    order: 1,
    title: { kk: '1-деңгей: Арифметика шытырманы', ru: 'Уровень 1: Арифметика приключений' },
    description: { 
      kk: 'Орман соқпағында қосу мен азайту амалдарын орындап, сиқырлы кілттерді жинаңыз.', 
      ru: 'Пройдите по лесной тропинке, решая базовые примеры на сложение и вычитание.' 
    },
    isPublished: true,
    worldTheme: 'forest',
    rewardChestBonus: 50,
    rewardItem: 'hat_explorer',
    questions: [
      {
        id: 'q_1_1',
        levelId: 'lvl_1_arithmetic',
        order: 1,
        text: { kk: 'Орман саяхатшысы 14 жаңғақ тапты, ал тиін оған тағы 18 жаңғақ сыйлады. Барлығы неше жаңғақ болды?', ru: 'Путник собрал 14 орехов, а белочка подарила ему ещё 18 орехов. Сколько всего орехов стало?' },
        difficulty: 'easy',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '32',
        explanation: { kk: '14 + 18 = 32 жаңғақ.', ru: '14 + 18 = 32 ореха.' }
      },
      {
        id: 'q_1_2',
        levelId: 'lvl_1_arithmetic',
        order: 2,
        text: { kk: 'Өрнектің мәнін табыңыз: 45 - 19 = ?', ru: 'Вычислите значение выражения: 45 - 19 = ?' },
        difficulty: 'easy',
        answerMode: 'multiple_choice',
        checkingMode: 'auto',
        options: ['24', '26', '28', '36'],
        correctAnswer: '26',
        explanation: { kk: '45 - 19 = 45 - 20 + 1 = 26.', ru: '45 - 19 = 26.' }
      },
      {
        id: 'q_1_3',
        levelId: 'lvl_1_arithmetic',
        order: 3,
        text: { kk: 'Белгісіз санды табыңыз: 60 + ___ = 125', ru: 'Найдите неизвестное число: 60 + ___ = 125' },
        difficulty: 'easy',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '65',
        explanation: { kk: '125 - 60 = 65.', ru: '125 - 60 = 65.' }
      },
      {
        id: 'q_1_4',
        levelId: 'lvl_1_arithmetic',
        order: 4,
        text: { kk: 'Көбейту амалын орындаңыз: 7 × 8 = ?', ru: 'Выполните умножение: 7 × 8 = ?' },
        difficulty: 'medium',
        answerMode: 'multiple_choice',
        checkingMode: 'auto',
        options: ['48', '54', '56', '64'],
        correctAnswer: '56',
        explanation: { kk: '7 × 8 = 56.', ru: '7 × 8 = 56.' }
      },
      {
        id: 'q_1_5',
        levelId: 'lvl_1_arithmetic',
        order: 5,
        text: { kk: 'Бөлу амалы: 72 алманы 9 себетке тең бөліп салды. Әр себетте неше алма бар?', ru: '72 яблока разложили поровну в 9 корзинок. Сколько яблок оказалось в каждой корзине?' },
        difficulty: 'medium',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '8',
        explanation: { kk: '72 ÷ 9 = 8 алма.', ru: '72 ÷ 9 = 8 яблок.' }
      },
      {
        id: 'q_1_6',
        levelId: 'lvl_1_arithmetic',
        order: 6,
        text: { kk: 'Амалдардың дұрыс ретін сақтап есептеңіз: 20 + 5 × 6 - 15 = ?', ru: 'Соблюдая порядок действий, решите: 20 + 5 × 6 - 15 = ?' },
        difficulty: 'medium',
        answerMode: 'multiple_choice',
        checkingMode: 'auto',
        options: ['35', '45', '135', '50'],
        correctAnswer: '35',
        explanation: { kk: 'Алдымен көбейту: 5 × 6 = 30. Сосын: 20 + 30 - 15 = 35.', ru: 'Сначала умножение: 5 × 6 = 30. Затем 20 + 30 - 15 = 35.' }
      },
      {
        id: 'q_1_7',
        levelId: 'lvl_1_arithmetic',
        order: 7,
        text: { kk: 'Өз сөзіңізбен түсіндіріңіз: Неліктен кез келген санды нөлге көбейткенде нөл шығады? Мысал келтіріңіз.', ru: 'Объясните своими словами: почему при умножении любого числа на ноль получается ноль? Приведите пример.' },
        difficulty: 'hard',
        answerMode: 'typed',
        checkingMode: 'manual', // Teacher review queue demonstration!
        correctAnswer: 'Нөл топ немесе бос жиын / умножение на 0 дает 0',
        explanation: { kk: 'Мұғалім тексеруі: Оқушы көбейтудің мәні бірдей қосылғыштарды қосу екенін және 0 рет қосу ешнәрсе бермейтінін түсіндіруі қажет.', ru: 'Проверка учителем: Ученик должен логически обосновать, что взять предмет 0 раз означает пустоту.' }
      },
      {
        id: 'q_1_8',
        levelId: 'lvl_1_arithmetic',
        order: 8,
        text: { kk: 'Сиқырлы қақпа тапсырмасы: 120 санын 4-ке бөліп, шыққан нәтижеге 25-ті қосып, 10-ды көбейтіңіз. Соңғы сан қандай?', ru: 'Испытание у ворот: число 120 разделите на 4, к результату прибавьте 25 и умножьте всё на 10. Какое число получилось?' },
        difficulty: 'hard',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '550',
        explanation: { kk: '120 ÷ 4 = 30; 30 + 25 = 55; 55 × 10 = 550.', ru: '120 ÷ 4 = 30; 30 + 25 = 55; 55 × 10 = 550.' }
      }
    ]
  },

  // Level 2: Forest Fractions
  {
    id: 'lvl_2_fractions',
    order: 2,
    title: { kk: '2-деңгей: Орман бөлшектері', ru: 'Уровень 2: Лесные дроби' },
    description: { 
      kk: 'Сиқырлы пирогтар, бөліктер және жартылар әлеміне саяхат жасаңыз.', 
      ru: 'Изучайте части целого, доли пирогов и сравнение дробей на лесной поляне.' 
    },
    isPublished: true,
    worldTheme: 'crystal_caves',
    rewardChestBonus: 60,
    rewardItem: 'hat_flower',
    questions: [
      {
        id: 'q_2_1',
        levelId: 'lvl_2_fractions',
        order: 1,
        text: { kk: 'Орман пирогы 8 тең тілімге бөлінді. Егер достар оның 3 тілімін жесе, пирогтың қандай бөлігі қалды?', ru: 'Лесной пирог разрезали на 8 равных кусков. Друзья съели 3 куска. Какая дробь осталась от пирога?' },
        difficulty: 'easy',
        answerMode: 'multiple_choice',
        checkingMode: 'auto',
        options: ['3/8', '5/8', '1/2', '5/5'],
        correctAnswer: '5/8',
        explanation: { kk: '8/8 - 3/8 = 5/8 бөлігі қалды.', ru: '8/8 - 3/8 = 5/8 пирога осталось.' }
      },
      {
        id: 'q_2_2',
        levelId: 'lvl_2_fractions',
        order: 2,
        text: { kk: 'Қай бөлшек үлкенірек: 3/4 пе, әлде 2/4 пе?', ru: 'Какая дробь больше: 3/4 или 2/4?' },
        difficulty: 'easy',
        answerMode: 'multiple_choice',
        checkingMode: 'auto',
        options: ['3/4', '2/4', 'Олар тең', 'Анықтау мүмкін емес'],
        correctAnswer: '3/4',
        explanation: { kk: 'Бөлімдері бірдей бөлшектердің алымы үлкені үлкен болады: 3/4 > 2/4.', ru: 'При одинаковых знаменателях больше та дробь, у которой числитель больше: 3/4 > 2/4.' }
      },
      {
        id: 'q_2_3',
        levelId: 'lvl_2_fractions',
        order: 3,
        text: { kk: 'Есептеңіз: 2/7 + 3/7 = ? (Жауапты бөлшек түрінде жазыңыз, мысалы: 5/7)', ru: 'Сложите дроби: 2/7 + 3/7 = ? (Запишите ответ в виде дроби, например: 5/7)' },
        difficulty: 'easy',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '5/7',
        explanation: { kk: '2/7 + 3/7 = (2+3)/7 = 5/7.', ru: '2/7 + 3/7 = 5/7.' }
      },
      {
        id: 'q_2_4',
        levelId: 'lvl_2_fractions',
        order: 4,
        text: { kk: 'Қай бөлшек 1 бүтінге (1-ге) тең?', ru: 'Какая из следующих дробей равна единице (1)?' },
        difficulty: 'medium',
        answerMode: 'multiple_choice',
        checkingMode: 'auto',
        options: ['6/5', '7/7', '3/4', '1/8'],
        correctAnswer: '7/7',
        explanation: { kk: 'Алымы мен бөлімі бірдей бөлшек 1-ге тең: 7/7 = 1.', ru: 'Дробь, у которой числитель равен знаменателю, равна 1: 7/7 = 1.' }
      },
      {
        id: 'q_2_5',
        levelId: 'lvl_2_fractions',
        order: 5,
        text: { kk: 'Себеттегі 24 алманың жартысы (1/2 бөлігі) неше алма болады?', ru: 'Сколько яблок составляет половина (1/2) от корзины, в которой 24 яблока?' },
        difficulty: 'medium',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '12',
        explanation: { kk: '24 ÷ 2 = 12 алма.', ru: '24 ÷ 2 = 12 яблок.' }
      },
      {
        id: 'q_2_6',
        levelId: 'lvl_2_fractions',
        order: 6,
        text: { kk: 'Есептеңіз: 1 - 2/5 = ? (Жауапты алымы/бөлімі түрінде жазыңыз)', ru: 'Вычислите: 1 - 2/5 = ? (Запишите ответ через косую черту)' },
        difficulty: 'medium',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '3/5',
        explanation: { kk: '1 = 5/5; 5/5 - 2/5 = 3/5.', ru: '1 = 5/5; 5/5 - 2/5 = 3/5.' }
      },
      {
        id: 'q_2_7',
        levelId: 'lvl_2_fractions',
        order: 7,
        text: { kk: 'Шығармашылық сұрақ: Неге 1/2 бөлік 1/4 бөліктен үлкен екенін өмірден мысал келтіріп түсіндіріңіз.', ru: 'Творческий вопрос: объясните на жизненном примере, почему 1/2 часть пиццы больше, чем 1/4 часть.' },
        difficulty: 'hard',
        answerMode: 'typed',
        checkingMode: 'manual', // Teacher review
        correctAnswer: 'Жартысы 4-ке бөлгеннен үлкен',
        explanation: { kk: 'Мұғалім қарауы: Оқушы пиццаны 2 адамға бөлгендегі тілім 4 адамға бөлгеннен екі есе үлкен болатынын түсіндіруі қажет.', ru: 'Проверка учителем: Ученик должен пояснить деление предмета на 2 части по сравнению с 4 частями.' }
      },
      {
        id: 'q_2_8',
        levelId: 'lvl_2_fractions',
        order: 8,
        text: { kk: 'Сиқырлы ағашта 36 сиқырлы жапырақ бар. Оның 1/3 бөлігі алтын, 1/4 бөлігі күміс, ал қалғаны изумруд түсті. Изумруд жапырақтар саны нешеу?', ru: 'На дереве 36 листьев: 1/3 из них золотые, 1/4 — серебряные, а остальные — изумрудные. Сколько изумрудных листьев?' },
        difficulty: 'hard',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '15',
        explanation: { kk: 'Алтын: 36 ÷ 3 = 12. Күміс: 36 ÷ 4 = 9. Қосындысы: 12 + 9 = 21. Изумруд: 36 - 21 = 15.', ru: 'Золотые: 36 ÷ 3 = 12. Серебряные: 36 ÷ 4 = 9. Сумма: 21. Изумрудные: 36 - 21 = 15.' }
      }
    ]
  },

  // Level 3: Mystery Equations
  {
    id: 'lvl_3_equations',
    order: 3,
    title: { kk: '3-деңгей: Сиқырлы теңдеулер', ru: 'Уровень 3: Таинственные уравнения' },
    description: { 
      kk: 'Таразыны теңестіріп, белгісіз сиқырлы x айнымалыларын табыңыз.', 
      ru: 'Уравновесьте волшебные весы и найдите скрытые значения переменной x.' 
    },
    isPublished: true,
    worldTheme: 'desert',
    rewardChestBonus: 75,
    rewardItem: 'acc_magic_wand',
    questions: [
      {
        id: 'q_3_1',
        levelId: 'lvl_3_equations',
        order: 1,
        text: { kk: 'Теңдеуді шешіңіз: x + 15 = 42. x мәні нешеге тең?', ru: 'Решите уравнение: x + 15 = 42. Чему равен x?' },
        difficulty: 'easy',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '27',
        explanation: { kk: 'x = 42 - 15 = 27.', ru: 'x = 42 - 15 = 27.' }
      },
      {
        id: 'q_3_2',
        levelId: 'lvl_3_equations',
        order: 2,
        text: { kk: 'Теңдеуді шешіңіз: 3 × y = 54. y нешеге тең?', ru: 'Решите уравнение: 3 × y = 54. Чему равен y?' },
        difficulty: 'easy',
        answerMode: 'multiple_choice',
        checkingMode: 'auto',
        options: ['16', '18', '21', '24'],
        correctAnswer: '18',
        explanation: { kk: 'y = 54 ÷ 3 = 18.', ru: 'y = 54 ÷ 3 = 18.' }
      },
      {
        id: 'q_3_3',
        levelId: 'lvl_3_equations',
        order: 3,
        text: { kk: 'Белгісіз азайғышты табыңыз: z - 28 = 45. z мәні қандай?', ru: 'Найдите неизвестное уменьшаемое: z - 28 = 45. Чему равен z?' },
        difficulty: 'medium',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '73',
        explanation: { kk: 'z = 45 + 28 = 73.', ru: 'z = 45 + 28 = 73.' }
      },
      {
        id: 'q_3_4',
        levelId: 'lvl_3_equations',
        order: 4,
        text: { kk: 'Таразы есебі: Екі бірдей сиқырлы тас пен 6 кг салмақ оң жақтағы 20 кг тасқа тең. Бір сиқырлы тастың салмағы неше кг?', ru: 'Два одинаковых кристалла и гиря 6 кг уравновешены гирей 20 кг. Сколько весит один кристалл?' },
        difficulty: 'medium',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '7',
        explanation: { kk: '2x + 6 = 20 -> 2x = 14 -> x = 7 кг.', ru: '2x + 6 = 20 -> 2x = 14 -> x = 7 кг.' }
      },
      {
        id: 'q_3_5',
        levelId: 'lvl_3_equations',
        order: 5,
        text: { kk: 'Теңдеуді шешіңіз: (x + 8) × 4 = 48. x мәні қандай?', ru: 'Решите уравнение: (x + 8) × 4 = 48. Чему равен x?' },
        difficulty: 'medium',
        answerMode: 'multiple_choice',
        checkingMode: 'auto',
        options: ['4', '6', '8', '12'],
        correctAnswer: '4',
        explanation: { kk: 'x + 8 = 48 ÷ 4 = 12; x = 12 - 8 = 4.', ru: 'x + 8 = 48 / 4 = 12; x = 12 - 8 = 4.' }
      },
      {
        id: 'q_3_6',
        levelId: 'lvl_3_equations',
        order: 6,
        text: { kk: '5x - 17 = 33 теңдеуіндегі x мәні неше?', ru: 'В уравнении 5x - 17 = 33 найдите значение x.' },
        difficulty: 'medium',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '10',
        explanation: { kk: '5x = 33 + 17 = 50 -> x = 10.', ru: '5x = 50 -> x = 10.' }
      },
      {
        id: 'q_3_7',
        levelId: 'lvl_3_equations',
        order: 7,
        text: { kk: 'Өз есебіңізді құрастырыңыз: Жауабы x = 5 болатын кез келген қосу не көбейту теңдеуін жазып, оны шешу жолын көрсетіңіз.', ru: 'Составьте собственное уравнение, решением которого является x = 5, и запишите шаги его решения.' },
        difficulty: 'hard',
        answerMode: 'typed',
        checkingMode: 'manual', // Teacher review
        correctAnswer: 'x = 5 болатын теңдеу',
        explanation: { kk: 'Мұғалім тексеруі: Оқушы құрастырған теңдеу дұрыс болуы және шынымен x=5 түбірін беруі тиіс.', ru: 'Проверка учителем: Уравнение ученика должно быть математически корректным с корнем x = 5.' }
      },
      {
        id: 'q_3_8',
        levelId: 'lvl_3_equations',
        order: 8,
        text: { kk: 'Жүйелік жұмбақ: Алма + Алма = 10. Алма + Банан = 9. Банан - Құлпынай = 2. Құлпынай нешеге тең?', ru: 'Загадка с фруктами: Яблоко + Яблоко = 10. Яблоко + Банан = 9. Банан - Клубника = 2. Чему равна Клубника?' },
        difficulty: 'hard',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '2',
        explanation: { kk: 'Алма = 5. Банан = 9 - 5 = 4. Құлпынай = 4 - 2 = 2.', ru: 'Яблоко = 5. Банан = 9 - 5 = 4. Клубника = 4 - 2 = 2.' }
      }
    ]
  },

  // Level 4: Geometric Glade
  {
    id: 'lvl_4_geometry',
    order: 4,
    title: { kk: '4-деңгей: Геометриялық алаңқай', ru: 'Уровень 4: Геометрическая поляна' },
    description: { 
      kk: 'Пішіндер, периметрлер мен аудандардың құпиясын ашыңыз.', 
      ru: 'Изучайте свойства геометрических фигур, вычисляйте периметры и площади.' 
    },
    isPublished: true,
    worldTheme: 'ice_kingdom',
    rewardChestBonus: 85,
    rewardItem: 'acc_golden_ruler',
    questions: [
      {
        id: 'q_4_1',
        levelId: 'lvl_4_geometry',
        order: 1,
        text: { kk: 'Қабырғасы 6 см болатын шаршының периметрі нешеге тең?', ru: 'Чему равен периметр квадрата со стороной 6 см?' },
        difficulty: 'easy',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '24',
        explanation: { kk: 'P = 4 × a = 4 × 6 = 24 см.', ru: 'P = 4 × a = 4 × 6 = 24 см.' }
      },
      {
        id: 'q_4_2',
        levelId: 'lvl_4_geometry',
        order: 2,
        text: { kk: 'Үшбұрыштың барлық ішкі бұрыштарының қосындысы неше градусқа тең?', ru: 'Чему всегда равна сумма углов любого треугольника?' },
        difficulty: 'easy',
        answerMode: 'multiple_choice',
        checkingMode: 'auto',
        options: ['90°', '180°', '270°', '360°'],
        correctAnswer: '180°',
        explanation: { kk: 'Кез келген үшбұрыштың ішкі бұрыштарының қосындысы 180°-қа тең.', ru: 'Сумма внутренних углов любого треугольника всегда равна 180°.' }
      },
      {
        id: 'q_4_3',
        levelId: 'lvl_4_geometry',
        order: 3,
        text: { kk: 'Ұзындығы 8 метр, ал ені 5 метр болатын сиқырлы бақтың ауданы (S) неше квадрат метр?', ru: 'Чему равна площадь сада прямоугольной формы длиной 8 м и шириной 5 м?' },
        difficulty: 'medium',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '40',
        explanation: { kk: 'S = a × b = 8 × 5 = 40 кв. метр.', ru: 'S = 8 × 5 = 40 кв. метров.' }
      },
      {
        id: 'q_4_4',
        levelId: 'lvl_4_geometry',
        order: 4,
        text: { kk: 'Тік бұрыш неше градусты құрайды?', ru: 'Сколько градусов содержит прямой угол?' },
        difficulty: 'easy',
        answerMode: 'multiple_choice',
        checkingMode: 'auto',
        options: ['45°', '60°', '90°', '120°'],
        correctAnswer: '90°',
        explanation: { kk: 'Тік бұрыш дәл 90°-қа тең болады.', ru: 'Прямой угол всегда равен 90°.' }
      },
      {
        id: 'q_4_5',
        levelId: 'lvl_4_geometry',
        order: 5,
        text: { kk: 'Тік төртбұрыштың периметрі 30 см. Егер оның ұзындығы 9 см болса, ені неше см?', ru: 'Периметр прямоугольника 30 см. Если его длина 9 см, найдите ширину.' },
        difficulty: 'medium',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '6',
        explanation: { kk: 'Жарты периметр: 30 ÷ 2 = 15 см. Ені: 15 - 9 = 6 см.', ru: 'Полупериметр: 30 / 2 = 15 см. Ширина: 15 - 9 = 6 см.' }
      },
      {
        id: 'q_4_6',
        levelId: 'lvl_4_geometry',
        order: 6,
        text: { kk: 'Алтыбұрыштың (дұрыс алтыбұрыш) неше төбесі және қабырғасы бар?', ru: 'Сколько вершин и сторон у правильного шестиугольника?' },
        difficulty: 'easy',
        answerMode: 'multiple_choice',
        checkingMode: 'auto',
        options: ['5', '6', '7', '8'],
        correctAnswer: '6',
        explanation: { kk: 'Алтыбұрыштың 6 қабырғасы және 6 төбесі бар.', ru: 'У шестиугольника ровно 6 сторон и 6 вершин.' }
      },
      {
        id: 'q_4_7',
        levelId: 'lvl_4_geometry',
        order: 7,
        text: { kk: 'Сұрақ-ойлану: Периметр мен ауданның айырмашылығын түсіндіріңіз. Мысалы, қоршау мен гүлзардың қайсысы периметрге, қайсысы ауданға жатады?', ru: 'Вопрос на рассуждение: объясните разницу между периметром и площадью на примере забора и газона.' },
        difficulty: 'hard',
        answerMode: 'typed',
        checkingMode: 'manual', // Teacher review
        correctAnswer: 'Периметр ұзындығы, аудан беті',
        explanation: { kk: 'Мұғалім тексеруі: Қоршау — шекара (периметр), ал гүлзардың ішкі беті — аудан екенін түсіндіру қажет.', ru: 'Проверка учителем: Забор окружает границу (периметр), а травяное покрытие внутри — это площадь.' }
      },
      {
        id: 'q_4_8',
        levelId: 'lvl_4_geometry',
        order: 8,
        text: { kk: 'Күрделі фигура: 3 см қабырғалы үш шаршыны бір қатарға қойғанда пайда болатын тік төртбұрыштың периметрі қандай?', ru: 'Три квадрата со стороной 3 см прижали в ряд. Найдите периметр получившегося прямоугольника.' },
        difficulty: 'hard',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '24',
        explanation: { kk: 'Тік төртбұрыштың ұзындығы = 3 × 3 = 9 см, ені = 3 см. P = (9 + 3) × 2 = 24 см.', ru: 'Длина = 9 см, ширина = 3 см. P = 2 × (9 + 3) = 24 см.' }
      }
    ]
  },

  // Level 5: Forest Logic & Patterns
  {
    id: 'lvl_5_logic',
    order: 5,
    title: { kk: '5-деңгей: Орман логикасы', ru: 'Уровень 5: Логика мудрого леса' },
    description: { 
      kk: 'Ең жоғарғы саты: сандық қатарлар, жұмбақтар және кеңістіктік ойлау.', 
      ru: 'Высшая ступень: закономерности чисел, логические парадоксы и хитрые головоломки.' 
    },
    isPublished: true,
    worldTheme: 'sky_islands',
    rewardChestBonus: 100,
    rewardItem: 'cloth_robe_star',
    questions: [
      {
        id: 'q_5_1',
        levelId: 'lvl_5_logic',
        order: 1,
        text: { kk: 'Сандық қатардың келесі мүшесін табыңыз: 2, 4, 8, 16, 32, ___ ?', ru: 'Найдите следующее число в ряду: 2, 4, 8, 16, 32, ___ ?' },
        difficulty: 'easy',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '64',
        explanation: { kk: 'Әрбір сан алдыңғысын 2-ге көбейтуден шығады: 32 × 2 = 64.', ru: 'Каждое последующее число удваивается: 32 × 2 = 64.' }
      },
      {
        id: 'q_5_2',
        levelId: 'lvl_5_logic',
        order: 2,
        text: { kk: 'Фибоначчи заңдылығы: 1, 1, 2, 3, 5, 8, 13, ___ ?', ru: 'Ряд Фибоначчи: 1, 1, 2, 3, 5, 8, 13, ___ ?' },
        difficulty: 'medium',
        answerMode: 'multiple_choice',
        checkingMode: 'auto',
        options: ['18', '20', '21', '26'],
        correctAnswer: '21',
        explanation: { kk: 'Келесі сан алдыңғы екі санның қосындысы: 8 + 13 = 21.', ru: 'Каждое число равно сумме двух предыдущих: 8 + 13 = 21.' }
      },
      {
        id: 'q_5_3',
        levelId: 'lvl_5_logic',
        order: 3,
        text: { kk: 'Жұмбақ: Асан Үсеннен 3 жас үлкен. 5 жылдан кейін Асан Үсеннен неше жас үлкен болады?', ru: 'Загадка: Асан старше Усена на 3 года. На сколько лет Асан будет старше Усена через 5 лет?' },
        difficulty: 'medium',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '3',
        explanation: { kk: 'Жас айырмашылығы ешқашан өзгермейді, ол әрқашан 3 болып қалады.', ru: 'Разница в возрасте между людьми не меняется с годами: 3 года.' }
      },
      {
        id: 'q_5_4',
        levelId: 'lvl_5_logic',
        order: 4,
        text: { kk: 'Сиқырлы көлдегі тұңғиық гүлінің көлемі күн сайын 2 есе өседі. Егер көл 20 күнде гүлге толық толса, ол көлдің жартысын нешінші күні толтырды?', ru: 'Кувшинка удваивается в размере каждый день. За 20 дней она полностью закрыла пруд. За сколько дней она закрыла половину пруда?' },
        difficulty: 'hard',
        answerMode: 'multiple_choice',
        checkingMode: 'auto',
        options: ['10 күнде / 10 дней', '15 күнде / 15 дней', '19 күнде / 19 дней', '18 күнде / 18 дней'],
        correctAnswer: '19 күнде / 19 дней',
        explanation: { kk: '19-күні көлдің жартысы болды, ал келесі күні 2 есе көбейіп (20-күні) толық толды.', ru: 'На 19 день кувшинка закрыла половину, а удвоившись на 20-й — закрыла пруд целиком.' }
      },
      {
        id: 'q_5_5',
        levelId: 'lvl_5_logic',
        order: 5,
        text: { kk: 'Егер 5 мысық 5 минутта 5 тышқан ұстаса, 100 мысық 100 тышқанды неше минутта ұстайды?', ru: 'Если 5 кошек ловят 5 мышей за 5 минут, за сколько минут 100 кошек поймают 100 мышей?' },
        difficulty: 'hard',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '5',
        explanation: { kk: 'Әрбір мысық бір тышқанды 5 минутта ұстайды. Демек 100 мысық қатар қимылдап, барлығы бірдей 5 минутта ұстап алады.', ru: 'Каждая кошка ловит мышь за 5 минут. Значит, 100 кошек справятся за те же 5 минут.' }
      },
      {
        id: 'q_5_6',
        levelId: 'lvl_5_logic',
        order: 6,
        text: { kk: 'Логикалық реттілік: 3, 6, 12, 24, 48, ___ ? Соңғы сан қандай?', ru: 'Закономерность: 3, 6, 12, 24, 48, ___ ?' },
        difficulty: 'medium',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '96',
        explanation: { kk: '48 × 2 = 96.', ru: '48 × 2 = 96.' }
      },
      {
        id: 'q_5_7',
        levelId: 'lvl_5_logic',
        order: 7,
        text: { kk: 'Ойшылдың сыны: Сізге 3 литрлік және 5 литрлік екі сиқырлы құмыра берілген. Олардың көмегімен өзеннен дәл 4 литр суды қалай өлшеп алуға болады? Қадамдарын жазыңыз.', ru: 'Испытание мудреца: у вас есть два сосуда на 3 литра и 5 литров. Как с их помощью отмерить ровно 4 литра воды из ручья?' },
        difficulty: 'hard',
        answerMode: 'typed',
        checkingMode: 'manual', // Teacher review
        correctAnswer: '5л құйып, 3л толтыру немесе керісінше',
        explanation: { kk: 'Мұғалім тексеруі: 5л құмыраны толтырып, одан 3л құмыраға құйсақ, 5л ішінде 2л қалады. 3л босатып, 2л оған құямыз. 5л қайта толтырып, 3л құмыраға тағы 1л құйсақ, 5л құмырада дәл 4л қалады.', ru: 'Проверка учителем: Описание классической переливашки: 5л - 3л = 2л, затем повтор до получения ровно 4л.' }
      },
      {
        id: 'q_5_8',
        levelId: 'lvl_5_logic',
        order: 8,
        text: { kk: 'Соңғы жеңіс есебі: 1-ден 100-ге дейінгі барлық натурал сандардың қосындысы нешеге тең? (Гаусс әдісін еске түсіріңіз)', ru: 'Финальный аккорд: Чему равна сумма всех натуральных чисел от 1 до 100? (Вспомните приём юного Гаусса)' },
        difficulty: 'hard',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '5050',
        explanation: { kk: '(1 + 100) × 50 = 101 × 50 = 5050.', ru: '(1 + 100) × 50 = 101 × 50 = 5050.' }
      }
    ]
  },

  // Level 6: Dragon Valley
  {
    id: 'lvl_6_dragons',
    order: 6,
    title: { kk: '6-деңгей: Айдаһар алқабы', ru: 'Уровень 6: Долина драконов' },
    description: { 
      kk: 'Жанартаулар арасындағы отты теңдеулер мен мәтіндік есептер.', 
      ru: 'Огненные уравнения и многошаговые текстовые задачи среди скал.' 
    },
    isPublished: true,
    worldTheme: 'dragon_valley',
    rewardChestBonus: 120,
    rewardItem: 'cloth_cloak_green',
    questions: [
      {
        id: 'q_6_1',
        levelId: 'lvl_6_dragons',
        order: 1,
        text: { kk: 'Жанартаудың 3 үңгірінде 45 айдаһар ұйықтап жатыр. Әр үңгірдегі айдаһар саны бірдей. Бір үңгірде нешеу?', ru: 'В 3 пещерах вулкана спят 45 драконов (поровну в каждой). Сколько драконов в одной пещере?' },
        difficulty: 'easy',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '15',
        explanation: { kk: '45 ÷ 3 = 15.', ru: '45 / 3 = 15.' }
      },
      {
        id: 'q_6_2',
        levelId: 'lvl_6_dragons',
        order: 2,
        text: { kk: 'Айдаһар сағатына 80 км жылдамдықпен 3 сағат ұшты. Ол барлығы қанша шақырым қашықтықты бағындырды?', ru: 'Дракон летел 3 часа со скоростью 80 км/ч. Какое расстояние он преодолел?' },
        difficulty: 'medium',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '240',
        explanation: { kk: 'S = v × t = 80 × 3 = 240 км.', ru: 'S = 80 * 3 = 240 км.' }
      },
      {
        id: 'q_6_3',
        levelId: 'lvl_6_dragons',
        order: 3,
        text: { kk: 'Айдаһар қазынасында 180 алтын монета бар. Ол оның 2/3 бөлігін жаңа қамал салуға бөлді. Қанша монета қалды?', ru: 'В сундуке 180 золотых монет. 2/3 потрачено на возведение башни. Сколько монет осталось?' },
        difficulty: 'medium',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '60',
        explanation: { kk: '180 ÷ 3 = 60 монета қалды (1/3 бөлігі).', ru: '180 * (1/3) = 60 монет осталось.' }
      },
      {
        id: 'q_6_4',
        levelId: 'lvl_6_dragons',
        order: 4,
        text: { kk: 'Теңдеуді шешіңіз: 4x + 25 = 105. x мәні неше?', ru: 'Решите уравнение: 4x + 25 = 105. Чему равен x?' },
        difficulty: 'medium',
        answerMode: 'multiple_choice',
        checkingMode: 'auto',
        options: ['15', '20', '25', '30'],
        correctAnswer: '20',
        explanation: { kk: '4x = 80 -> x = 20.', ru: '4x = 80 -> x = 20.' }
      },
      {
        id: 'q_6_5',
        levelId: 'lvl_6_dragons',
        order: 5,
        text: { kk: 'Айдаһардың ұясының пішіні тең қабырғалы үшбұрыш, периметрі 75 метр. Бір қабырғасының ұзындығы қандай?', ru: 'Гнездо дракона имеет форму равностороннего треугольника с периметром 75 метров. Чему равна одна сторона?' },
        difficulty: 'easy',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '25',
        explanation: { kk: '75 ÷ 3 = 25 метр.', ru: '75 / 3 = 25 метров.' }
      },
      {
        id: 'q_6_6',
        levelId: 'lvl_6_dragons',
        order: 6,
        text: { kk: 'Күрделі есеп: Айдаһар мен оның баласының салмағы бірге 600 кг. Айдаһар баласынан 500 кг ауыр. Баласының салмағы неше кг?', ru: 'Дракон и детёныш вместе весят 600 кг. Взрослый дракон тяжелее на 500 кг. Сколько весит детёныш?' },
        difficulty: 'hard',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '50',
        explanation: { kk: '(600 - 500) ÷ 2 = 100 ÷ 2 = 50 кг.', ru: '(600 - 500) / 2 = 50 кг.' }
      },
      {
        id: 'q_6_7',
        levelId: 'lvl_6_dragons',
        order: 7,
        text: { kk: 'Шығармашылық сынақ: Айдаһар отының температурасы туралы есеп құрастырып, оның шешу жолын жазыңыз.', ru: 'Творческое задание: придумайте математическую задачу про драконье пламя и запишите подробное решение.' },
        difficulty: 'hard',
        answerMode: 'typed',
        checkingMode: 'manual', // Teacher review
        correctAnswer: 'Оқушы құрастырған есеп',
        explanation: { kk: 'Мұғалім тексеруі: Оқушы құрастырған мәтін есебі мен шешу амалдары тексеріледі.', ru: 'Проверка учителем: Оценивается логика и правильность составленной учеником задачи.' }
      },
      {
        id: 'q_6_8',
        levelId: 'lvl_6_dragons',
        order: 8,
        text: { kk: 'Отты қамал сынағы: 25 санын 4-ке көбейтіп, одан 35-ті азайтып, шыққан санды 13-ке бөліңіз. Нәтиже қандай?', ru: 'Испытание башни: 25 умножьте на 4, отнимите 35 и разделите результат на 13. Какое число получилось?' },
        difficulty: 'hard',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '5',
        explanation: { kk: '(100 - 35) ÷ 13 = 65 ÷ 13 = 5.', ru: '(100 - 35) / 13 = 65 / 13 = 5.' }
      }
    ]
  },

  // Level 7: Ancient Temple
  {
    id: 'lvl_7_temple',
    order: 7,
    title: { kk: '7-деңгей: Көне ғибадатхана', ru: 'Уровень 7: Древний храм' },
    description: { 
      kk: 'Джунгли ішіндегі криптарифметика, ребустар және құпия сандар.', 
      ru: 'Криптарифметика, числовые ребусы и древние тайны чисел.' 
    },
    isPublished: true,
    worldTheme: 'ancient_temple',
    rewardChestBonus: 150,
    rewardItem: 'acc_star_glasses',
    questions: [
      {
        id: 'q_7_1',
        levelId: 'lvl_7_temple',
        order: 1,
        text: { kk: 'Руналық ребус: А + А + А = 27. А әрпінің мәні қандай цифр?', ru: 'Рунический ребус: А + А + А = 27. Какой цифре соответствует буква А?' },
        difficulty: 'easy',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '9',
        explanation: { kk: '27 ÷ 3 = 9.', ru: '27 / 3 = 9.' }
      },
      {
        id: 'q_7_2',
        levelId: 'lvl_7_temple',
        order: 2,
        text: { kk: 'Ғибадатхана баспалдағы: Бастапқы сан 1, келесілері: 3, 7, 15, 31, ___ ? Заңдылықты тауып, келесі санды жазыңыз.', ru: 'Ступени храма: 1, 3, 7, 15, 31, ___ ? Найдите следующее число в закономерности (удвоение + 1).' },
        difficulty: 'medium',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '63',
        explanation: { kk: '31 × 2 + 1 = 63.', ru: '31 * 2 + 1 = 63.' }
      },
      {
        id: 'q_7_3',
        levelId: 'lvl_7_temple',
        order: 3,
        text: { kk: 'Егер 12 × 12 = 144 болса, онда 13 × 13 нешеге тең?', ru: 'Если 12 * 12 = 144, чему равно 13 * 13?' },
        difficulty: 'medium',
        answerMode: 'multiple_choice',
        checkingMode: 'auto',
        options: ['159', '169', '179', '189'],
        correctAnswer: '169',
        explanation: { kk: '13 × 13 = 169.', ru: '13 * 13 = 169.' }
      },
      {
        id: 'q_7_4',
        levelId: 'lvl_7_temple',
        order: 4,
        text: { kk: 'Тас барыстың көздерінде екі жай сан жасырылған. Олардың көбейтіндісі 21, ал қосындысы 10. Бұл қандай екі сан? (Кішісінен бастап үтірсіз жазыңыз, мысалы: 3 және 7)', ru: 'Два простых числа в сумме дают 10, а при умножении 21. Назовите меньшее из них.' },
        difficulty: 'medium',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '3',
        explanation: { kk: '3 × 7 = 21, 3 + 7 = 10. Кішісі 3.', ru: '3 * 7 = 21, 3 + 7 = 10.' }
      },
      {
        id: 'q_7_5',
        levelId: 'lvl_7_temple',
        order: 5,
        text: { kk: 'Құпия код: 100-дің 25%-ы нешеге тең?', ru: 'Чему равны 25% от числа 100?' },
        difficulty: 'easy',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '25',
        explanation: { kk: '100 × 0.25 = 25.', ru: '100 * 0.25 = 25.' }
      },
      {
        id: 'q_7_6',
        levelId: 'lvl_7_temple',
        order: 6,
        text: { kk: 'Ғибадатханада 6 есік бар. Олардың әрқайсысынан тек бір рет өтіп, барлық 6 есікті ашудың неше түрлі тәсілі бар? (6! факториалды есептеңіз)', ru: 'Сколько способов обойти по порядку 6 священных врат храма (вычислите 6! = 6 × 5 × 4 × 3 × 2 × 1)?' },
        difficulty: 'hard',
        answerMode: 'multiple_choice',
        checkingMode: 'auto',
        options: ['120', '360', '720', '840'],
        correctAnswer: '720',
        explanation: { kk: '6! = 720 тәсіл.', ru: '6! = 720.' }
      },
      {
        id: 'q_7_7',
        levelId: 'lvl_7_temple',
        order: 7,
        text: { kk: 'Ойшылдың құпиясы: Жай сандар (Prime numbers) деген не және олардың математика мен құпия жазудағы маңызын өз сөзіңізбен жазыңыз.', ru: 'Что такое простые числа и почему они важны в шифровании и математике? Напишите своими словами.' },
        difficulty: 'hard',
        answerMode: 'typed',
        checkingMode: 'manual', // Teacher review
        correctAnswer: 'Тек 1-ге және өзіне бөлінетін сандар',
        explanation: { kk: 'Мұғалім қарауы: Оқушы жай сандардың анықтамасын және ерекшелігін түсінгенін көрсетуі қажет.', ru: 'Проверка учителем: Оценивается понимание делимости чисел.' }
      },
      {
        id: 'q_7_8',
        levelId: 'lvl_7_temple',
        order: 8,
        text: { kk: 'Тотем құлпы: Үш таңбалы санның жүздігі ондығынан 2 есе үлкен, ал бірлігі 0. Цифрларының қосындысы 9. Бұл қандай сан?', ru: 'Трёхзначное число оканчивается на 0. Число сотен в 2 раза больше десятков, а сумма всех цифр равна 9. Какое это число?' },
        difficulty: 'hard',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '630',
        explanation: { kk: 'Жүздігі = 6, ондығы = 3, бірлігі = 0. 6 + 3 + 0 = 9. Сан: 630.', ru: 'Сотни = 6, десятки = 3, единицы = 0. 6 + 3 = 9. Число 630.' }
      }
    ]
  },

  // Level 8: Magic Castle
  {
    id: 'lvl_8_castle',
    order: 8,
    title: { kk: '8-деңгей: Сиқырлы сарай', ru: 'Уровень 8: Волшебный замок' },
    description: { 
      kk: 'Математика шеберлерінің бас турнирі мен жеңімпаздар салтанаты!', 
      ru: 'Грандиозный математический турнир мастеров в тронном зале замка!' 
    },
    isPublished: true,
    worldTheme: 'magic_castle',
    rewardChestBonus: 200,
    rewardItem: 'hat_crown',
    questions: [
      {
        id: 'q_8_1',
        levelId: 'lvl_8_castle',
        order: 1,
        text: { kk: 'Сарайдың алтын залында 15 үстел бар, әр үстелге 8 шам қойылған. Барлық шамдар саны қанша?', ru: 'В тронном зале 15 столов, на каждом по 8 подсвечников. Сколько всего подсвечников?' },
        difficulty: 'easy',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '120',
        explanation: { kk: '15 × 8 = 120 шам.', ru: '15 * 8 = 120.' }
      },
      {
        id: 'q_8_2',
        levelId: 'lvl_8_castle',
        order: 2,
        text: { kk: 'Сарай сағаты әр 15 минут сайын соғады. Таңғы 08:00-ден түскі 12:00-ге дейін ол неше рет соғады?', ru: 'Часы замка бьют каждые 15 минут. Сколько раз они пробьют с 08:00 до 12:00 (ровно 4 часа)?' },
        difficulty: 'medium',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '16',
        explanation: { kk: '4 сағат = 4 × 4 = 16 рет.', ru: '4 часа * 4 = 16 раз.' }
      },
      {
        id: 'q_8_3',
        levelId: 'lvl_8_castle',
        order: 3,
        text: { kk: 'Корольдік қазынаның 20%-ы 500 алтын құрайды. Қазынаның толық көлемі қанша алтын?', ru: '20% королевской казны составляют 500 золотых. Каков полный размер казны?' },
        difficulty: 'medium',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '2500',
        explanation: { kk: '500 × 5 = 2500 алтын.', ru: '500 * 5 = 2500 золотых.' }
      },
      {
        id: 'q_8_4',
        levelId: 'lvl_8_castle',
        order: 4,
        text: { kk: 'Лабиринт бағы шаршы пішінді, ауданы 400 шаршы метр. Осы бақты қоршау үшін неше метр шарбақ қажет (периметрін табыңыз)?', ru: 'Садовый лабиринт имеет форму квадрата площадью 400 кв. м. Чему равен его периметр?' },
        difficulty: 'medium',
        answerMode: 'multiple_choice',
        checkingMode: 'auto',
        options: ['60 м', '80 м', '100 м', '120 м'],
        correctAnswer: '80 м',
        explanation: { kk: 'Қабырғасы: 20 м. Периметрі: 4 × 20 = 80 м.', ru: 'Сторона: 20 м. P = 4 * 20 = 80 м.' }
      },
      {
        id: 'q_8_5',
        levelId: 'lvl_8_castle',
        order: 5,
        text: { kk: 'Турнир жүлдесі: 7 сандыққа 1, 2, 3, 4, 5, 6, 7 алтын тас салынған. Барлығы неше алтын тас бар?', ru: 'В 7 шкатулках лежат 1, 2, 3, 4, 5, 6, 7 самоцветов. Сколько всего самоцветов?' },
        difficulty: 'easy',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '28',
        explanation: { kk: '1 + 2 + 3 + 4 + 5 + 6 + 7 = 28.', ru: 'Сумма чисел от 1 до 7 = 28.' }
      },
      {
        id: 'q_8_6',
        levelId: 'lvl_8_castle',
        order: 6,
        text: { kk: 'Күрделі сарай логикасы: Сарайда 4 батыр бір-бірімен бір реттен қол алысты. Барлығы неше қол алысу болды?', ru: '4 рыцаря обменялись рукопожатиями друг с другом по одному разу. Сколько всего было рукопожатий?' },
        difficulty: 'hard',
        answerMode: 'multiple_choice',
        checkingMode: 'auto',
        options: ['4', '6', '8', '12'],
        correctAnswer: '6',
        explanation: { kk: '(4 × 3) ÷ 2 = 6 қол алысу.', ru: '(4 * 3) / 2 = 6 рукопожатий.' }
      },
      {
        id: 'q_8_7',
        levelId: 'lvl_8_castle',
        order: 7,
        text: { kk: 'Ұлы Сарай салтанаты: Барлық деңгейлерден өткеннен кейінгі өз математикалық жетістігіңіз туралы қорытынды эссе немесе ой-толғауыңызды жазыңыз.', ru: 'Финальный турнир: напишите краткое заключительное эссе о том, какие математические темы вам понравились больше всего в этом путешествии.' },
        difficulty: 'hard',
        answerMode: 'typed',
        checkingMode: 'manual', // Final graduation manual review
        correctAnswer: 'Оқушының қорытынды эссесі',
        explanation: { kk: 'Мұғалім тексеруі: Оқушының ой қорытуы мен математикаға қызығушылығы жоғары бағаланады.', ru: 'Проверка учителем: Оценивается вдохновение и рассуждения ученика.' }
      },
      {
        id: 'q_8_8',
        levelId: 'lvl_8_castle',
        order: 8,
        text: { kk: 'Гранд-финал жұмбағы: Егер x + y = 30 және x - y = 10 болса, x × y көбейтіндісі нешеге тең?', ru: 'Финальный гранд-аккорд: Если x + y = 30 и x - y = 10, найдите произведение x * y.' },
        difficulty: 'hard',
        answerMode: 'typed',
        checkingMode: 'auto',
        correctAnswer: '200',
        explanation: { kk: '2x = 40 -> x = 20, y = 10. Көбейтіндісі: 20 × 10 = 200.', ru: 'x = 20, y = 10 -> 20 * 10 = 200.' }
      }
    ]
  }
];

export const INITIAL_PROGRESS: StudentProgress = {
  studentId: 'student_' + Math.random().toString(36).substring(2, 9),
  studentName: 'Жас саяхатшы',
  selectedCharacterId: 'alen',
  equippedHat: undefined,
  equippedClothing: undefined,
  equippedAccessory: undefined,
  points: 0,
  completedQuestionIds: [],
  completedLevelIds: [],
  openedChestLevelIds: [],
  unlockedCharacters: ['alen', 'ayla', 'barshyn', 'tulki'],
  ownedItems: [],
  currentLevelId: 'lvl_1_arithmetic',
  reviewSubmissions: [],
  incorrectAttemptsCount: {},
  totalAttempts: 0,
  hasFinishedFirstSetup: false
};

export const INITIAL_TEACHER_SETTINGS: TeacherSettings = {
  pin: '1234',
  pinCreated: false
};
