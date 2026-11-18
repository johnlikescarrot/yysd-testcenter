"""Danh mục công trình học thuật làm nguồn cho thư viện PDF tiếng Việt.

Mỗi mục: tác giả | năm | nhan đề | nguồn. Liên kết scholar.google.com
được tạo tự động từ nhan đề và tác giả.
"""

RAW = """Alderson, J. C., Clapham, C., & Wall, D.|1995|Language Test Construction and Evaluation|Cambridge University Press
Alderson, J. C.|2000|Assessing Reading|Cambridge University Press
Bachman, L. F.|1990|Fundamental Considerations in Language Testing|Oxford University Press
Bachman, L. F., & Palmer, A. S.|1996|Language Testing in Practice|Oxford University Press
Bachman, L. F., & Palmer, A. S.|2010|Language Assessment in Practice|Oxford University Press
Buck, G.|2001|Assessing Listening|Cambridge University Press
Chapelle, C. A., & Douglas, D.|2006|Assessing Language through Computer Technology|Cambridge University Press
Council of Europe|2001|Common European Framework of Reference for Languages|Council of Europe Publishing
Council of Europe|2020|CEFR Companion Volume with New Descriptors|Council of Europe Publishing
Fulcher, G.|2010|Practical Language Testing|Hodder Education
Fulcher, G., & Davidson, F.|2007|Language Testing and Assessment: An Advanced Resource Book|Routledge
Green, A.|2007|IELTS Washback in Context: Preparation for Academic Writing in Higher Education|Cambridge University Press
Green, A.|2007|Washback to learning outcomes: a comparative study of IELTS preparation courses|Assessment in Education, 14(1), 75-97
Khalifa, H., & Weir, C. J.|2009|Examining Reading: Research and Practice in Assessing Second Language Reading|Cambridge University Press
Luoma, S.|2004|Assessing Speaking|Cambridge University Press
Messick, S.|1989|Validity|R. L. Linn (Ed.), Educational Measurement
Moore, T., & Morton, J.|2007|Authenticity in the IELTS Academic Module Writing test|Studies in Language Testing 19
Purpura, J. E.|2004|Assessing Grammar|Cambridge University Press
Read, J.|2000|Assessing Vocabulary|Cambridge University Press
Shaw, S. D., & Weir, C. J.|2007|Examining Writing: Research and Practice in Assessing Second Language Writing|Cambridge University Press
Taylor, L.|2011|Examining Speaking: Research and Practice in Assessing Second Language Speaking|Cambridge University Press
Weigle, S. C.|2002|Assessing Writing|Cambridge University Press
Weir, C. J.|2005|Language Testing and Validation: An Evidence-Based Approach|Palgrave Macmillan
Qi, L.|2007|Is testing an efficient agent for pedagogical change?|Assessment in Education, 14(1), 51-74
Lewthwaite, M.|2007|Teacher and student attitudes to IELTS writing tasks|UGRU Journal, 5, 1-16
Ginther, A.|2002|Context and content visuals and performance on listening comprehension stimuli|Language Testing, 19(2), 133-167
Vandergrift, L., & Goh, C. C. M.|2012|Teaching and Learning Second Language Listening: Metacognition in Action|Routledge
Goh, C. C. M.|2000|A cognitive perspective on language learners' listening comprehension problems|System, 28(1), 55-75
Vandergrift, L.|2007|Recent developments in second and foreign language listening comprehension research|Language Teaching, 40(3), 191-210
Field, J.|2008|Listening in the Language Classroom|Cambridge University Press
Urquhart, S., & Weir, C. J.|1998|Reading in a Second Language: Process, Product and Practice|Longman
Grabe, W.|2009|Reading in a Second Language: Moving from Theory to Practice|Cambridge University Press
Grabe, W., & Stoller, F. L.|2011|Teaching and Researching Reading|Routledge
Kintsch, W.|1998|Comprehension: A Paradigm for Cognition|Cambridge University Press
Perfetti, C. A.|1985|Reading Ability|Oxford University Press
Stanovich, K. E.|2000|Progress in Understanding Reading|Guilford Press
Carrell, P. L.|1987|Content and formal schemata in ESL reading|TESOL Quarterly, 21(3), 461-481
Hyland, K.|2002|Teaching and Researching Writing|Longman
Hyland, K.|2006|English for Academic Purposes: An Advanced Resource Book|Routledge
Swales, J. M.|1990|Genre Analysis: English in Academic and Research Settings|Cambridge University Press
Connor, U.|1996|Contrastive Rhetoric: Cross-Cultural Aspects of Second-Language Writing|Cambridge University Press
Kaplan, R. B.|1966|Cultural thought patterns in inter-cultural education|Language Learning, 16(1-2), 1-20
Bitchener, J., & Knoch, U.|2010|The contribution of written corrective feedback to language development|Applied Linguistics, 31(2), 193-214
Ferris, D. R.|2002|Treatment of Error in Second Language Student Writing|University of Michigan Press
Ellis, R.|2009|Corrective feedback and teacher development|L2 Journal, 1(1), 3-18
Skehan, P.|1998|A Cognitive Approach to Language Learning|Oxford University Press
Swain, M.|1985|Communicative competence: Some roles of comprehensible input and output|Input in Second Language Acquisition
Schmidt, R.|1990|The role of consciousness in second language learning|Applied Linguistics, 11(2), 129-158
Krashen, S. D.|1982|Principles and Practice in Second Language Acquisition|Pergamon
Canale, M., & Swain, M.|1980|Theoretical bases of communicative approaches to second language teaching and testing|Applied Linguistics, 1(1), 1-47
Biber, D., Johansson, S., Leech, G., Conrad, S., & Finegan, E.|1999|Longman Grammar of Spoken and Written English|Longman
Coxhead, A.|2000|A new academic word list|TESOL Quarterly, 34(2), 213-238
Nation, I. S. P.|2001|Learning Vocabulary in Another Language|Cambridge University Press
Nation, I. S. P.|2006|How large a vocabulary is needed for reading and listening?|Canadian Modern Language Review, 63(1), 59-82
Schmitt, N.|2010|Researching Vocabulary: A Vocabulary Research Manual|Palgrave Macmillan
Read, J.|2004|Research in teaching vocabulary|Annual Review of Applied Linguistics, 24, 146-161
Webb, S.|2007|The effects of repetition on vocabulary knowledge|Applied Linguistics, 28(1), 46-65
Laufer, B., & Hulstijn, J.|2001|Incidental vocabulary acquisition in a second language: task-based involvement load|Applied Linguistics, 22(1), 1-26
Hulstijn, J. H.|2001|Intentional and incidental second-language vocabulary learning|Cognition and Second Language Instruction
Ebbinghaus, H.|1913|Memory: A Contribution to Experimental Psychology|Teachers College, Columbia University
Pimsleur, P.|1967|A memory schedule|The Modern Language Journal, 51(2), 73-75
Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D.|2006|Distributed practice in verbal recall tasks: A review and quantitative synthesis|Psychological Bulletin, 132(3), 354-380
Cepeda, N. J., Vul, E., Rohrer, D., Wixted, J. T., & Pashler, H.|2008|Spacing effects in learning: A temporal ridgeline of optimal retention|Psychological Science, 19(11), 1095-1102
Roediger, H. L., & Karpicke, J. D.|2006|Test-enhanced learning: Taking memory tests improves long-term retention|Psychological Science, 17(3), 249-255
Karpicke, J. D., & Roediger, H. L.|2008|The critical importance of retrieval for learning|Science, 319(5825), 966-968
Dunlosky, J., Rawson, K. A., Marsh, E. J., Nathan, M. J., & Willingham, D. T.|2013|Improving students' learning with effective learning techniques|Psychological Science in the Public Interest, 14(1), 4-58
Kang, S. H. K.|2016|Spaced repetition promotes efficient and effective learning|Policy Insights from the Behavioral and Brain Sciences, 3(1), 12-19
Bjork, R. A.|1994|Memory and metamemory considerations in the training of human beings|Metacognition
Baddeley, A. D.|1992|Working memory|Science, 255(5044), 556-559
Settles, B., & Meeder, B.|2016|A trainable spaced repetition model for language learning|Proceedings of the 54th Annual Meeting of the ACL, 1848-1858
Pavlik, P. I., & Anderson, J. R.|2008|Using a model to compute the optimal schedule of practice|Journal of Experimental Psychology: Applied, 14(2), 101-117
Lindsey, R. V., Shroyer, J. D., Pashler, H., & Mozer, M. C.|2014|Improving students' long-term knowledge retention through personalized review|Psychological Science, 25(3), 639-647
Wozniak, P., & Gorzelanczyk, E. J.|1994|Optimization of repetition spacing in the practice of learning|Acta Neurobiologiae Experimentalis, 54, 59-62
Yancey, K. P., & Settles, B.|2020|A sleeping, recovering bandit algorithm for optimizing recurring notifications|Proceedings of the 26th ACM SIGKDD Conference, 3008-3016
De Loof, E., Ergo, K., Naert, L., Janssens, C., Talsma, D., Van Opstal, F., & Verguts, T.|2018|Signed reward prediction errors drive declarative learning|PLOS ONE, 13(1), e0189212
Deterding, S., Dixon, D., Khaled, R., & Nacke, L.|2011|From game design elements to gamefulness: Defining gamification|Proceedings of the 15th International Academic MindTrek Conference
Hamari, J., Koivisto, J., & Sarsa, H.|2014|Does gamification work? A literature review of empirical studies on gamification|Proceedings of the 47th Hawaii International Conference on System Sciences
Deci, E. L., Koestner, R., & Ryan, R. M.|1999|A meta-analytic review of experiments examining the effects of extrinsic rewards on intrinsic motivation|Psychological Bulletin, 125(6), 627-668
Ryan, R. M., & Deci, E. L.|2000|Self-determination theory and the facilitation of intrinsic motivation|American Psychologist, 55(1), 68-78
Locke, E. A., & Latham, G. P.|2002|Building a practically useful theory of goal setting and task motivation|American Psychologist, 57(9), 705-717
Bandura, A.|1997|Self-Efficacy: The Exercise of Control|W. H. Freeman
Csikszentmihalyi, M.|1990|Flow: The Psychology of Optimal Experience|Harper & Row
Zimmerman, B. J.|2002|Becoming a self-regulated learner: An overview|Theory Into Practice, 41(2), 64-70
Oxford, R. L.|1990|Language Learning Strategies: What Every Teacher Should Know|Newbury House
O'Malley, J. M., & Chamot, A. U.|1990|Learning Strategies in Second Language Acquisition|Cambridge University Press
Huynh, D., Zuo, L., & Iida, H.|2016|Analyzing gamification of Duolingo with focus on its course structure|Games and Learning Alliance, LNCS 10056, 268-277
Huynh, D., & Iida, H.|2017|An analysis of winning streak's effects in language course of Duolingo|International Conference on Games and Learning
Shortt, M., Tilak, S., Kuznetcova, I., Martens, B., & Akinkuolie, B.|2021|Gamification in mobile-assisted language learning: A systematic review of Duolingo literature|Computer Assisted Language Learning, 34(7), 517-554
Loewen, S., Crowther, D., Isbell, D. R., Kim, K. M., Maloney, J., Miller, Z. F., & Rawal, H.|2019|Mobile-assisted language learning: A Duolingo case study|ReCALL, 31(3), 293-311
Jiang, X., Rollinson, J., Plonsky, L., Gustafson, E., & Pajak, B.|2022|Evaluating the reading and listening outcomes of beginning-level Duolingo courses|Foreign Language Annals, 54(4), 974-1002
Rachels, J. R., & Rockinson-Szapkiw, A. J.|2018|The effects of a mobile gamification app on elementary students' Spanish achievement and self-efficacy|Computer Assisted Language Learning, 31(1-2), 72-89
Vesselinov, R., & Grego, J.|2012|Duolingo Effectiveness Evaluation Study|City University of New York
Dehghanzadeh, H., Fardanesh, H., Hatami, J., Talaee, E., & Noroozi, O.|2021|Using gamification to support learning English as a second language: A systematic review|Computer Assisted Language Learning, 34(7), 934-957
Kukulska-Hulme, A., & Shield, L.|2008|An overview of mobile assisted language learning|ReCALL, 20(3), 271-289
Stockwell, G.|2010|Using mobile phones for vocabulary activities: Examining the effect of the platform|Language Learning & Technology, 14(2), 95-110
Godwin-Jones, R.|2011|Emerging technologies: Mobile apps for language learning|Language Learning & Technology, 15(2), 2-11
Burston, J.|2013|Mobile-assisted language learning: A selected annotated bibliography|Language Learning & Technology, 17(3), 157-225
Karpicke, J. D., & Bauernschmidt, A.|2011|Spaced retrieval: Absolute spacing enhances learning regardless of relative spacing|Journal of Experimental Psychology: Learning, Memory, and Cognition, 37(5), 1250-1257
Kornell, N., & Bjork, R. A.|2008|Optimising self-regulated study: The benefits and costs of dropping flashcards|Memory, 16(2), 125-136
Biber, D., Gray, B., & Poonpon, K.|2011|Should we use characteristics of conversation to measure grammatical complexity in L2 writing development?|TESOL Quarterly, 45(1), 5-35
Hinkel, E.|2002|Second Language Writers' Text: Linguistic and Rhetorical Features|Lawrence Erlbaum
Paltridge, B.|2001|Genre and the Language Learning Classroom|University of Michigan Press
Flowerdew, J.|1993|An educational, or process, approach to the teaching of professional genres|ELT Journal, 47(4), 305-316
Douglas, D.|2000|Assessing Languages for Specific Purposes|Cambridge University Press
Xi, X.|2010|How do we go about investigating test fairness?|Language Testing, 27(2), 147-170
Kane, M. T.|2006|Validation|R. L. Brennan (Ed.), Educational Measurement
Cronbach, L. J.|1971|Test validation|R. L. Thorndike (Ed.), Educational Measurement
Canale, M.|1983|From communicative competence to communicative language pedagogy|Language and Communication
Widdowson, H. G.|1978|Teaching Language as Communication|Oxford University Press
Hymes, D. H.|1972|On communicative competence|Sociolinguistics"""

REFERENCES = []
for _line in RAW.strip().splitlines():
    _a, _y, _t, _s = _line.split('|')
    REFERENCES.append((_a, int(_y), _t, _s))
