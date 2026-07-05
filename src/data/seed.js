export const seedState = {
  route: "dashboard",
  routePayload: {},
  currentProjectId: "project-cet",
  currentFolderId: "folder-cet-1",
  importPreview: null,
  userName: "",
  settings: {
    fontSize: "medium",
    autoPlayAudio: false,
    showReference: true,
    dailyReminder: false,
    reminderTime: "20:00",
  },
  projectKeywords: ["satisfaction", "empathy", "adversity", "regret", "liberation"],
  cetVocabulary: [
    "satisfaction", "empathy", "adversity", "regret", "liberation",
    "wisdom", "creative", "trait", "novel", "curiosity", "ambiguity",
    "tolerate", "insight", "emerges", "cognitive", "flexibility"
  ],
  projects: [
    {
      id: "project-cet",
      title: "英语练习清单",
      description: "面向英语训练的统一项目，按试卷文件夹组织听力、阅读、词汇、翻译。",
      folders: [
        {
          id: "folder-cet-1",
          title: "模拟卷 ① · 真题风格",
          description: "包含听力填空、阅读理解、词汇表和翻译练习的完整模拟套卷。",
          modules: [
            {
              id: "mod-f1-reading-cloze",
              type: "reading",
              mode: "cloze",
              title: "阅读填空 · The Hidden Side of Happiness",
              summary: "选词填空，提交后查看正确答案与词汇高亮。",
              passage:
                "This broader definition of good living blends deep satisfaction and empathy. It is seasoned with nostalgia and regret, and sometimes only the trials of adversity can foster wisdom and creative insight.",
              items: [
                { id: "f1r1", type: "cloze", prompt: "deep ____", answer: "satisfaction", userAnswer: "", isCorrect: null },
                { id: "f1r2", type: "cloze", prompt: "nostalgia and ____", answer: "regret", userAnswer: "", isCorrect: null },
                { id: "f1r3", type: "cloze", prompt: "trials of ____", answer: "adversity", userAnswer: "", isCorrect: null },
              ],
            },
            {
              id: "mod-f1-reading-comp",
              type: "reading",
              mode: "comprehension",
              title: "阅读理解 · Digital Distraction",
              summary: "阅读理解，5 道单选题。",
              passage:
                "A growing body of research suggests that our constant connection to digital devices is reshaping how we think. A study published in the Journal of Cognitive Psychology found that the mere presence of a smartphone — even when turned off — reduces available cognitive capacity. Participants who left their phones in another room performed significantly better on tasks requiring sustained attention than those who kept their phones on the desk. The researchers argue that the brain subconsciously allocates resources to resist the urge to check the device, leaving fewer mental reserves for the task at hand. However, not all effects are negative. Some studies indicate that moderate use of digital tools can enhance multitasking abilities and information-processing speed in younger adults, suggesting that the relationship between technology and cognition is more nuanced than often portrayed.",
              items: [
                { id: "f1rc1", type: "mcq", question: "What is the main finding of the study?", options: ["A. Smartphones permanently damage cognitive ability", "B. The presence of a phone reduces mental capacity even when off", "C. Multitasking improves with phone usage", "D. Young adults are immune to digital distraction"], answer: "B", userAnswer: "", isCorrect: null },
                { id: "f1rc2", type: "mcq", question: "Why do phones affect performance according to the passage?", options: ["A. They emit harmful radiation", "B. The brain unconsciously resists the urge to check them", "C. Notifications constantly interrupt focus", "D. Phone screens cause eye strain"], answer: "B", userAnswer: "", isCorrect: null },
                { id: "f1rc3", type: "mcq", question: "The word 'nuanced' is closest in meaning to ____.", options: ["A. simple", "B. harmful", "C. complex", "D. obvious"], answer: "C", userAnswer: "", isCorrect: null },
                { id: "f1rc4", type: "mcq", question: "Which group benefited from moderate digital tool use?", options: ["A. Elderly adults", "B. Children under 12", "C. Younger adults", "D. All age groups equally"], answer: "C", userAnswer: "", isCorrect: null },
                { id: "f1rc5", type: "mcq", question: "What is the author's overall tone?", options: ["A. Entirely negative", "B. Balanced and measured", "C. Enthusiastically supportive", "D. Indifferent"], answer: "B", userAnswer: "", isCorrect: null },
              ],
            },
            {
              id: "mod-f1-listening-dict",
              type: "listening",
              mode: "dictation",
              title: "听力填空 · The Science of Creativity",
              summary: "主练习阶段不显示高亮，提交后进入精听训练层。",
              transcript:
                "Creative thinking is not a fixed trait reserved for artists and inventors. Research suggests that creative insight emerges when the brain combines existing knowledge with novel connections. This process depends on curiosity, emotional openness, and the willingness to tolerate ambiguity. People who regularly engage with unfamiliar ideas tend to develop stronger problem-solving skills over time.",
              items: [
                { id: "f1l1", type: "cloze", prompt: "Creative thinking is not a ____ trait", answer: "fixed", userAnswer: "", isCorrect: null },
                { id: "f1l2", type: "cloze", prompt: "the brain combines existing knowledge with ____ connections", answer: "novel", userAnswer: "", isCorrect: null },
                { id: "f1l3", type: "cloze", prompt: "depends on curiosity, emotional ____", answer: "openness", userAnswer: "", isCorrect: null },
                { id: "f1l4", type: "cloze", prompt: "the willingness to tolerate ____", answer: "ambiguity", userAnswer: "", isCorrect: null },
                { id: "f1l5", type: "cloze", prompt: "develop stronger ____ skills", answer: "problem-solving", userAnswer: "", isCorrect: null },
              ],
            },
            {
              id: "mod-f1-listening-comp",
              type: "listening",
              mode: "comprehension",
              title: "听力理解 · Campus Conversations",
              summary: "听力原题，8 道单选题，分两段对话。",
              transcript:
                "Conversation 1: W: Hey Mike, have you decided on your summer plans yet? M: I'm thinking about doing an internship at a tech company downtown. W: That sounds great! How did you find it? M: Actually, Professor Chen recommended me for the position. She said my project on interface design was impressive. W: Wow, connections really matter. Is it paid? M: Yes, it's a paid position, about 3000 yuan per month. I'll be working on their mobile app team. W: You're so lucky! I'm still looking for opportunities. M: You should talk to Professor Chen too. She mentioned they're still hiring for the design team. Conversation 2: M: Excuse me, I'm looking for the Career Development Center. W: It's on the third floor of the Administration Building, room 306. M: Thanks. Do you know if they help with resume writing? W: Absolutely. They offer one-on-one resume reviews every Tuesday and Thursday afternoon. M: Do I need to make an appointment? W: Yes, you can book online through the university portal. They also host mock interviews every month. M: That's really helpful. I'll check it out right now. Thank you!",
              items: [
                { id: "f1lc1", type: "mcq", conversation: 1, question: "What is the man planning to do this summer?", options: ["A. Travel abroad", "B. Do an internship", "C. Take summer courses", "D. Work at a restaurant"], answer: "B", userAnswer: "", isCorrect: null },
                { id: "f1lc2", type: "mcq", conversation: 1, question: "How did the man find the internship opportunity?", options: ["A. Through an online job board", "B. From a campus job fair", "C. Professor Chen recommended him", "D. His friend told him about it"], answer: "C", userAnswer: "", isCorrect: null },
                { id: "f1lc3", type: "mcq", conversation: 1, question: "How much is the monthly salary for the internship?", options: ["A. About 2000 yuan", "B. About 3000 yuan", "C. About 4000 yuan", "D. It is unpaid"], answer: "B", userAnswer: "", isCorrect: null },
                { id: "f1lc4", type: "mcq", conversation: 1, question: "What does the woman suggest the man should do?", options: ["A. Apply to more companies", "B. Focus on his studies instead", "C. Recommend her to the same company", "D. Talk to Professor Chen about openings"], answer: "D", userAnswer: "", isCorrect: null },
                { id: "f1lc5", type: "mcq", conversation: 2, question: "Where is the Career Development Center located?", options: ["A. First floor of the Library", "B. Second floor of the Student Center", "C. Third floor of the Administration Building", "D. Room 306 of the Teaching Building"], answer: "C", userAnswer: "", isCorrect: null },
                { id: "f1lc6", type: "mcq", conversation: 2, question: "What service does the center offer on Tuesdays and Thursdays?", options: ["A. Career counseling sessions", "B. One-on-one resume reviews", "C. Job interview workshops", "D. Company information sessions"], answer: "B", userAnswer: "", isCorrect: null },
                { id: "f1lc7", type: "mcq", conversation: 2, question: "How can students make an appointment?", options: ["A. By calling the center directly", "B. By visiting the office in person", "C. Through the university portal online", "D. By emailing the career advisor"], answer: "C", userAnswer: "", isCorrect: null },
                { id: "f1lc8", type: "mcq", conversation: 2, question: "What additional service does the center provide monthly?", options: ["A. Resume writing workshops", "B. Company visits", "C. Mock interviews", "D. Career aptitude tests"], answer: "C", userAnswer: "", isCorrect: null },
              ],
            },
            {
              id: "mod-f1-vocab",
              type: "vocabulary",
              title: "词汇表 · 模拟卷① 核心词汇",
              summary: "本套试卷的核心词汇，可直接导入闪卡复习。",
              vocabulary: [
                { id: "f1v1", word: "adversity", pos: "n.", zh: "逆境", context: "the trials of adversity can foster wisdom", mastered: false },
                { id: "f1v2", word: "cognitive", pos: "adj.", zh: "认知的", context: "reduces available cognitive capacity", mastered: false },
                { id: "f1v3", word: "nuanced", pos: "adj.", zh: "微妙的", context: "more nuanced than often portrayed", mastered: false },
                { id: "f1v4", word: "ambiguity", pos: "n.", zh: "模糊", context: "willingness to tolerate ambiguity", mastered: false },
                { id: "f1v5", word: "resilient", pos: "adj.", zh: "有弹性的", context: "make infrastructure resilient", mastered: false },
              ],
            },
            {
              id: "mod-f1-translation",
              type: "translation",
              title: "翻译练习 · 中译英",
              summary: "基于本套试卷主题的中译英练习。",
              items: [
                { id: "f1t1", type: "translation", source: "创造性思维并非艺术家和发明家的专属特质。", reference: "Creative thinking is not a fixed trait reserved for artists and inventors.", userAnswer: "", isCorrect: null },
                { id: "f1t2", type: "translation", source: "研究表明，当大脑将现有知识与新联系结合时，创造性洞察就会出现。", reference: "Research suggests that creative insight emerges when the brain combines existing knowledge with novel connections.", userAnswer: "", isCorrect: null },
                { id: "f1t3", type: "translation", source: "这个过程依赖于好奇心、情感开放和容忍模糊性的意愿。", reference: "This process depends on curiosity, emotional openness, and the willingness to tolerate ambiguity.", userAnswer: "", isCorrect: null },
                { id: "f1t4", type: "translation", source: "沿海城市正在投资防洪屏障和可吸收多余雨水的绿地。", reference: "Coastal cities are now investing in flood barriers and green spaces that can absorb excess rainwater.", userAnswer: "", isCorrect: null },
                { id: "f1t5", type: "translation", source: "现代城市规划者必须考虑如何使基础设施具有韧性。", reference: "Modern urban planners must consider how to make infrastructure resilient.", userAnswer: "", isCorrect: null },
              ],
            },
          ],
        },
        {
          id: "folder-cet-2",
          title: "模拟卷 ② · 进阶",
          description: "难度稍高的第二套模拟卷，新增多主题阅读和学术听力。",
          modules: [
            {
              id: "mod-f2-reading-cloze",
              type: "reading",
              mode: "cloze",
              title: "阅读填空 · The Art of Decision Making",
              summary: "进阶选词填空。",
              passage:
                "Effective decision making requires a delicate balance between intuition and analysis. While gut feelings can provide rapid assessments, they are often biased by past experiences. Systematic evaluation of evidence, by contrast, offers a more reliable framework but demands significant cognitive resources. The most successful decision makers learn to integrate both approaches.",
              items: [
                { id: "f2r1", type: "cloze", prompt: "balance between ____ and analysis", answer: "intuition", userAnswer: "", isCorrect: null },
                { id: "f2r2", type: "cloze", prompt: "often ____ by past experiences", answer: "biased", userAnswer: "", isCorrect: null },
                { id: "f2r3", type: "cloze", prompt: "Systematic ____ of evidence", answer: "evaluation", userAnswer: "", isCorrect: null },
                { id: "f2r4", type: "cloze", prompt: "demands significant ____ resources", answer: "cognitive", userAnswer: "", isCorrect: null },
                { id: "f2r5", type: "cloze", prompt: "learn to ____ both approaches", answer: "integrate", userAnswer: "", isCorrect: null },
              ],
            },
            {
              id: "mod-f2-listening-dict",
              type: "listening",
              mode: "dictation",
              title: "听力填空 · Global Trade Patterns",
              summary: "进阶听力填空。",
              transcript:
                "International trade has undergone dramatic transformations in the past decade. The rise of e-commerce platforms has enabled even small businesses to reach global markets. However, supply chain disruptions and geopolitical tensions have prompted many countries to reconsider their trade dependencies. Economists now emphasize the importance of diversification and regional cooperation.",
              items: [
                { id: "f2l1", type: "cloze", prompt: "undergone ____ transformations", answer: "dramatic", userAnswer: "", isCorrect: null },
                { id: "f2l2", type: "cloze", prompt: "supply chain ____", answer: "disruptions", userAnswer: "", isCorrect: null },
                { id: "f2l3", type: "cloze", prompt: "reconsider their trade ____", answer: "dependencies", userAnswer: "", isCorrect: null },
                { id: "f2l4", type: "cloze", prompt: "importance of ____", answer: "diversification", userAnswer: "", isCorrect: null },
                { id: "f2l5", type: "cloze", prompt: "____ cooperation", answer: "regional", userAnswer: "", isCorrect: null },
              ],
            },
            {
              id: "mod-f2-vocab",
              type: "vocabulary",
              title: "词汇表 · 模拟卷② 核心词汇",
              summary: "进阶词汇。",
              vocabulary: [
                { id: "f2v1", word: "intuition", pos: "n.", zh: "直觉", context: "balance between intuition and analysis", mastered: false },
                { id: "f2v2", word: "diversification", pos: "n.", zh: "多样化", context: "importance of diversification", mastered: false },
                { id: "f2v3", word: "disruption", pos: "n.", zh: "中断", context: "supply chain disruptions", mastered: false },
                { id: "f2v4", word: "integrate", pos: "v.", zh: "整合", context: "learn to integrate both approaches", mastered: false },
                { id: "f2v5", word: "geopolitical", pos: "adj.", zh: "地缘政治的", context: "geopolitical tensions", mastered: false },
              ],
            },
            {
              id: "mod-f2-translation",
              type: "translation",
              title: "翻译练习 · 中译英",
              summary: "进阶翻译练习。",
              items: [
                { id: "f2t1", type: "translation", source: "有效的决策需要在直觉和分析之间取得微妙的平衡。", reference: "Effective decision making requires a delicate balance between intuition and analysis.", userAnswer: "", isCorrect: null },
                { id: "f2t2", type: "translation", source: "电子商务平台的兴起使小企业也能进入全球市场。", reference: "The rise of e-commerce platforms has enabled even small businesses to reach global markets.", userAnswer: "", isCorrect: null },
                { id: "f2t3", type: "translation", source: "供应链中断和地缘政治紧张促使许多国家重新考虑贸易依赖。", reference: "Supply chain disruptions and geopolitical tensions have prompted many countries to reconsider their trade dependencies.", userAnswer: "", isCorrect: null },
              ],
            },
          ],
        },
      ],
    },
  ],
  mistakes: [],
  flashcards: [
    {
      id: "flash-base-1",
      word: "adversity",
      pos: "n.",
      zh: "逆境",
      context: "sometimes only the trials of adversity can foster wisdom and creative insight.",
      mastered: false,
    },
  ],
  studyLog: [],
  checkin: {
    today: new Date().toISOString().slice(0, 10),
    isCheckedIn: false,
    completedActions: [],
  },
};
