// Curriculum data for Indian education boards
export const curriculumData = {
  subjects: {
    "cbse/ncert": {
      "1-5": ["Mathematics", "English", "Environmental Studies", "Hindi", "Computer Science"],
      "6-8": ["Mathematics", "Science", "English", "Hindi", "Social Science", "Computer Science"],
      "9-10": ["Mathematics", "Science", "English", "Hindi", "Social Science", "Computer Science", "Sanskrit"],
      "11-12": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "Computer Science", "Economics", "Business Studies", "Accountancy", "Political Science", "History", "Geography", "Psychology"]
    },
    "icse/cisce": {
      "1-5": ["Mathematics", "English", "Environmental Studies (EVS)", "Hindi", "Art & Craft", "Physical Education"],
      "6-8": ["Mathematics", "Science", "English", "History & Civics", "Geography", "Computer Applications", "Hindi", "Art & Craft", "Physical Education"],
      "9-10": ["English Language", "Literature in English", "Mathematics", "Physics", "Chemistry", "Biology", "History & Civics", "Geography", "Computer Applications", "Hindi", "Economics", "Commercial Studies", "Home Science", "Art & Craft"],
      "11-12": ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Hindi", "Computer Science", "Economics", "Commerce", "History", "Geography", "Psychology", "Sociology", "Political Science", "Philosophy"]
    }
  },
  
  topics: {
    "cbse/ncert": {
      "Mathematics": {
        "1-5": ["Numbers and Counting", "Addition and Subtraction", "Multiplication and Division", "Shapes and Patterns", "Measurement", "Time and Money", "Mental Mathematics", "Fractions (Class 4-5)"],
        "6-8": ["Patterns in Mathematics", "Numbers", "Fractions and Decimals", "Simple Equations", "Lines and Angles", "Geometry", "Mensuration", "Data Handling", "Algebra", "Ratio and Proportion", "Symmetry"],
        "9-10": ["Number Systems", "Polynomials", "Linear Equations in Two Variables", "Coordinate Geometry", "Introduction to Euclid's Geometry", "Lines and Angles", "Triangles", "Quadrilaterals", "Circles", "Constructions", "Heron's Formula", "Surface Areas and Volumes", "Statistics", "Probability"],
        "11-12": ["Sets", "Relations and Functions", "Trigonometric Functions", "Complex Numbers and Quadratic Equations", "Linear Inequalities", "Permutations and Combinations", "Binomial Theorem", "Sequences and Series", "Straight Lines", "Conic Sections", "Introduction to Three Dimensional Geometry", "Limits and Derivatives", "Mathematical Reasoning", "Statistics", "Probability", "Matrices", "Determinants", "Continuity and Differentiability", "Applications of Derivatives", "Integrals", "Applications of Integrals", "Differential Equations", "Vector Algebra", "Three Dimensional Geometry", "Linear Programming"]
      },
      "Science": {
        "6": ["The Wonderful World of Science", "Diversity in the Living World", "Mindful Eating: A Path to a Healthy Body", "Exploring Magnets", "Measurement of Length and Motion", "Materials Around Us", "Temperature and its Measurement", "A Journey through States of Water", "Methods of Separation in Everyday Life", "Living Creatures: Exploring their Characteristics", "Nature's Treasures", "Beyond Earth"],
        "7": ["Nutrition in Plants", "Nutrition in Animals", "Heat", "Acids, Bases and Salts", "Physical and Chemical Changes", "Weather, Climate and Adaptations", "Winds, Storms and Cyclones", "Soil", "Respiration in Organisms", "Transportation in Animals and Plants", "Reproduction in Plants", "Motion and Time", "Electric Current and its Effects", "Light", "Water: A Precious Resource", "Forests: Our Lifeline", "Wastewater Story"],
        "8": ["Crop Production and Management", "Microorganisms: Friend and Foe", "Synthetic Fibres and Plastics", "Materials: Metals and Non-Metals", "Coal and Petroleum", "Combustion and Flame", "Conservation of Plants and Animals", "Cell — Structure and Functions", "Reproduction in Animals", "Reaching the Age of Adolescence", "Force and Pressure", "Friction", "Sound"],
        "9-10": ["Matter in Our Surroundings", "Is Matter Around Us Pure?", "Atoms and Molecules", "Structure of Atom", "The Fundamental Unit of Life", "Tissues", "Diversity in Living Organisms", "Motion", "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound", "Why Do We Fall Ill?", "Natural Resources Management", "Improvement in Food Resources", "Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and its Compounds", "Periodic Classification of Elements", "Life Processes", "Control and Coordination", "How do Organisms Reproduce?", "Heredity and Evolution", "Light – Reflection and Refraction", "Human Eye and Colourful World", "Electricity", "Magnetic Effects of Electric Current"],
        "11-12": ["Physical World", "Units and Measurement", "Motion in a Straight Line", "Motion in a Plane", "Laws of Motion", "Work, Energy and Power", "System of Particles", "Gravitation", "Mechanical Properties", "Thermal Properties", "Thermodynamics", "Kinetic Theory", "Oscillations", "Waves", "Electric Charges", "Electrostatic Potential", "Current Electricity", "Magnetic Effects", "Magnetism", "Electromagnetic Induction", "Alternating Current", "Electromagnetic Waves", "Ray Optics", "Wave Optics", "Dual Nature", "Atoms", "Nuclei", "Semiconductor Electronics"]
      },
      "Physics": {
        "9-10": ["Motion", "Force and Laws of Motion", "Gravitation", "Work and Energy", "Sound", "Light – Reflection and Refraction", "Human Eye and Colourful World", "Electricity", "Magnetic Effects of Electric Current", "Sources of Energy"],
        "11-12": ["Physical World", "Units and Measurement", "Motion in a Straight Line", "Motion in a Plane", "Laws of Motion", "Work, Energy and Power", "System of Particles", "Gravitation", "Mechanical Properties", "Thermal Properties", "Thermodynamics", "Kinetic Theory", "Oscillations", "Waves", "Electric Charges", "Electrostatic Potential", "Current Electricity", "Magnetic Effects", "Magnetism", "Electromagnetic Induction", "Alternating Current", "Electromagnetic Waves", "Ray Optics", "Wave Optics", "Dual Nature", "Atoms", "Nuclei", "Semiconductor Electronics"]
      },
      "Chemistry": {
        "9-10": ["Matter in Our Surroundings", "Is Matter Around Us Pure?", "Atoms and Molecules", "Structure of Atom", "Chemical Reactions and Equations", "Acids, Bases and Salts", "Metals and Non-metals", "Carbon and its Compounds", "Periodic Classification of Elements"],
        "11-12": ["Basic Concepts", "Structure of Atom", "Classification of Elements", "Chemical Bonding", "States of Matter", "Thermodynamics", "Equilibrium", "Redox Reactions", "Hydrogen", "s-Block Elements", "p-Block Elements", "Organic Chemistry", "Hydrocarbons", "Environmental Chemistry", "Solid State", "Solutions", "Electrochemistry", "Chemical Kinetics", "Surface Chemistry", "Isolation of Elements", "d and f Block Elements", "Coordination Compounds", "Haloalkanes", "Alcohols", "Aldehydes", "Carboxylic Acids", "Amines", "Biomolecules", "Polymers", "Chemistry in Everyday Life"]
      },
      "Biology": {
        "9-10": ["Life Processes", "Control and Coordination", "How do Organisms Reproduce?", "Heredity and Evolution", "Our Environment", "Natural Resource Management"],
        "11-12": ["Living World", "Biological Classification", "Plant Kingdom", "Animal Kingdom", "Morphology of Plants", "Anatomy of Plants", "Structural Organisation in Animals", "Cell", "Biomolecules", "Cell Cycle", "Transport in Plants", "Mineral Nutrition", "Photosynthesis", "Respiration in Plants", "Plant Growth", "Digestion and Absorption", "Breathing and Exchange of Gases", "Body Fluids and Circulation", "Excretory Products", "Locomotion and Movement", "Neural Control", "Chemical Coordination", "Reproduction", "Sexual Reproduction", "Human Reproduction", "Reproductive Health", "Principles of Inheritance", "Molecular Basis of Inheritance", "Evolution", "Human Health and Disease", "Strategies for Enhancement", "Microbes in Human Welfare", "Biotechnology", "Biotechnology Applications", "Organisms and Populations", "Ecosystem", "Biodiversity", "Environmental Issues"]
      },
      "English": {
        "1-5": ["Reading Comprehension", "Grammar Basics", "Vocabulary Building", "Writing Skills", "Listening and Speaking", "Stories and Poems", "Phonics"],
        "6-8": ["Reading Comprehension", "Grammar", "Vocabulary", "Writing Skills", "Literature", "Poetry", "Drama", "Language Use"],
        "9-10": ["Reading Comprehension", "Grammar", "Writing Skills", "Literature", "Poetry", "Drama", "Prose Writing", "Language Study"],
        "11-12": ["Reading Comprehension", "Advanced Grammar", "Writing Skills", "Literature", "Poetry", "Drama", "Language Studies", "Communication Skills", "Project Work"]
      },
    "Hindi": {
      "1-5": ["हिंदी वर्णमाला", "मात्रा", "शब्द निर्माण", "वाक्य रचना", "कहानी", "कविता", "व्याकरण"],
      "6-8": ["गद्य", "पद्य", "व्याकरण", "रचना", "पत्र लेखन", "निबंध", "कहानी लेखन"],
      "9-10": ["गद्य खंड", "काव्य खंड", "व्याकरण", "रचना", "पत्र लेखन", "निबंध लेखन", "संवाद लेखन"],
      "11-12": ["गद्य संकलन", "काव्य संकलन", "व्याकरण", "रचना", "साहित्य का इतिहास", "भाषा विज्ञान"]
    },
    "Social Science": {
      "6-8": ["Timeline and Sources of History", "India, that is Bharat", "The beginnings of Indian civilization", "India's Cultural Roots", "Locating places on the Earth", "Oceans and continents", "Landforms and life", "Unity in Diversity", "Family and Community", "Grassroots Democracy", "Our Pasts", "The Earth - Our Habitat", "Social and Political Life"],
      "9-10": ["The French Revolution", "Socialism in Europe and the Russian Revolution", "Nazism and the Rise of Hitler", "Forest Society and Colonialism", "Pastoralists in the Modern World", "India - Size and Location", "Physical Features of India", "Drainage", "Climate", "Natural Vegetation and Wildlife", "Population", "Democracy in the Contemporary World", "What is Democracy? Why Democracy?", "Constitutional Design", "Electoral Politics", "Working of Institutions", "The Story of Village Palampur", "People as Resource", "Poverty as a Challenge", "Food Security in India"]
    },
    "History": {
      "6-8": ["Timeline and Sources of History", "India, that is Bharat", "The beginnings of Indian civilization", "India's Cultural Roots", "What, Where, How and When?", "From Hunting-Gathering to Growing Food", "In the Earliest Cities", "What Books and Burials Tell Us", "Kingdoms, Kings and an Early Republic", "New Questions and Ideas", "Ashoka, The Emperor Who Gave Up War", "Vital Villages, Thriving Towns", "Traders, Kings and Pilgrims", "New Empires and Kingdoms", "Buildings, Paintings and Books"],
      "9-10": ["The French Revolution", "Socialism in Europe and the Russian Revolution", "Nazism and the Rise of Hitler", "Forest Society and Colonialism", "Pastoralists in the Modern World"],
      "11-12": ["Themes in World History", "The Rise of Nationalism in Europe", "The Making of a Global World", "The Industrial Revolution", "Print Culture and the Modern World", "Themes in Indian History", "Bricks, Beads and Bones", "Kings, Farmers and Towns", "Kinship, Caste and Class", "Thinking, Believing and Knowing", "Through the Eyes of Travellers", "Bhakti-Sufi Traditions", "An Imperial Capital: Vijayanagara", "Peasants, Zamindars and the State", "Kings and Chronicles", "Colonial Cities", "Rebels and the Raj", "Colonial Arts", "Framing the Constitution", "The Making of the National Movement", "India after Independence"]
    },
    "Geography": {
      "6-8": ["The Earth and the Universe", "Latitudes and Longitudes", "Motions of the Earth", "Maps and Diagrams", "Major Landforms of the Earth", "Our Country India", "The Northern Mountains", "The Northern Plains", "The Peninsular Plateau", "The Indian Desert", "The Coastal Plains", "The Islands", "Climate", "Natural Vegetation", "Wildlife", "Mineral and Power Resources", "Agriculture", "Industries", "Human Resources", "Transport", "Communication"],
      "9-10": ["India Location, Relief and Drainage", "India Climate, Natural Vegetation and Wildlife", "India Agriculture and Water Resources", "India Mineral and Power Resources", "India Industries and Transport", "India Population", "For Pleasure and Leisure", "Asia Location and Political Divisions", "Asia Physical Features", "Asia Climate and Natural Vegetation", "Asia Agriculture, Mineral and Power Resources", "Asia Industries Transport and Communication"],
      "11-12": ["Introduction to Geography", "The Earth", "Landforms", "Climate", "Natural Vegetation", "Soils", "Population", "Human Settlements", "Economic Geography", "Transport and Communication", "International Trade", "India Physical Features", "India Drainage System", "India Climate", "India Natural Vegetation", "India Population", "India Agriculture", "India Water Resources", "India Mineral and Energy Resources", "India Manufacturing Industries", "India Planning and Sustainable Development"]
    },
    "Political Science": {
      "9-10": ["Democracy in the Contemporary World", "What is Democracy? Why Democracy?", "Constitutional Design", "Electoral Politics", "Working of Institutions", "Democratic Rights"],
      "11-12": ["Constitution as a Living Document", "Rights in the Indian Constitution", "Election and Representation", "The Executive", "The Legislature", "The Judiciary", "Federalism", "Local Governments", "Constitution as a Living Document", "The Philosophy of the Constitution", "Political Parties", "Pressure Groups and Movements", "Challenges to Democracy", "Recent Developments in Indian Politics"]
    },
    "Economics": {
      "9-10": ["Economics as a Social Science", "Consumer Behaviour", "Producer Behaviour", "Forms of Market and Price Determination", "National Income and Related Aggregates", "Money and Banking", "Government Budget and the Economy", "Balance of Payments", "Development", "Sectors of the Indian Economy", "Money and Credit", "Globalisation and the Indian Economy"],
      "11-12": ["Introduction to Economics", "Consumer Equilibrium and Demand", "Producer Behaviour and Supply", "Forms of Market and Price Determination", "National Income and Related Aggregates", "Money and Banking", "Determination of Income and Employment", "Government Budget and the Economy", "Balance of Payments", "Development", "Indian Economy on the Eve of Independence", "Indian Economy 1950-1990", "Economic Reforms since 1991", "Poverty", "Human Capital Formation in India", "Rural Development", "Employment Growth Informalisation and Related Issues", "Infrastructure", "Environment and Sustainable Development", "Development Experience of India"]
    },
    "Computer Science": {
      "1-5": ["Introduction to Computers", "Parts of a Computer", "Operating a Computer", "Basic Applications", "Drawing and Painting", "Fun with Computers"],
      "6-8": ["Computer System", "Operating System Basics", "Word Processing", "Spreadsheets", "Presentations", "Internet Basics", "Email Communication", "Introduction to Programming"],
      "9-10": ["Computer Fundamentals", "Operating Systems", "Programming Methodology", "Programming in Python", "Database Concepts", "Web Technologies", "Boolean Logic", "Number Systems"],
      "11-12": ["Problem Solving Using Computer", "Programming Methodology", "Introduction to Programming", "Programming in Python", "Arrays", "Functions", "Objects and Classes", "Constructors and Destructors", "Inheritance", "Stack", "Queue", "Boolean Algebra", "Communication and Network Concepts", "Database and SQL", "Practical Work"]
    },
    "Environmental Studies (EVS)": {
      "1-5": ["My Family and Me", "Plants Around Us", "Animals Around Us", "Food We Eat", "Water", "Air", "Weather and Climate", "Festivals and Celebrations", "Means of Transport", "Communication"],
      "6-8": ["Our Environment", "Natural Resources", "Pollution and Conservation", "Forests and Wildlife", "Agriculture and Food Production", "Health and Hygiene", "Disaster Management"]
    },
    "Literature in English": {
      "9-10": ["Drama", "Short Stories", "Poetry", "Prose", "Novel Study", "Language Study", "Writing Skills"],
      "11-12": ["Drama Analysis", "Poetry Appreciation", "Prose Study", "Novel Analysis", "Literary Criticism", "Creative Writing", "Language Skills"]
    },
    "English Language": {
      "9-10": ["Composition Writing", "Letter Writing", "Comprehension", "Grammar", "Vocabulary", "Précis Writing", "Notice and Report Writing"],
      "11-12": ["Advanced Composition", "Directed Writing", "Comprehension Skills", "Advanced Grammar", "Language Functions", "Reading Skills"]
    },
    "History & Civics": {
      "6-8": ["Early Civilizations", "Early Humans", "The First Cities", "What Books and Burials Tell Us", "Kingdoms Kings and an Early Republic", "New Questions and Ideas", "Ashoka The Emperor Who Gave Up War", "Vital Villages Thriving Towns", "Traders Kings and Pilgrims", "New Empires and Kingdoms", "Building Painting and Books", "The Mughal Empire", "The Sultans of Delhi", "Architecture", "A Changing World", "The British Power in India", "Our Constitution", "How the State Government Works", "How the Central Government Works", "Understanding Laws", "Understanding Media", "Understanding Advertising", "Markets Around Us", "A Shirt in the Market"],
      "9-10": ["The French Revolution", "The Industrial Revolution", "Rise of Nationalism in Europe", "The Making of a Global World", "Print Culture and the Modern World", "History and Sport", "Clothing: A Social History", "The Harappan Civilization", "The Vedic Age", "Rise of Jainism and Buddhism", "The Mauryan Empire", "The Age of the Guptas", "Medieval India", "The Mughal Empire", "The Company Rule in India", "India's Struggle for Independence", "Electoral Politics", "Working of Institutions", "Political Parties", "Outcomes of Democracy", "Challenges to Democracy"],
      "11-12": ["Ancient Indian History", "Medieval Indian History", "Modern Indian History", "Constitutional Development", "Political Processes", "Governance", "Indian National Movement", "Post Independence India", "Constitutional Framework", "Political System", "Electoral Process", "Local Government", "Constitutional Values"]
    },
    "Art & Craft": {
      "1-5": ["Drawing", "Coloring", "Paper Craft", "Clay Modeling", "Nature Art", "Festival Crafts"],
      "6-8": ["Fine Arts", "Applied Arts", "Traditional Art Forms", "Modern Art Techniques", "Craft Work", "Art History"],
      "9-10": ["Drawing and Painting", "Sculpture", "Applied Art", "Art History", "Creative Expression", "Art Appreciation"]
    },
    "Physical Education": {
      "1-5": ["Basic Movements", "Simple Games", "Health and Hygiene", "Safety Rules", "Sports Activities"],
      "6-8": ["Physical Fitness", "Games and Sports", "Health Education", "First Aid", "Sports Rules", "Olympic Education"],
      "9-10": ["Sports and Games", "Physical Fitness", "Sports Psychology", "Sports Medicine", "Training Methods", "Sports Management"]
    },
    "Home Science": {
      "9-10": ["Food and Nutrition", "Clothing and Textiles", "Home Management", "Child Development", "Health and First Aid", "Consumer Education"],
      "11-12": ["Advanced Nutrition", "Food Science", "Textile Science", "Interior Decoration", "Family Resource Management", "Entrepreneurship"]
    },
    "Commercial Studies": {
      "9-10": ["Business Studies", "Banking", "Marketing", "Insurance", "Transport", "Communication", "Warehousing", "Advertising", "Consumer Protection"],
      "11-12": ["Business Organization", "Company Formation", "Business Finance", "Marketing Management", "Human Resource Management", "International Business"]
    },
    "Commerce": {
      "11-12": ["Financial Accounting", "Partnership Accounts", "Company Accounts", "Analysis of Financial Statements", "Cash Flow Statement", "Business Studies", "Nature and Significance of Management", "Principles of Management", "Business Environment", "Planning", "Organising", "Staffing", "Directing", "Controlling", "Financial Management", "Financial Markets", "Marketing", "Consumer Protection", "Entrepreneurship Development"]
    },
    "Computer Science": {
      "1-5": ["Introduction to Computers", "Parts of a Computer", "Operating a Computer", "Basic Applications", "Drawing and Painting", "Fun with Computers"],
      "6-8": ["Computer System", "Operating System Basics", "Word Processing", "Spreadsheets", "Presentations", "Internet Basics", "Email Communication", "Introduction to Programming"],
      "9-10": ["Computer Fundamentals", "Operating Systems", "Programming Methodology", "Programming in Python", "Database Concepts", "Web Technologies", "Boolean Logic", "Number Systems"],
      "11-12": ["Problem Solving Using Computer", "Programming Methodology", "Introduction to Programming", "Programming in C++", "Arrays", "Functions", "Objects and Classes", "Constructors and Destructors", "Inheritance", "Stack", "Queue", "Boolean Algebra", "Communication and Network Concepts", "Database and SQL", "Practical Work"]
    },
    "Psychology": {
      "11-12": ["Introduction to Psychology", "Methods of Psychology", "The Bases of Human Behaviour", "Human Development", "Sensory Attentional and Perceptual Processes", "Learning", "Human Memory", "Thinking", "Motivation and Emotion", "Intelligence and Aptitude", "Personality", "Attitude and Social Cognition", "Psychological Disorders", "Therapeutic Approaches", "Psychology and Life"]
    },
    "Sociology": {
      "11-12": ["Introducing Sociology", "Social Institutions", "Social Inequality and Exclusion", "The Challenges of Unity in Diversity", "Process of Social Change and Development", "Structural Change", "Cultural Change", "Change and Development in Rural Society", "Change and Development in Industrial Society", "Globalisation and Social Change", "Mass Media and Communications", "Social Movements"]
    },
    "Political Science": {
      "11-12": ["Political Theory Introduction", "What is Politics", "Freedom", "Equality", "Social Justice", "Rights", "Citizenship", "Nationalism", "Secularism", "Peace", "Development", "Constitution as a Living Document", "Rights in the Indian Constitution", "Election and Representation", "The Executive", "The Legislature", "The Judiciary", "Federalism", "Local Governments", "Political Parties", "Pressure Groups and Movements", "Challenges to Democracy"]
    },
      "Social Science": {
        "6-8": ["Timeline and Sources of History", "India, that is Bharat", "The beginnings of Indian civilization", "India's Cultural Roots", "Locating places on the Earth", "Oceans and continents", "Landforms and life", "Unity in Diversity", "Family and Community", "Grassroots Democracy", "Our Pasts", "The Earth - Our Habitat", "Social and Political Life"],
        "9-10": ["The French Revolution", "Socialism in Europe and the Russian Revolution", "Nazism and the Rise of Hitler", "Forest Society and Colonialism", "Pastoralists in the Modern World", "India - Size and Location", "Physical Features of India", "Drainage", "Climate", "Natural Vegetation and Wildlife", "Population", "Democracy in the Contemporary World", "What is Democracy? Why Democracy?", "Constitutional Design", "Electoral Politics", "Working of Institutions", "The Story of Village Palampur", "People as Resource", "Poverty as a Challenge", "Food Security in India"]
      },
      "Hindi": {
        "1-5": ["व्याकरण", "शब्द भंडार", "पठन कौशल", "लेखन कौशल", "साहित्य"],
        "6-8": ["व्याकरण", "शब्द भंडार", "पठन कौशल", "लेखन कौशल", "साहित्य", "कविता"],
        "9-10": ["व्याकरण", "लेखन कौशल", "साहित्य", "कविता", "नाटक", "निबंध"],
        "11-12": ["उच्च व्याकरण", "लेखन कौशल", "साहित्य", "कविता", "नाटक", "भाषा अध्ययन"]
      }
    },
    
    "icse/cisce": {
      "Mathematics": {
        "1-5": ["Numbers up to 100000", "Addition and Subtraction", "Multiplication and Division", "Fractions", "Decimals", "Measurement", "Geometry", "Time and Calendar", "Money", "Data Handling", "Patterns"],
        "6-8": ["Integers", "Fractions and Decimals", "Rational Numbers", "Simple Equations", "Lines and Angles", "Triangles", "Congruence of Triangles", "Comparing Quantities", "Practical Geometry", "Perimeter and Area", "Algebraic Expressions", "Exponents and Powers", "Direct and Inverse Proportions", "Factorisation", "Introduction to Graphs", "Playing with Numbers"],
        "9-10": ["Number Systems", "Polynomials", "Coordinate Geometry", "Linear Equations in Two Variables", "Introduction to Euclid's Geometry", "Lines and Angles", "Triangles", "Quadrilaterals", "Areas of Parallelograms and Triangles", "Circles", "Constructions", "Heron's Formula", "Surface Areas and Volumes", "Statistics", "Probability"],
        "11-12": ["Relations and Functions", "Inverse Trigonometric Functions", "Matrices", "Determinants", "Continuity and Differentiability", "Applications of Derivatives", "Integrals", "Applications of Integrals", "Differential Equations", "Vector Algebra", "Three Dimensional Geometry", "Linear Programming", "Probability", "Statistics"]
      },
      "Science": {
        "1-5": ["Plants Around Us", "Animals Around Us", "My Body", "Food and Health", "Water", "Air Around Us", "Weather", "Light and Shadow", "Sound", "Simple Machines", "Materials and Their Properties", "Safety and First Aid"],
        "6-8": ["Matter and Materials", "Physical and Chemical Changes", "Elements, Compounds and Mixtures", "Atomic Structure", "Water and Solutions", "Air and Atmosphere", "Light and Vision", "Heat and Temperature", "Sound and Hearing", "Force and Motion", "Simple Machines", "Energy", "Magnetism", "Electricity", "Cell Structure and Function", "Plant and Animal Tissues", "Nutrition in Plants and Animals", "Respiration", "Circulation", "Excretion", "Growth and Reproduction", "Health and Disease", "Ecosystems and Environment"],
        "9-10": ["Study of Matter", "Atomic Structure and Chemical Bonding", "Study of Acids, Bases and Salts", "Practical Chemistry", "Language of Chemistry", "Chemical Changes and Reactions", "Metals and Non-Metals", "Study of Compounds", "Organic Chemistry", "Practical Work", "Force and Pressure", "Work, Energy and Power", "Sound", "Light", "Current Electricity", "Magnetism", "Motion", "Heat and Energy"],
        "11-12": ["Modern Physics", "Atomic Physics", "Nuclear Physics", "Electronics", "Optics", "Waves", "Electricity and Magnetism", "Mechanics", "Thermodynamics", "Chemistry Practicals", "Physics Practicals"]
      },
      "English": {
        "1-5": ["Reading and Comprehension", "Phonics and Spelling", "Grammar Fundamentals", "Creative Writing", "Poetry and Rhymes", "Story Telling", "Vocabulary Building", "Handwriting Practice"],
        "6-8": ["Prose and Comprehension", "Poetry Appreciation", "Grammar and Usage", "Composition Writing", "Creative Expression", "Vocabulary Development", "Language Skills", "Literary Forms"],
        "9-10": ["Prose Studies", "Poetry Analysis", "Drama", "Grammar and Language Study", "Composition and Essay Writing", "Letter Writing", "Comprehension Skills", "Vocabulary Enhancement"],
        "11-12": ["Advanced Prose", "Poetry Criticism", "Drama Studies", "Language Work", "Composition Skills", "Project Work", "Communication Arts", "Literary Appreciation"]
      },
      "Geography": {
        "6-8": ["The Earth and the Universe", "Latitudes and Longitudes", "Motions of the Earth", "Maps and Diagrams", "Major Landforms of the Earth", "Our Country India", "The Northern Mountains", "The Northern Plains", "The Peninsular Plateau", "The Indian Desert", "The Coastal Plains", "The Islands", "Climate", "Natural Vegetation", "Wildlife", "Mineral and Power Resources", "Agriculture", "Industries", "Human Resources", "Transport", "Communication"],
        "9-10": ["India Location, Relief and Drainage", "India Climate, Natural Vegetation and Wildlife", "India Agriculture and Water Resources", "India Mineral and Power Resources", "India Industries and Transport", "India Population", "For Pleasure and Leisure", "Asia Location and Political Divisions", "Asia Physical Features", "Asia Climate and Natural Vegetation", "Asia Agriculture, Mineral and Power Resources", "Asia Industries Transport and Communication"],
        "11-12": ["Introduction to Geography", "The Earth", "Landforms", "Climate", "Natural Vegetation", "Soils", "Population", "Human Settlements", "Economic Geography", "Transport and Communication", "International Trade", "India Physical Features", "India Drainage System", "India Climate", "India Natural Vegetation", "India Population", "India Agriculture", "India Water Resources", "India Mineral and Energy Resources", "India Manufacturing Industries", "India Planning and Sustainable Development"]
      },
      "History & Civics": {
        "6-8": ["Early Civilizations", "Early Humans", "The First Cities", "What Books and Burials Tell Us", "Kingdoms Kings and an Early Republic", "New Questions and Ideas", "Ashoka The Emperor Who Gave Up War", "Vital Villages Thriving Towns", "Traders Kings and Pilgrims", "New Empires and Kingdoms", "Building Painting and Books", "The Mughal Empire", "The Sultans of Delhi", "Architecture", "A Changing World", "The British Power in India", "Our Constitution", "How the State Government Works", "How the Central Government Works", "Understanding Laws", "Understanding Media", "Understanding Advertising", "Markets Around Us", "A Shirt in the Market"],
        "9-10": ["The French Revolution", "The Industrial Revolution", "Rise of Nationalism in Europe", "The Making of a Global World", "Print Culture and the Modern World", "History and Sport", "Clothing: A Social History", "The Harappan Civilization", "The Vedic Age", "Rise of Jainism and Buddhism", "The Mauryan Empire", "The Age of the Guptas", "Medieval India", "The Mughal Empire", "The Company Rule in India", "India's Struggle for Independence", "Electoral Politics", "Working of Institutions", "Political Parties", "Outcomes of Democracy", "Challenges to Democracy"],
        "11-12": ["Ancient Indian History", "Medieval Indian History", "Modern Indian History", "Constitutional Development", "Political Processes", "Governance", "Indian National Movement", "Post Independence India", "Constitutional Framework", "Political System", "Electoral Process", "Local Government", "Constitutional Values"]
      },
      "Computer Applications": {
        "1-5": ["Introduction to Computers", "Parts of a Computer", "Operating a Computer", "Basic Applications", "Drawing and Painting", "Fun with Computers"],
        "6-8": ["Computer System", "Operating System Basics", "Word Processing", "Spreadsheets", "Presentations", "Internet Basics", "Email Communication", "Introduction to Programming"],
        "9-10": ["Computer Fundamentals", "Operating Systems", "Programming Methodology", "Programming in Java", "HTML", "Cascading Style Sheets", "Database Management Systems", "Boolean Logic", "Number Systems", "Communication and Open Source Concepts"]
      },
      "Hindi": {
        "1-5": ["हिंदी वर्णमाला", "मात्रा", "शब्द निर्माण", "वाक्य रचना", "कहानी", "कविता", "व्याकरण"],
        "6-8": ["गद्य", "पद्य", "व्याकरण", "रचना", "पत्र लेखन", "निबंध", "कहानी लेखन"],
        "9-10": ["गद्य खंड", "काव्य खंड", "व्याकरण", "रचना", "पत्र लेखन", "निबंध लेखन", "संवाद लेखन"],
        "11-12": ["गद्य संकलन", "काव्य संकलन", "व्याकरण", "रचना", "साहित्य का इतिहास", "भाषा विज्ञान"]
      },
      "Physics": {
        "9-10": ["Measurements and Experimentation", "Motion in One Dimension", "Laws of Motion", "Pressure in Fluids and Atmospheric Pressure", "Upthrust in Fluids, Archimedes' Principle and Floatation", "Heat and Energy", "Reflection of Light", "Propagation of Sound Waves", "Current Electricity", "Magnetism"],
        "11-12": ["Physical World and Measurement", "Kinematics", "Laws of Motion", "Work Energy and Power", "Rotational Motion", "Gravitation", "Properties of Matter", "Heat and Thermodynamics", "Kinetic Theory of Gases", "Oscillations and Waves"]
      },
      "Chemistry": {
        "9-10": ["Matter", "Physical and Chemical Changes", "Elements Compounds and Mixtures", "Atomic Structure and Chemical Bonding", "The Periodic Table", "Chemical Arithmetic and Chemical Equations", "Acids Bases and Salts", "Oxidation and Reduction", "Ammonia", "Nitric Acid", "Sulphuric Acid", "Organic Chemistry", "Practical Chemistry"],
        "11-12": ["Atomic Structure", "Chemical Bonding", "Study of Acids, Bases and Salts", "Analytical Chemistry", "Mole Concept and Stoichiometry", "Electrolysis", "Metallurgy", "Study of Compounds", "Organic Chemistry", "Practical Work"]
      },
      "Biology": {
        "9-10": ["Cell The Unit of Life", "Tissues", "Photosynthesis", "Transpiration", "Excretion", "Circulatory System", "The Nervous System", "The Sense Organs", "The Endocrine System", "Reproductive System", "Genetics", "Pollution"]
      },
      "Economics": {
        "9-10": ["Economics as a Social Science", "Consumer Behaviour", "Producer Behaviour", "Forms of Market and Price Determination", "National Income and Related Aggregates", "Money and Banking", "Government Budget and the Economy", "Balance of Payments", "Development", "Sectors of the Indian Economy", "Money and Credit", "Globalisation and the Indian Economy"],
        "11-12": ["Introduction to Economics", "Consumer Equilibrium and Demand", "Producer Behaviour and Supply", "Forms of Market and Price Determination", "National Income and Related Aggregates", "Money and Banking", "Determination of Income and Employment", "Government Budget and the Economy", "Balance of Payments", "Development", "Indian Economy on the Eve of Independence", "Indian Economy 1950-1990", "Economic Reforms since 1991", "Poverty", "Human Capital Formation in India", "Rural Development", "Employment Growth Informalisation and Related Issues", "Infrastructure", "Environment and Sustainable Development", "Development Experience of India"]
      },
      "Commercial Studies": {
        "9-10": ["Business Studies", "Banking", "Marketing", "Insurance", "Transport", "Communication", "Warehousing", "Advertising", "Consumer Protection"],
        "11-12": ["Business Organization", "Company Formation", "Business Finance", "Marketing Management", "Human Resource Management", "International Business"]
      },
      "Computer Applications": {
        "6-8": ["Computer System", "Operating System Basics", "Word Processing", "Spreadsheets", "Presentations", "Internet Basics", "Email Communication", "Introduction to Programming"],
        "9-10": ["Computer Fundamentals", "Operating Systems", "Programming Methodology", "Programming in Java", "HTML", "Cascading Style Sheets", "Database Management Systems", "Boolean Logic", "Number Systems", "Communication and Open Source Concepts"]
      },
      "Philosophy": {
        "11-12": ["Introduction to Philosophy", "Logic and Reasoning", "Ethics and Moral Philosophy", "Political Philosophy", "Metaphysics", "Epistemology", "Philosophy of Religion", "Indian Philosophy", "Contemporary Philosophy"]
      },
      "Sociology": {
        "11-12": ["Introducing Sociology", "Social Institutions", "Social Inequality and Exclusion", "The Challenges of Unity in Diversity", "Process of Social Change and Development", "Structural Change", "Cultural Change", "Change and Development in Rural Society", "Change and Development in Industrial Society", "Globalisation and Social Change", "Mass Media and Communications", "Social Movements"]
      },
      "Political Science": {
        "11-12": ["Political Theory Introduction", "What is Politics", "Freedom", "Equality", "Social Justice", "Rights", "Citizenship", "Nationalism", "Secularism", "Peace", "Development", "Constitution as a Living Document", "Rights in the Indian Constitution", "Election and Representation", "The Executive", "The Legislature", "The Judiciary", "Federalism", "Local Governments", "Political Parties", "Pressure Groups and Movements", "Challenges to Democracy"]
      },
      "Art & Craft": {
        "1-5": ["Drawing", "Coloring", "Paper Craft", "Clay Modeling", "Nature Art", "Festival Crafts"],
        "6-8": ["Fine Arts", "Applied Arts", "Traditional Art Forms", "Modern Art Techniques", "Craft Work", "Art History"],
        "9-10": ["Drawing and Painting", "Sculpture", "Applied Art", "Art History", "Creative Expression", "Art Appreciation"],
        "11-12": ["Advanced Drawing", "Painting Techniques", "Sculpture and Modeling", "Graphic Design", "Art Criticism", "Portfolio Development"]
      },
      "Physical Education": {
        "1-5": ["Basic Movements", "Simple Games", "Health and Hygiene", "Safety Rules", "Sports Activities"],
        "6-8": ["Physical Fitness", "Games and Sports", "Health Education", "First Aid", "Sports Rules", "Olympic Education"],
        "9-10": ["Sports and Games", "Physical Fitness", "Sports Psychology", "Sports Medicine", "Training Methods", "Sports Management"],
        "11-12": ["Advanced Sports Training", "Sports Psychology", "Exercise Physiology", "Sports Management", "Health and Fitness", "Yoga and Meditation"]
      },
      "History": {
        "11-12": ["Ancient Indian History", "Medieval Indian History", "Modern Indian History", "Constitutional Development", "Political Processes", "Governance", "Indian National Movement", "Post Independence India"]
      },
      "Commerce": {
        "11-12": ["Financial Accounting", "Partnership Accounts", "Company Accounts", "Analysis of Financial Statements", "Cash Flow Statement", "Business Studies", "Nature and Significance of Management", "Principles of Management", "Business Environment", "Planning", "Organising", "Staffing", "Directing", "Controlling", "Financial Management", "Financial Markets", "Marketing", "Consumer Protection", "Entrepreneurship Development"]
      },
      "Art & Craft": {
        "1-5": ["Drawing", "Coloring", "Paper Craft", "Clay Modeling", "Nature Art", "Festival Crafts"],
        "6-8": ["Fine Arts", "Applied Arts", "Traditional Art Forms", "Modern Art Techniques", "Craft Work", "Art History"],
        "9-10": ["Drawing and Painting", "Sculpture", "Applied Art", "Art History", "Creative Expression", "Art Appreciation"],
        "11-12": ["Advanced Drawing", "Painting Techniques", "Sculpture and Modeling", "Graphic Design", "Art Criticism", "Portfolio Development"]
      },
      "Physical Education": {
        "1-5": ["Basic Movements", "Simple Games", "Health and Hygiene", "Safety Rules", "Sports Activities"],
        "6-8": ["Physical Fitness", "Games and Sports", "Health Education", "First Aid", "Sports Rules", "Olympic Education"],
        "9-10": ["Sports and Games", "Physical Fitness", "Sports Psychology", "Sports Medicine", "Training Methods", "Sports Management"],
        "11-12": ["Advanced Sports Training", "Sports Psychology", "Exercise Physiology", "Sports Management", "Health and Fitness", "Yoga and Meditation"]
      },
      "Home Science": {
        "9-10": ["Food and Nutrition", "Clothing and Textiles", "Home Management", "Child Development", "Health and First Aid", "Consumer Education"],
        "11-12": ["Advanced Nutrition", "Food Science", "Textile Science", "Interior Decoration", "Family Resource Management", "Entrepreneurship"]
      },
      "Literature in English": {
        "9-10": ["Drama", "Short Stories", "Poetry", "Prose", "Novel Study", "Language Study", "Writing Skills"],
        "11-12": ["Drama Analysis", "Poetry Appreciation", "Prose Study", "Novel Analysis", "Literary Criticism", "Creative Writing", "Language Skills"]
      },
      "English Language": {
        "9-10": ["Composition Writing", "Letter Writing", "Comprehension", "Grammar", "Vocabulary", "Précis Writing", "Notice and Report Writing"],
        "11-12": ["Advanced Composition", "Directed Writing", "Comprehension Skills", "Advanced Grammar", "Language Functions", "Reading Skills"]
      },
      "Environmental Studies (EVS)": {
        "1-5": ["My Family and Me", "Plants Around Us", "Animals Around Us", "Food We Eat", "Water", "Air", "Weather and Climate", "Festivals and Celebrations", "Means of Transport", "Communication"]
      },
      "Biology": {
        "11-12": ["Living World", "Biological Classification", "Plant Kingdom", "Animal Kingdom", "Morphology of Plants", "Anatomy of Plants", "Structural Organisation in Animals", "Cell", "Biomolecules", "Cell Cycle", "Transport in Plants", "Mineral Nutrition", "Photosynthesis", "Respiration in Plants", "Plant Growth", "Digestion and Absorption", "Breathing and Exchange of Gases", "Body Fluids and Circulation", "Excretory Products", "Locomotion and Movement", "Neural Control", "Chemical Coordination", "Reproduction", "Sexual Reproduction", "Human Reproduction", "Reproductive Health", "Principles of Inheritance", "Molecular Basis of Inheritance", "Evolution", "Human Health and Disease", "Strategies for Enhancement", "Microbes in Human Welfare", "Biotechnology", "Biotechnology Applications", "Organisms and Populations", "Ecosystem", "Biodiversity", "Environmental Issues"]
      },
      "Computer Science": {
        "11-12": ["Problem Solving Using Computer", "Programming Methodology", "Introduction to Programming", "Programming in C++", "Arrays", "Functions", "Objects and Classes", "Constructors and Destructors", "Inheritance", "Stack", "Queue", "Boolean Algebra", "Communication and Network Concepts", "Database and SQL", "Practical Work"]
      }
    }
  }
};

export function getSubjectsForBoardAndGrade(board: string, grade: number): string[] {
  const gradeRange = getGradeRange(grade);
  const boardKey = getBoardKey(board);
  
  const subjects = (curriculumData.subjects as any)[boardKey]?.[gradeRange] || [];
  
  // Remove debug logging
  
  return subjects;
}

export function getTopicsForSubjectAndGrade(board: string, subject: string, grade: number): string[] {
  const gradeRange = getGradeRange(grade);
  const boardKey = getBoardKey(board);
  
  const boardTopics = (curriculumData.topics as any)[boardKey];
  if (!boardTopics) {
    return [];
  }
  
  const subjectTopics = boardTopics[subject];
  if (!subjectTopics) {
    return [];
  }

  // Try exact grade first, then grade range
  return subjectTopics[grade.toString()] || subjectTopics[gradeRange] || [];
}

function getBoardKey(board: string): string {
  let boardKey = board.toLowerCase().replace(/[^a-z]/g, '');
  if (boardKey === 'cbse' || boardKey === 'ncert' || boardKey === 'cbsencert') {
    return 'cbse/ncert';
  } else if (boardKey === 'icse' || boardKey === 'cisce' || boardKey === 'icsecisce') {
    return 'icse/cisce';
  }
  return boardKey;
}

function getGradeRange(grade: number): string {
  if (grade >= 1 && grade <= 5) return "1-5";
  if (grade >= 6 && grade <= 8) return "6-8";
  if (grade >= 9 && grade <= 10) return "9-10";
  if (grade >= 11 && grade <= 12) return "11-12";
  return "6-8";
}
