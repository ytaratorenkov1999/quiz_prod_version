class QuizApp {
    constructor() {
        this.currentCategory = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.questionHistory = [];
        this.selectedAnswers = {};
        this.confirmedAnswers = new Set();
        this.portalUrl = '/';

        this.init();
    }

    init() {
        try {
            this.cacheElements();
            this.attachEventListeners();
            this.validateQuestionsDatabase();
        } catch (error) {
            this.handleError('Ошибка инициализации приложения', error);
        }
    }

    cacheElements() {
        this.welcomeScreen = this.getElement('welcome-screen');
        this.categoryInfoScreen = this.getElement('category-info-screen');
        this.quizScreen = this.getElement('quiz-screen');
        this.resultsScreen = this.getElement('results-screen');
        this.categoryInfoIcon = this.getElement('category-info-icon');
        this.categoryInfoTitle = this.getElement('category-info-title');
        this.categoryInfoDescription = this.getElement('category-info-description');
        this.categoryInfoQuestions = this.getElement('category-info-questions');
        this.categoryInfoAge = this.getElement('category-info-age');
        this.categoryInfoBack = this.getElement('category-info-back');
        this.categoryInfoStart = this.getElement('category-info-start');
        this.questionText = this.getElement('question-text');
        this.questionImageContainer = this.getElement('question-image-container');
        this.answersContainer = this.getElement('answers-container');
        this.currentQuestionSpan = this.getElement('current-question');
        this.totalQuestionsSpan = this.getElement('total-questions');
        this.progressFill = this.getElement('progress-fill');
        this.nextBtn = this.getElement('next-btn');
        this.backBtn = this.getElement('back-btn');
        this.resultsIcon = this.getElement('results-icon');
        this.resultsTitle = this.getElement('results-title');
        this.finalScoreSpan = this.getElement('final-score');
        this.correctCountSpan = this.getElement('correct-count');
        this.incorrectCountSpan = this.getElement('incorrect-count');
        this.resultsMessage = this.getElement('results-message');
        this.percentageSpan = this.getElement('percentage');
        this.resultsQuestionsList = this.getElement('results-questions-list');

        this.exitBtn = this.getElement('exit-btn');

        this.exitModal = this.getElement('exit-modal');
        this.exitConfirm = this.getElement('exit-confirm');
        this.exitCancel = this.getElement('exit-cancel');
    }

    getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Элемент с ID "${id}" не найден`);
        }
        return element;
    }

    validateQuestionsDatabase() {
        if (typeof questionsDatabase === 'undefined') {
            throw new Error('База данных вопросов не загружена');
        }

        Object.keys(questionsDatabase).forEach(category => {
            const questions = questionsDatabase[category];
            if (!Array.isArray(questions)) {
                console.warn(`Категория "${category}" имеет некорректный формат`);
                return;
            }

            questions.forEach((q, index) => {
                if (!q.question || !Array.isArray(q.answers) || typeof q.correct !== 'number') {
                    console.warn(`Вопрос ${index + 1} в категории "${category}" имеет некорректный формат`);
                }
            });
        });
    }

    attachEventListeners() {
        if (this.exitBtn) {
            this.exitBtn.addEventListener('click', () => this.handleExitClick());
        }

        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                if (category) {
                    this.showCategoryInfo(category);
                }
            });
        });

        if (this.categoryInfoBack) {
            this.categoryInfoBack.addEventListener('click', () => {
                this.showScreen(this.welcomeScreen);
            });
        }

        if (this.categoryInfoStart) {
            this.categoryInfoStart.addEventListener('click', () => {
                if (this.selectedCategory) {
                    this.startQuiz(this.selectedCategory);
                }
            });
        }

        if (this.backBtn) {
            this.backBtn.addEventListener('click', () => this.goBack());
        }

        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => this.nextQuestion());
        }

        const playAgainBtn = this.getElement('play-again-btn');
        if (playAgainBtn) {
            playAgainBtn.addEventListener('click', () => {
                this.startQuiz(this.currentCategory);
            });
        }

        const changeCategoryBtn = this.getElement('change-category-btn');
        if (changeCategoryBtn) {
            changeCategoryBtn.addEventListener('click', () => {
                this.showScreen(this.welcomeScreen);
            });
        }

        if (this.exitConfirm) {
            this.exitConfirm.addEventListener('click', () => {
                this.returnToWelcomeScreen();
            });
        }

        if (this.exitCancel) {
            this.exitCancel.addEventListener('click', () => {
                this.hideExitModal();
            });
        }

        if (this.exitModal) {
            this.exitModal.addEventListener('click', (e) => {
                if (e.target === this.exitModal) {
                    this.hideExitModal();
                }
            });
        }
    }

    getCategoryData(category) {
        const categories = {
            cinema: {
                title: 'Кино',
                icon: '🎬',
                age: '12+',
                questions: 10,
                description: 'Проверьте свои знания о фильмах и кинематографе. Вопросы о классических и современных картинах.'
            },
            literature: {
                title: 'Литература',
                icon: '📚',
                age: '12+',
                questions: 10,
                description: 'Классические и современные произведения мировой литературы. Проверьте свою начитанность!'
            },
            school: {
                title: 'Школа',
                icon: '🏫',
                age: '6+',
                questions: 10,
                description: 'Вопросы из школьной программы по разным предметам. Вспомните школьные годы!'
            },
            ecology: {
                title: 'Экология',
                icon: '🌱',
                age: '12+',
                questions: 10,
                description: 'Окружающая среда, природа и экологические проблемы. Насколько вы экосознательны?'
            },
            cartoons: {
                title: 'Мультфильмы',
                icon: '🐭',
                age: '6+',
                questions: 10,
                description: 'Любимые персонажи и сюжеты из мультфильмов. Отличная викторина для всей семьи!'
            },
            art: {
                title: 'Искусство',
                icon: '🎨',
                age: '12+',
                questions: 10,
                description: 'Живопись, скульптура и другие виды искусства. Для настоящих ценителей прекрасного!'
            },
            geography: {
                title: 'География',
                icon: '🌍',
                age: '12+',
                questions: 10,
                description: 'Горы, реки, столицы и достопримечательности. Откройте для себя мир и проверьте свои знания о планете Земля!'
            },
            sport: {
                title: 'Спорт',
                icon: '⚽',
                age: '12+',
                questions: 10,
                description: 'Легендарные спортсмены, знаменитые матчи и спортивные дисциплины. Проверьте, кто здесь настоящий чемпион!'
            },
            music: {
                title: 'Музыка',
                icon: '🎵',
                age: '12+',
                questions: 10,
                description: 'Классические хиты, современные треки и великие композиторы. Узнайте, насколько богата ваша музыкальная коллекция!'
            },
            theater: {
                title: 'Театр',
                icon: '🎭',
                age: '12+',
                questions: 10,
                description: 'Великие пьесы, известные режиссеры и театральные традиции. Готовы ли вы к аплодисментам за свои знания?'
            },

            women_day: {
                title: 'Международный женский день',
                icon: '🌷',
                age: '16+',
                questions: 10,
                description: 'Проверьте свои знания! Вам предстоит угадывать имена великих женщин, их достижения и факты из истории.'
            },

            cinema_on_board: {
                title: 'Кино',
                icon: '🍿',
                age: '12+',
                questions: 10,
                description: 'Классика и современность большого экрана. Угадайте фильмы по детальному описанию сюжета, персонажей или ключевых событий. Смотрите на борту «Аэрофлота.'
            },

            cartoon_on_board: {
                title: 'Мультфильмы',
                icon: '🐱',
                age: '6+',
                questions: 10,
                description: 'Узнайте мультфильм по описанию сюжета, героев или знаменитых анимационных вселенных. Добро пожаловать в мир анимации! Смотрите на борту «Аэрофлота».'
            },

            butter_day: {
                title: 'Масленица',
                icon: '🥞',
                age: '12 +',
                questions: 10,
                description: 'Знаете ли вы традиции этого праздника? Угадывайте обычаи, символы и исторические факты о Масленице.'
            },

            audiobooks: {
                title: 'Аудиокниги',
                icon: '🎧',
                age: '12+',
                questions: 10,
                description: 'Любите литературу? Угадайте известные книги и их героев по описанию сюжета или характерным деталям из повествования. Слушайте на борту «Аэрофлота».'
            },

            geography_russia: {
                title: 'География России',
                icon: '🏔️',
                age: '12+',
                questions: 10,
                description: 'Мысленное путешествие по самой большой стране. Определяйте города, реки, горы и регионы России по их описанию.'
            }



        };
        return categories[category] || null;
    }

    showCategoryInfo(category) {
        try {
            const categoryData = this.getCategoryData(category);

            if (!categoryData) {
                throw new Error(`Категория "${category}" не найдена`);
            }

            this.safeSetText(this.categoryInfoIcon, categoryData.icon);
            this.safeSetText(this.categoryInfoTitle, categoryData.title);
            this.safeSetText(this.categoryInfoDescription, categoryData.description);
            this.safeSetText(this.categoryInfoQuestions, categoryData.questions);
            this.safeSetText(this.categoryInfoAge, categoryData.age);

            this.selectedCategory = category;
            this.showScreen(this.categoryInfoScreen);
        } catch (error) {
            this.handleError('Ошибка отображения информации о категории', error);
        }
    }

    handleExitClick() {
        if (this.welcomeScreen && this.welcomeScreen.classList.contains('active')) {
            this.exitToPortal();
        } else {
            this.showExitModal();
        }
    }

    showExitModal() {
        if (this.exitModal) {
            this.exitModal.classList.add('active');
        }
    }

    hideExitModal() {
        if (this.exitModal) {
            this.exitModal.classList.remove('active');
        }
    }

    returnToWelcomeScreen() {
        this.hideExitModal();
        this.showScreen(this.welcomeScreen);
        this.resetQuiz();
        this.resetResultsScroll();
    }

    exitToPortal() {
        window.location.href = this.portalUrl;
    }

    resetQuiz() {
        this.currentCategory = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.correctAnswers = 0;
        this.questionHistory = [];
        this.selectedAnswers = {};
        this.confirmedAnswers = new Set();
    }

    startQuiz(category) {
        try {
            if (!questionsDatabase[category]) {
                throw new Error(`Вопросы для категории "${category}" не найдены`);
            }

            this.currentCategory = category;
            this.questions = [...questionsDatabase[category]];
            this.currentQuestionIndex = 0;
            this.score = 0;
            this.correctAnswers = 0;
            this.questionHistory = [];
            this.selectedAnswers = {};
            this.confirmedAnswers = new Set();

            this.safeSetText(this.totalQuestionsSpan, this.questions.length);

            this.showScreen(this.quizScreen);
            this.loadQuestion();
        } catch (error) {
            this.handleError('Ошибка запуска викторины', error);
        }
    }

    loadQuestion() {
        try {
            const question = this.questions[this.currentQuestionIndex];

            if (!question) {
                throw new Error('Вопрос не найден');
            }

            this.safeSetText(this.currentQuestionSpan, this.currentQuestionIndex + 1);
            const progress = ((this.currentQuestionIndex + 1) / this.questions.length) * 100;
            if (this.progressFill) {
                this.progressFill.style.width = progress + '%';
                this.progressFill.parentElement.setAttribute('aria-valuenow', Math.round(progress));
            }

            this.loadQuestionImage(question.image);
            this.safeSetText(this.questionText, question.question);
            this.createAnswerButtons(question.answers);

            const savedAnswer = this.selectedAnswers[this.currentQuestionIndex];
            const isConfirmed = this.confirmedAnswers.has(this.currentQuestionIndex);

            if (savedAnswer !== undefined) {
                this.restoreAnswerState(savedAnswer, isConfirmed);
            } else {
                this.disableNextButton();
            }

            this.updateBackButton();
        } catch (error) {
            this.handleError('Ошибка загрузки вопроса', error);
        }
    }

    loadQuestionImage(imagePath) {
        if (!this.questionImageContainer) return;

        this.questionImageContainer.innerHTML = '';

        if (imagePath) {
            const imageWrapper = document.createElement('div');
            imageWrapper.className = 'question-image-wrapper';

            const placeholder = document.createElement('div');
            placeholder.className = 'question-image-placeholder';
            placeholder.innerHTML = '<div class="placeholder-spinner"></div>';

            const img = document.createElement('img');
            img.className = 'question-image';
            img.alt = 'Изображение вопроса';
            img.loading = 'lazy';
            img.style.opacity = '0';

            img.onload = () => {

                setTimeout(() => {
                    img.style.opacity = '1';
                    placeholder.style.opacity = '0';
                    setTimeout(() => {
                        placeholder.remove();
                    }, 300);
                }, 100);
            };

            img.onerror = () => {
                console.warn(`Не удалось загрузить изображение: ${imagePath}`);
                placeholder.innerHTML = '<div class="placeholder-error">📷</div>';
            };

            imageWrapper.appendChild(placeholder);
            imageWrapper.appendChild(img);
            this.questionImageContainer.appendChild(imageWrapper);
            img.src = imagePath;
        }
    }

    createAnswerButtons(answers) {
        if (!this.answersContainer) return;

        this.answersContainer.innerHTML = '';

        if (!Array.isArray(answers)) {
            console.warn('Ответы должны быть массивом');
            return;
        }

        answers.forEach((answer, index) => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.dataset.index = index;
            button.setAttribute('role', 'button');
            button.setAttribute('aria-label', `Ответ ${index + 1}`);

            button.textContent = this.sanitizeText(answer);

            button.addEventListener('click', () => this.selectAnswer(index));
            this.answersContainer.appendChild(button);
        });
    }

    restoreAnswerState(selectedIndex, isConfirmed) {
        try {
            const answerButtons = this.answersContainer.querySelectorAll('.answer-btn');

            answerButtons.forEach(btn => {
                btn.classList.remove('selected');
                if (isConfirmed) {
                    btn.classList.add('disabled');
                } else {
                    btn.classList.remove('disabled');
                }
            });

            if (selectedIndex !== undefined) {
                answerButtons[selectedIndex].classList.add('selected');
            }

            this.enableNextButton();
        } catch (error) {
            this.handleError('Ошибка восстановления состояния ответа', error);
        }
    }

    selectAnswer(selectedIndex) {
        try {
            if (this.confirmedAnswers.has(this.currentQuestionIndex)) {
                return;
            }

            const answerButtons = this.answersContainer.querySelectorAll('.answer-btn');

            this.selectedAnswers[this.currentQuestionIndex] = selectedIndex;

            answerButtons.forEach(btn => {
                btn.classList.remove('selected');
            });

            answerButtons[selectedIndex].classList.add('selected');

            setTimeout(() => {
                this.enableNextButton();
            }, 300);

        } catch (error) {
            this.handleError('Ошибка выбора ответа', error);
        }
    }
    nextQuestion() {
        try {
            this.confirmedAnswers.add(this.currentQuestionIndex);

            this.questionHistory.push(this.currentQuestionIndex);
            this.currentQuestionIndex++;

            if (this.currentQuestionIndex < this.questions.length) {
                this.loadQuestion();
            } else {
                this.showResults();
            }
        } catch (error) {
            this.handleError('Ошибка перехода к следующему вопросу', error);
        }
    }
    goBack() {
        if (this.questionHistory.length > 0) {
            this.currentQuestionIndex = this.questionHistory.pop();
            this.loadQuestion();
        } else {
            this.showExitModal();
        }
    }
    updateBackButton() {
        if (!this.backBtn) return;

        if (this.questionHistory.length === 0) {
            this.backBtn.style.opacity = '0.5';
        } else {
            this.backBtn.style.opacity = '1';
        }
    }

    enableNextButton() {
        if (!this.nextBtn) return;

        this.nextBtn.classList.add('active');
        this.nextBtn.disabled = false;
    }

    disableNextButton() {
        if (!this.nextBtn) return;

        this.nextBtn.classList.remove('active');
        this.nextBtn.disabled = true;
    }

    showResults() {
        try {
            this.correctAnswers = 0;
            this.score = 0;

            this.questions.forEach((question, index) => {
                const userAnswer = this.selectedAnswers[index];
                if (userAnswer === question.correct) {
                    this.correctAnswers++;
                    this.score += 10;
                }
            });
            const percentage = Math.round((this.correctAnswers / this.questions.length) * 100);
            const incorrectAnswers = this.questions.length - this.correctAnswers;
            this.safeSetText(this.finalScoreSpan, this.score);
            this.safeSetText(this.correctCountSpan, this.correctAnswers);
            this.safeSetText(this.incorrectCountSpan, incorrectAnswers);
            this.safeSetText(this.percentageSpan, percentage + '%');
            this.setResultsContent(percentage);
            this.createQuestionsList();
            this.resetResultsScroll();

            this.showScreen(this.resultsScreen);
        } catch (error) {
            this.handleError('Ошибка отображения результатов', error);
        }
    }

    resetResultsScroll() {
        try {
            if (this.resultsQuestionsList) {
                this.resultsQuestionsList.scrollTop = 0;

                requestAnimationFrame(() => {
                    this.resultsQuestionsList.scrollTop = 0;
                });
            }
        } catch (error) {
            console.warn('Ошибка сброса скролла результатов:', error);
        }
    }
    setResultsContent(percentage) {
        let icon, title, message;

        if (percentage >= 90) {
            icon = '🏆';
            title = 'Превосходно!';
            message = 'Вы настоящий эксперт! Фантастический результат! Ваши знания впечатляют!';
        } else if (percentage >= 70) {
            icon = '🌟';
            title = 'Отличная работа!';
            message = 'Вы показали отличные знания! Так держать! Продолжайте в том же духе!';
        } else if (percentage >= 50) {
            icon = '👍';
            title = 'Хороший результат!';
            message = 'Отличное начало! У Вас есть потенциал! Еще немного практики — и вы станете настоящим экспертом!';
        } else {
            icon = '💪';
            title = 'Есть к чему стремиться!';
            message = 'Каждая Ваша попытка — это новый опыт. Не останавливайтесь на достигнутом — впереди еще столько интересных вопросов и открытий!';
        }

        this.safeSetText(this.resultsIcon, icon);
        this.safeSetText(this.resultsTitle, title);
        this.safeSetText(this.resultsMessage, message);
    }

    createQuestionsList() {
        if (!this.resultsQuestionsList) return;
        this.resultsQuestionsList.innerHTML = '';
        this.resetResultsScroll();
        this.questions.forEach((question, index) => {
            const userAnswer = this.selectedAnswers[index];
            const isCorrect = userAnswer === question.correct;
            const userAnswerText = userAnswer !== undefined ? question.answers[userAnswer] : 'Не ответил';
            const correctAnswerText = question.answers[question.correct];

            const questionItem = document.createElement('div');
            questionItem.className = `results-question-item ${isCorrect ? 'correct' : 'incorrect'}`;

            const questionHeader = document.createElement('div');
            questionHeader.className = 'question-header';
            questionHeader.innerHTML = `
                <span class="question-number">Вопрос ${index + 1}</span>
                <span class="question-status ${isCorrect ? 'correct' : 'incorrect'}">
                    ${isCorrect ? '✓ Правильно' : '✗ Неправильно'}
                </span>
            `;

            const questionTextDiv = document.createElement('div');
            questionTextDiv.className = 'question-text';
            questionTextDiv.textContent = this.sanitizeText(question.question);

            const answersContainer = document.createElement('div');
            answersContainer.className = 'answers-container';

            const userAnswerDiv = document.createElement('div');
            userAnswerDiv.className = 'answer-row user-answer';
            userAnswerDiv.innerHTML = `
                <span class="answer-label">Ваш ответ:</span>
                <span class="answer-value">${this.sanitizeText(userAnswerText)}</span>
            `;
            answersContainer.appendChild(userAnswerDiv);

            if (!isCorrect) {
                const correctAnswerDiv = document.createElement('div');
                correctAnswerDiv.className = 'answer-row correct-answer';
                correctAnswerDiv.innerHTML = `
                    <span class="answer-label">Правильный ответ:</span>
                    <span class="answer-value">${this.sanitizeText(correctAnswerText)}</span>
                `;
                answersContainer.appendChild(correctAnswerDiv);
            }

            // Пояснение
            if (question.explanation) {
                const explanationDiv = document.createElement('div');
                explanationDiv.className = 'explanation-row';
                explanationDiv.innerHTML = `
                    <span class="explanation-icon">💡</span>
                    <span class="explanation-text">${this.sanitizeText(question.explanation)}</span>
                `;
                answersContainer.appendChild(explanationDiv);
            }

            questionItem.appendChild(questionHeader);
            questionItem.appendChild(questionTextDiv);
            questionItem.appendChild(answersContainer);

            this.resultsQuestionsList.appendChild(questionItem);
        });
        setTimeout(() => {
            this.resetResultsScroll();
        }, 100);
    }

    showScreen(screen) {
        if (!screen) return;

        try {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            screen.classList.add('active');

            window.scrollTo({ top: 0, behavior: 'smooth' });
            if (screen !== this.resultsScreen) {
                this.resetResultsScroll();
            }
        } catch (error) {
            this.handleError('Ошибка переключения экрана', error);
        }
    }

    safeSetText(element, text) {
        if (!element) return;
        element.textContent = String(text);
    }

    sanitizeText(text) {
        if (typeof text !== 'string') return '';
        return text.replace(/[<>]/g, '');
    }

    handleError(message, error) {
        console.error(message, error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        new QuizApp();
    } catch (error) {
        console.error('Критическая ошибка инициализации приложения:', error);
    }
});