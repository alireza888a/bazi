
import { Flashcard, Sticker, BubblesItem } from './types';

export const CATEGORIES = [
  { id: 'animals', name: 'Animals', icon: '🦁', color: 'bg-orange-400' },
  { id: 'body', name: 'Body', icon: '💪', color: 'bg-pink-400' },
  { id: 'fruits', name: 'Fruits', icon: '🍎', color: 'bg-red-400' },
  { id: 'home', name: 'Home', icon: '🏠', color: 'bg-blue-400' },
  { id: 'music', name: 'Music', icon: '🎸', color: 'bg-purple-400' },
  { id: 'vehicles', name: 'Vehicles', icon: '🚀', color: 'bg-sky-400' },
  { id: 'nature', name: 'Nature', icon: '🌈', color: 'bg-green-400' },
  { id: 'toys', name: 'Toys', icon: '🧸', color: 'bg-yellow-400' },
  { id: 'food', name: 'Food', icon: '🍕', color: 'bg-amber-400' },
  { id: 'space', name: 'Space', icon: '👩‍🚀', color: 'bg-indigo-400' },
  { id: 'ocean', name: 'Ocean', icon: '🐙', color: 'bg-cyan-400' },
  { id: 'clothes', name: 'Clothes', icon: '👕', color: 'bg-teal-400' },
  { id: 'colors', name: 'Colors', icon: '🎨', color: 'bg-rose-400' },
  { id: 'shapes', name: 'Shapes', icon: '🟦', color: 'bg-slate-400' },
  { id: 'weather', name: 'Weather', icon: '☀️', color: 'bg-yellow-300' },
  { id: 'sports', name: 'Sports', icon: '⚽', color: 'bg-emerald-400' },
  { id: 'jobs', name: 'Jobs', icon: '👮', color: 'bg-blue-600' },
  { id: 'farm', name: 'Farm', icon: '🚜', color: 'bg-orange-800' },
  { id: 'emotions', name: 'Feelings', icon: '😊', color: 'bg-pink-300' },
  { id: 'school', name: 'School', icon: '🎒', color: 'bg-red-500' },
];

export const INITIAL_FLASHCARDS: Flashcard[] = [
  // 1. Animals
  { id: 'a1', word: 'Lion', translation: 'شیر', category: 'animals', emoji: '🦁' },
  { id: 'a2', word: 'Elephant', translation: 'فیل', category: 'animals', emoji: '🐘' },
  { id: 'a3', word: 'Monkey', translation: 'میمون', category: 'animals', emoji: '🐒' },
  { id: 'a4', word: 'Dog', translation: 'سگ', category: 'animals', emoji: '🐶' },
  { id: 'a5', word: 'Rabbit', translation: 'خرگوش', category: 'animals', emoji: '🐰' },

  // 2. Body (Fixed accuracy)
  { id: 'b1', word: 'Eye', translation: 'چشم', category: 'body', emoji: '👁️' },
  { id: 'b2', word: 'Ear', translation: 'گوش', category: 'body', emoji: '👂' },
  { id: 'b3', word: 'Nose', translation: 'بینی', category: 'body', emoji: '👃' },
  { id: 'b4', word: 'Mouth', translation: 'دهان', category: 'body', emoji: '👄' },
  { id: 'b5', word: 'Hand', translation: 'دست', category: 'body', emoji: '✋' },
  { id: 'b6', word: 'Foot', translation: 'پا', category: 'body', emoji: '🦶' },
  { id: 'b7', word: 'Stomach', translation: 'شکم', category: 'body', emoji: '🧍' },
  { id: 'b8', word: 'Neck', translation: 'گردن', category: 'body', emoji: '🧣' },

  // 3. Fruits
  { id: 'f1', word: 'Apple', translation: 'سیب', category: 'fruits', emoji: '🍎' },
  { id: 'f2', word: 'Banana', translation: 'موز', category: 'fruits', emoji: '🍌' },
  { id: 'f3', word: 'Orange', translation: 'پرتقال', category: 'fruits', emoji: '🍊' },
  { id: 'f4', word: 'Strawberry', translation: 'توت فرنگی', category: 'fruits', emoji: '🍓' },
  { id: 'f5', word: 'Watermelon', translation: 'هندوانه', category: 'fruits', emoji: '🍉' },

  // 4. Home
  { id: 'h1', word: 'Bed', translation: 'تخت خواب', category: 'home', emoji: '🛏️' },
  { id: 'h2', word: 'Chair', translation: 'صندلی', category: 'home', emoji: '🪑' },
  { id: 'h3', word: 'Door', translation: 'در', category: 'home', emoji: '🚪' },
  { id: 'h4', word: 'Window', translation: 'پنجره', category: 'home', emoji: '🪟' },
  { id: 'h5', word: 'Lamp', translation: 'چراغ', category: 'home', emoji: '💡' },

  // 5. Music
  { id: 'm1', word: 'Guitar', translation: 'گیتار', category: 'music', emoji: '🎸' },
  { id: 'm2', word: 'Piano', translation: 'پیانو', category: 'music', emoji: '🎹' },
  { id: 'm3', word: 'Drum', translation: 'طبل', category: 'music', emoji: '🥁' },
  { id: 'm4', word: 'Violin', translation: 'ویولن', category: 'music', emoji: '🎻' },

  // 6. Vehicles
  { id: 'v1', word: 'Car', translation: 'ماشین', category: 'vehicles', emoji: '🚗' },
  { id: 'v2', word: 'Plane', translation: 'هواپیما', category: 'vehicles', emoji: '✈️' },
  { id: 'v3', word: 'Bike', translation: 'دوچرخه', category: 'vehicles', emoji: '🚲' },
  { id: 'v4', word: 'Boat', translation: 'قایق', category: 'vehicles', emoji: '⛵' },
  { id: 'v5', word: 'Truck', translation: 'کامیون', category: 'vehicles', emoji: '🚚' },

  // 7. Nature
  { id: 'n1', word: 'Sun', translation: 'خورشید', category: 'nature', emoji: '☀️' },
  { id: 'n2', word: 'Moon', translation: 'ماه', category: 'nature', emoji: '🌙' },
  { id: 'n3', word: 'Tree', translation: 'درخت', category: 'nature', emoji: '🌳' },
  { id: 'n4', word: 'Flower', translation: 'گل', category: 'nature', emoji: '🌸' },
  { id: 'n5', word: 'Rainbow', translation: 'رنگین کمان', category: 'nature', emoji: '🌈' },

  // 8. Toys
  { id: 't1', word: 'Ball', translation: 'توپ', category: 'toys', emoji: '⚽' },
  { id: 't2', word: 'Doll', translation: 'عروسک', category: 'toys', emoji: '🪆' },
  { id: 't3', word: 'Robot', translation: 'آدم آهنی', category: 'toys', emoji: '🤖' },
  { id: 't4', word: 'Blocks', translation: 'مکعب سازی', category: 'toys', emoji: '🧱' },

  // 9. Food
  { id: 'fd1', word: 'Milk', translation: 'شیر خوراکی', category: 'food', emoji: '🥛' },
  { id: 'fd2', word: 'Bread', translation: 'نان', category: 'food', emoji: '🍞' },
  { id: 'fd3', word: 'Egg', translation: 'تخم مرغ', category: 'food', emoji: '🥚' },
  { id: 'fd4', word: 'Pizza', translation: 'پیتزا', category: 'food', emoji: '🍕' },
  { id: 'fd5', word: 'Cake', translation: 'کیک', category: 'food', emoji: '🍰' },

  // 10. Space
  { id: 'sp1', word: 'Rocket', translation: 'موشک فضایی', category: 'space', emoji: '🚀' },
  { id: 'sp2', word: 'Star', translation: 'ستاره', category: 'space', emoji: '⭐' },
  { id: 'sp3', word: 'Earth', translation: 'زمین', category: 'space', emoji: '🌍' },
  { id: 'sp4', word: 'Astronaut', translation: 'فضانورد', category: 'space', emoji: '👨‍🚀' },

  // 11. Ocean
  { id: 'oc1', word: 'Fish', translation: 'ماهی', category: 'ocean', emoji: '🐟' },
  { id: 'oc2', word: 'Whale', translation: 'نهنگ', category: 'ocean', emoji: '🐋' },
  { id: 'oc3', word: 'Octopus', translation: 'هشت پا', category: 'ocean', emoji: '🐙' },
  { id: 'oc4', word: 'Shark', translation: 'کوسه', category: 'ocean', emoji: '🦈' },

  // 12. Clothes
  { id: 'cl1', word: 'Shirt', translation: 'پیراهن', category: 'clothes', emoji: '👕' },
  { id: 'cl2', word: 'Hat', translation: 'کلاه', category: 'clothes', emoji: '🧢' },
  { id: 'cl3', word: 'Shoes', translation: 'کفش', category: 'clothes', emoji: '👟' },
  { id: 'cl4', word: 'Socks', translation: 'جوراب', category: 'clothes', emoji: '🧦' },

  // 13. Colors
  { id: 'co1', word: 'Red', translation: 'قرمز', category: 'colors', emoji: '🔴' },
  { id: 'co2', word: 'Blue', translation: 'آبی', category: 'colors', emoji: '🔵' },
  { id: 'co3', word: 'Green', translation: 'سبز', category: 'colors', emoji: '🟢' },
  { id: 'co4', word: 'Yellow', translation: 'زرد', category: 'colors', emoji: '🟡' },
  { id: 'co5', word: 'Pink', translation: 'صورتی', category: 'colors', emoji: '💗' },

  // 14. Shapes
  { id: 'sh1', word: 'Circle', translation: 'دایره', category: 'shapes', emoji: '⭕' },
  { id: 'sh2', word: 'Square', translation: 'مربع', category: 'shapes', emoji: '⬛' },
  { id: 'sh3', word: 'Triangle', translation: 'مثلث', category: 'shapes', emoji: '🔺' },
  { id: 'sh4', word: 'Heart', translation: 'قلب', category: 'shapes', emoji: '❤️' },

  // 15. Weather
  { id: 'we1', word: 'Rain', translation: 'باران', category: 'weather', emoji: '🌧️' },
  { id: 'we2', word: 'Snow', translation: 'برف', category: 'weather', emoji: '❄️' },
  { id: 'we3', word: 'Cloud', translation: 'ابر', category: 'weather', emoji: '☁️' },
  { id: 'we4', word: 'Sun', translation: 'آفتاب', category: 'weather', emoji: '☀️' },

  // 16. Sports
  { id: 'sr1', word: 'Football', translation: 'فوتبال', category: 'sports', emoji: '⚽' },
  { id: 'sr2', word: 'Swimming', translation: 'شنا', category: 'sports', emoji: '🏊' },
  { id: 'sr3', word: 'Tennis', translation: 'تنیس', category: 'sports', emoji: '🎾' },
  { id: 'sr4', word: 'Basketball', translation: 'بسکتبال', category: 'sports', emoji: '🏀' },

  // 17. Jobs
  { id: 'jb1', word: 'Doctor', translation: 'دکتر', category: 'jobs', emoji: '👨‍⚕️' },
  { id: 'jb2', word: 'Teacher', translation: 'معلم', category: 'jobs', emoji: '👩‍🏫' },
  { id: 'jb3', word: 'Chef', translation: 'آشپز', category: 'jobs', emoji: '👨‍🍳' },
  { id: 'jb4', word: 'Fireman', translation: 'آتشنشان', category: 'jobs', emoji: '👨‍🚒' },

  // 18. Farm
  { id: 'fm1', word: 'Cow', translation: 'گاو', category: 'farm', emoji: '🐮' },
  { id: 'fm2', word: 'Sheep', translation: 'گوسفند', category: 'farm', emoji: '🐑' },
  { id: 'fm3', word: 'Chicken', translation: 'جوجه', category: 'farm', emoji: '🐥' },
  { id: 'fm4', word: 'Tractor', translation: 'تراکتور', category: 'farm', emoji: '🚜' },

  // 19. Emotions
  { id: 'em1', word: 'Happy', translation: 'خوشحال', category: 'emotions', emoji: '😊' },
  { id: 'em2', word: 'Sad', translation: 'ناراحت', category: 'emotions', emoji: '😢' },
  { id: 'em3', word: 'Angry', translation: 'عصبانی', category: 'emotions', emoji: '😡' },
  { id: 'em4', word: 'Scared', translation: 'ترسیده', category: 'emotions', emoji: '😨' },

  // 20. School
  { id: 'sl1', word: 'Book', translation: 'کتاب', category: 'school', emoji: '📖' },
  { id: 'sl2', word: 'Pencil', translation: 'مداد', category: 'school', emoji: '✏️' },
  { id: 'sl3', word: 'Bag', translation: 'کیف مدرسه', category: 'school', emoji: '🎒' },
  { id: 'sl4', word: 'Ruler', translation: 'خط کش', category: 'school', emoji: '📏' },
];

export const BUBBLES_ITEMS: BubblesItem[] = [
  { id: 'item1', name: 'Party Hat', emoji: '🥳', cost: 20 },
  { id: 'item2', name: 'Cool Shades', emoji: '🕶️', cost: 50 },
  { id: 'item3', name: 'Super Cape', emoji: '🦸', cost: 100 },
  { id: 'item4', name: 'Magic Wand', emoji: '🪄', cost: 150 },
  { id: 'item5', name: 'Crown', emoji: '👑', cost: 300 },
  { id: 'item6', name: 'Scarf', emoji: '🧣', cost: 30 },
];

export const ALL_STICKERS: Sticker[] = [
  { id: 's1', name: 'Super Star', emoji: '⭐', isUnlocked: false, requirement: 'First Game Win' },
  { id: 's2', name: 'Dino Friend', emoji: '🦖', isUnlocked: false, requirement: 'Score 50 Points' },
  { id: 's3', name: 'Rocket Learner', emoji: '🚀', isUnlocked: false, requirement: 'Discover 10 Words' },
  { id: 's4', name: 'Wise Bear', emoji: '🧸', isUnlocked: false, requirement: 'Score 100 Points' },
  { id: 's5', name: 'Speaker', emoji: '🎙️', isUnlocked: false, requirement: 'Perfect Pronunciation' },
  { id: 's6', name: 'Stylist', emoji: '👗', isUnlocked: false, requirement: 'Buy first item' },
];
