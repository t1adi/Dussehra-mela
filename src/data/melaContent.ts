import { FoodItem, Quest, StallInfo, ToyItem } from '../types';

export const STALLS: StallInfo[] = [
  {
    id: 'balloon-pop',
    name: 'Gubbare Wala (Balloon Pop)',
    hindiName: 'गुब्बारे वाला (निशानेबाज़ी)',
    tagline: 'Test your aim and pop colorful balloons!',
    hindiTagline: 'निशाना लगाओ और इनाम जीतो!',
    position: [-10, 0, 15],
    rotationY: Math.PI / 2,
    icon: '🎯',
    color: '#e74c3c',
    actionLabel: 'Play Balloon Pop',
    hindiActionLabel: 'गुब्बारे फोड़ें'
  },
  {
    id: 'ring-toss',
    name: 'Chhalla Phenko (Ring Toss)',
    hindiName: 'छल्ला फेंको (रिंग टॉस)',
    tagline: 'Throw rings over golden bottles to win prizes!',
    hindiTagline: 'बोतल पर छल्ला चढ़ाओ और इनाम पाओ!',
    position: [10, 0, 15],
    rotationY: -Math.PI / 2,
    icon: '⭕',
    color: '#f39c12',
    actionLabel: 'Play Ring Toss',
    hindiActionLabel: 'छल्ला खेलें'
  },
  {
    id: 'food-stall',
    name: 'Chaat & Mithai Corner',
    hindiName: 'चाट और जलेबी का ठेला',
    tagline: 'Hot crispy Jalebis, tangy Golgappe & spiced chai!',
    hindiTagline: 'गरमा-गरम जलेबी, तीखे गोलगप्पे और कड़क चाय!',
    position: [-10, 0, 0],
    rotationY: Math.PI / 2,
    icon: '🍲',
    color: '#d35400',
    actionLabel: 'Eat Snacks',
    hindiActionLabel: 'चाट चखें'
  },
  {
    id: 'toy-stall',
    name: 'Desi Khilone (Traditional Toys)',
    hindiName: 'देसी खिलौनों की दुकान',
    tagline: 'Spinning tops, wooden puppets & colorful pinwheels!',
    hindiTagline: 'लट्टू, फिरकी, कठपुतली और ढोलक!',
    position: [10, 0, 0],
    rotationY: -Math.PI / 2,
    icon: '🪀',
    color: '#9b59b6',
    actionLabel: 'Browse Toys',
    hindiActionLabel: 'खिलौने देखें'
  },
  {
    id: 'souvenir-stall',
    name: 'Mela Haat (Souvenirs & Crafts)',
    hindiName: 'मेला हाट (दस्तकारी व यादें)',
    tagline: 'Handcrafted festival souvenirs, brass diyas & ornaments!',
    hindiTagline: 'पीतल के दीये, राजस्थानी पगड़ी और मेला यादें!',
    position: [-10, 0, -15],
    rotationY: Math.PI / 2,
    icon: '🏮',
    color: '#16a085',
    actionLabel: 'Browse Souvenirs',
    hindiActionLabel: 'यादगार चीजें'
  },
  {
    id: 'ferris-wheel',
    name: 'Aakash Jhula (Giant Ferris Wheel)',
    hindiName: 'आकाश झूला (विशाल चरखी)',
    tagline: 'Take a breathtaking scenic night flight above the entire fair!',
    hindiTagline: 'ऊंचाई से मेले का 360° अद्भुत नज़ारा लें!',
    position: [14, 0, -28],
    rotationY: -Math.PI / 4,
    icon: '🎡',
    color: '#2980b9',
    actionLabel: 'Ride Giant Wheel',
    hindiActionLabel: 'झूले की सवारी'
  },
  {
    id: 'ram-leela',
    name: 'Ram Leela Rangmanch',
    hindiName: 'रामलीला रंगमंच',
    tagline: 'Experience the heroic theatrical enactment of the Ramayana!',
    hindiTagline: 'भगवान श्री राम का भव्य मंचन और संवाद!',
    position: [-14, 0, -32],
    rotationY: Math.PI / 4,
    icon: '🎭',
    color: '#c0392b',
    actionLabel: 'Watch Performance',
    hindiActionLabel: 'रामलीला देखें'
  },
  {
    id: 'finale',
    name: 'Ravana Dahan Arena',
    hindiName: 'रावण दहन मैदान',
    tagline: 'Witness the grand finale: Victory of Good over Evil with fireworks!',
    hindiTagline: 'अधर्म पर धर्म की विजय और भव्य आतिशबाजी!',
    position: [0, 0, -52],
    rotationY: 0,
    icon: '🔥',
    color: '#e67e22',
    actionLabel: 'Begin Ravana Dahan',
    hindiActionLabel: 'रावण दहन करें'
  }
];

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'balloon-quest',
    title: 'Pop 5 Balloons',
    hindiTitle: '५ गुब्बारे फोड़ें',
    description: 'Show your sharpshooting skills at the Gubbare Wala stall.',
    hindiDescription: 'गुब्बारे वाले के पास जाकर ५ गुब्बारों पर सटीक निशाना लगाएं।',
    completed: false,
    rewardTokens: 25,
    icon: '🎯'
  },
  {
    id: 'ring-quest',
    title: 'Ring a Target',
    hindiTitle: 'बोतल पर छल्ला डालें',
    description: 'Successfully land a ring on a golden prize bottle.',
    hindiDescription: 'छल्ला फेंक कर सुनहरी बोतल पर सटीक छल्ला चढ़ाएं।',
    completed: false,
    rewardTokens: 25,
    icon: '⭕'
  },
  {
    id: 'food-quest',
    title: 'Taste Street Delicacies',
    hindiTitle: 'मेले का स्वाद चखें',
    description: 'Enjoy hot Jalebis or spicy Golgappe at the food stall.',
    hindiDescription: 'चाट के ठेले से गरमा-गरम जलेबी या पानी-पूरी का आनंद लें।',
    completed: false,
    rewardTokens: 15,
    icon: '🍲'
  },
  {
    id: 'toy-quest',
    title: 'Collect a Desi Toy',
    hindiTitle: 'देसी खिलौना खरीदें',
    description: 'Purchase a traditional Lattu or Kathputli for your mela bag.',
    hindiDescription: 'खिलौने की दुकान से अपनी पसंद का कोई पारंपरिक खिलौना लें।',
    completed: false,
    rewardTokens: 20,
    icon: '🪀'
  },
  {
    id: 'wheel-quest',
    title: 'Ride the Giant Wheel',
    hindiTitle: 'आकाश झूले की सैर',
    description: 'Climb aboard the Ferris Wheel for a panoramic night view.',
    hindiDescription: 'चरखी वाले झूले पर बैठें और पूरे मेले का भव्य दृश्य देखें।',
    completed: false,
    rewardTokens: 20,
    icon: '🎡'
  },
  {
    id: 'leela-quest',
    title: 'Witness Ram Leela',
    hindiTitle: 'रामलीला का मंचन देखें',
    description: 'Watch the dramatic enactment at the festival stage.',
    hindiDescription: 'रंगमंच पर जाकर श्री राम और लक्ष्मण जी का संवाद सुनें।',
    completed: false,
    rewardTokens: 30,
    icon: '🎭'
  },
  {
    id: 'finale-quest',
    title: 'Celebrate Ravana Dahan',
    hindiTitle: 'रावण दहन उत्सव',
    description: 'Ignite the sacred fiery arrow and light up the sky with fireworks!',
    hindiDescription: 'अग्नि बाण चलाकर रावण दहन करें और आतिशबाजी का आनंद लें!',
    completed: false,
    rewardTokens: 50,
    icon: '🔥'
  }
];

export const FOOD_ITEMS: FoodItem[] = [
  {
    id: 'jalebi',
    name: 'Desi Ghee Jalebi',
    hindiName: 'देसी घी की कुरकुरी जलेबी',
    price: 10,
    description: 'Freshly fried spiral sweets soaked in warm fragrant saffron syrup.',
    hindiDescription: 'केसर की खुशबू और शुद्ध घी में छनी रसीली गरम जलेबी।',
    dialogue: 'Arre babuji! Ekdum tazi aur kurkuri bani hai, garma-garam chakh ke dekhiye!',
    hindiDialogue: 'अरे बाबूजी! एकदम ताज़ा और कुरकुरी बनी है, गरमा-गरम चख कर देखिए!',
    icon: '🥨',
    tasteReaction: 'Delicious! The warm saffron syrup melts delightfully in your mouth.',
    hindiTasteReaction: 'लाजवाब! केसर की मिठास मुंह में घुल गई।'
  },
  {
    id: 'golgappa',
    name: 'Teekhe Meethe Golgappe',
    hindiName: 'तीखे मीठे गोलगप्पे (पानी पूरी)',
    price: 15,
    description: 'Crispy hollow puris filled with spiced potato, mint water & sweet tamarind.',
    hindiDescription: 'पुदीने का तीखा पानी और सोंठ की मीठी चटनी से भरे कुरकुरे बताशे।',
    dialogue: 'Bhaiyya thoda teekha zyada banau ya khatta-meetha? Ek papdi sukhi bhi milegi!',
    hindiDialogue: 'भैया थोड़ा तीखा ज़्यादा बनाऊं या खट्टा-मीठा? एक पपड़ी सूखी भी मिलेगी!',
    icon: '🥣',
    tasteReaction: 'Zesty explosion of mint and tangy tamarind! Simply irresistible.',
    hindiTasteReaction: 'आहा! तीखा-चटपटा पानी का स्वाद सीधा दिल को छू गया।'
  },
  {
    id: 'samosa',
    name: 'Special Mela Samosa',
    hindiName: 'हलवाई वाला गरमा-गरम समोसा',
    price: 12,
    description: 'Crisp pastry stuffed with spiced potatoes, green peas and whole coriander.',
    hindiDescription: 'धनिया, काजू और मसालों से भरपूर खस्ता करारा समोसा।',
    dialogue: 'Hari chutney ke sath khao babu, maza na aaye toh paise wapas!',
    hindiDialogue: 'हरी चटनी के साथ खाओ बाबू, मज़ा न आए तो पैसे वापस!',
    icon: '🥟',
    tasteReaction: 'Golden crisp exterior with piping hot savory filling. Pure nostalgia.',
    hindiTasteReaction: 'कुरकुरा खोल और मसालेदार आलू... बचपन के मेले की याद आ गई!'
  },
  {
    id: 'chai',
    name: 'Kulhad Wali Masala Chai',
    hindiName: 'कुल्हड़ वाली मसाला चाय',
    price: 8,
    description: 'Brewed with crushed ginger, cardamom, cinnamon and fresh milk in terracotta cups.',
    hindiDescription: 'अदरक, इलायची और मिट्टी के कुल्हड़ की सौंधी खुशबू वाली चाय।',
    dialogue: 'Yeh lijiye garma-garam kulhad chai, thand gayab ho jayegi!',
    hindiDialogue: 'यह लीजिए गरमा-गरम कुल्हड़ चाय, रात की ठंडक एकदम गायब हो जाएगी!',
    icon: '☕',
    tasteReaction: 'Soothing warmth with earthen aroma and rich spices.',
    hindiTasteReaction: 'मिट्टी की सौंधी खुशबू और अदरक की ताज़गी ने मन खुश कर दिया।'
  },
  {
    id: 'kulfi',
    name: 'Matka Malai Kulfi',
    hindiName: 'मटका मलाई कुल्फी',
    price: 15,
    description: 'Slow-simmered rich creamy milk ice on a wooden stick with pistachios and almonds.',
    hindiDescription: 'पिस्ता और बादाम से सजी मलाईदार ठंडी कुल्फी।',
    dialogue: 'Ekdum asli rabdi ki bani kulfi hai, khao toh din ban jaye!',
    hindiDialogue: 'एकदम असली रबड़ी की बनी कुल्फी है, खाओ तो दिन बन जाए!',
    icon: '🍦',
    tasteReaction: 'Creamy, rich and sweet, cooling your tastebuds after the spices.',
    hindiTasteReaction: 'ठंडी-ठंडी मलाईदार मिठास, खाकर तबीयत खुश हो गई!'
  }
];

export const TOY_ITEMS: ToyItem[] = [
  {
    id: 'lattu',
    name: 'Wooden Spinning Top (Lattu)',
    hindiName: 'रंग-बिरंगा लकड़ी का लट्टू',
    price: 20,
    description: 'Classic wooden top wound with thick cotton twine. Spins like a hurricane!',
    hindiDescription: 'मजबूत रस्सी और लकड़ी से बना पारंपरिक लट्टू जो फर्श पर खूब घूमता है।',
    icon: '🌀',
    interactiveType: 'lattu'
  },
  {
    id: 'kathputli',
    name: 'Rajasthani Kathputli Puppet',
    hindiName: 'राजस्थानी कठपुतली',
    price: 35,
    description: 'Handmade traditional wooden and cloth puppet with expressive strings.',
    hindiDescription: 'रंगीन कपड़ों और धागों से सजी सुंदर राजस्थानी नाचने वाली कठपुतली।',
    icon: '🎎',
    interactiveType: 'kathputli'
  },
  {
    id: 'phirki',
    name: 'Wind Pinwheel (Phirki)',
    hindiName: 'कागज़ की फिरकी (चकरघिनी)',
    price: 10,
    description: 'Bright rainbow pinwheel that whirls and hums when caught by the breeze.',
    hindiDescription: 'हवा के झोंके से तेज़ी से नाचती रंगीन कागज़ की फिरकी।',
    icon: '🏵️',
    interactiveType: 'phirki'
  },
  {
    id: 'dholak',
    name: 'Miniature Wooden Dholak',
    hindiName: 'छोटा लकड़ी का ढोलक',
    price: 30,
    description: 'Fun musical drum with authentic leather head and festive cord tensioners.',
    hindiDescription: 'हाथ से बजाने वाला नन्हा ढोलक जो मेले की ताल छेड़ देता है।',
    icon: '🪘',
    interactiveType: 'dholak'
  },
  {
    id: 'bow',
    name: 'Toy Bow & Arrow (Dhanush-Baan)',
    hindiName: 'खिलौना धनुष-बाण',
    price: 25,
    description: 'Decorated bamboo bow with soft suction arrows inspired by Sri Rama.',
    hindiDescription: 'श्री राम जी के शौर्य से प्रेरित बच्चों का पसंदीदा धनुष और बाण।',
    icon: '🏹',
    interactiveType: 'bow'
  }
];

export const SOUVENIR_ITEMS = [
  {
    id: 'brass-diya',
    name: 'Carved Brass Peacock Diya',
    hindiName: 'पीतल का मयूर दीया',
    price: 45,
    description: 'Polished solid brass oil lamp with peacock finial, bringing festive blessings.',
    hindiDescription: 'सुंदर मयूर की आकृति वाला पीतल का शुभ अखंड दीया।',
    icon: '🪔'
  },
  {
    id: 'pagri',
    name: 'Royal Festival Turban (Pagri)',
    hindiName: 'शाही जोधपुरी साफ़ा (पगड़ी)',
    price: 50,
    description: 'Rich bandhani silk turban with golden brocade, worn on festive occasions.',
    hindiDescription: 'सुनहरी ज़री से सजा बंधेज का सुंदर पारंपरिक साफ़ा।',
    icon: '👑'
  },
  {
    id: 'toran',
    name: 'Embroidered Door Toran',
    hindiName: 'कढ़ाईदार मांगलिक तोरण',
    price: 35,
    description: 'Traditional doorway hanging decorated with mirrors, beads and marigold motifs.',
    hindiDescription: 'शीशों और मोतियों से सजा घर के मुख्य द्वार का मांगलिक तोरण।',
    icon: '🎀'
  },
  {
    id: 'bangles',
    name: 'Lakh & Glass Bangles Set',
    hindiName: 'लाख की रंग-बिरंगी चूड़ियाँ',
    price: 25,
    description: 'Glittering handmade glass bangles that chime with every joyous step.',
    hindiDescription: 'झंकार करती हुई चटक रंगों वाली पारंपरिक लाख की चूड़ियां।',
    icon: '✨'
  }
];

export const RAM_LEELA_SCENES = [
  {
    act: 1,
    title: 'The Challenge across the Ocean',
    hindiTitle: 'समुद्र पार लंका का आह्वान',
    speaker: 'Lord Rama / श्री राम',
    dialogue: 'Satya aur dharama hi pratyek manushya ka sarvochha kartavya hai. Lanka me adharma ka ant nishchit hai.',
    hindiDialogue: 'सत्य और धर्म ही प्रत्येक मनुष्य का सर्वोच्च कर्तव्य है। लंका में अधर्म और अत्याचार का अंत निश्चित है!',
    speakerRole: 'Protector of Dharma'
  },
  {
    act: 2,
    title: 'Hanuman\'s Devotion',
    hindiTitle: 'भक्त शिरोमणि हनुमान जी की गर्जना',
    speaker: 'Hanuman / वीर हनुमान',
    dialogue: 'Prabhu Shri Ram ki kripa se hum Lanka ke har durg ko jeet lenge. Jai Shri Ram!',
    hindiDialogue: 'प्रभु श्री राम के नाम से समुद्र भी सेतु बन गया! अधर्मी रावण का अहंकार क्षण भर में टूटेगा। जय श्री राम!',
    speakerRole: 'Mighty Devotee'
  },
  {
    act: 3,
    title: 'The Divine Vow of Vijaya Dashami',
    hindiTitle: 'विजयादशमी का अमर संकल्प',
    speaker: 'Lord Rama & Lakshmana',
    dialogue: 'Buraai par acchai ki vijay keval ek katha nahi, hamare aacharan ka sankalp hai.',
    hindiDialogue: 'बुराई पर अच्छाई की विजय केवल एक कथा नहीं, बल्कि हर हृदय में जलने वाली सत्य की अमर ज्योति है!',
    speakerRole: 'Victory of Virtue'
  }
];
