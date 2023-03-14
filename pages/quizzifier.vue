<template>
	<div class="container mx-auto flex justify-center">
		<div class="flex flex-col w-full justify-center py-8 gap-y-3">
			<Header title="quizzifier">
				<p>test ur knowledge</p>
			</Header>
			<ContentContainer>

				<!--
					Quiz Setup
				-->
				<div v-if="quizState == 'idle'" class="flex flex-col items-center">
					<h1 class="text-5xl mb-6">quiz setup</h1>

					<!-- questions selection -->
					<h2 class="text-4xl mb-4">questions</h2>
					<div class="flex flex-row gap-4 justify-center">
						<QuizSelector v-for="(source, key) in availableSources" :selected="quizSettings.source == key"
							v-on:click="quizSettings.source = key">
							<p>
								{{ key }}
							</p>
							<p class="text-sm text-gray-500 dark:text-gray-300">
								{{ source.desc }}
							</p>
						</QuizSelector>
					</div>

					<!-- quiz type selection -->
					<h1 class="text-4xl my-4">type</h1>
					<div class="flex flex-row gap-4 justify-center">
						<QuizSelector v-for="(type, key) in availableTypes" :selected="quizSettings.type == key"
							v-on:click="quizSettings.type = key">
							<p>
								{{ key }}
							</p>
							<p class="text-sm text-gray-500 dark:text-gray-300">
								{{ type.desc }}
							</p>
						</QuizSelector>
					</div>

					<div class="flex items-center justify-center text-3xl h-16 w-48 mt-12 bg-green-500 rounded-2xl cursor-pointer"
						v-on:click="startQuiz">
						let's quiz!
					</div>
				</div>

				<!--
					Quiz Finished
				-->
				<div v-else-if="quizState == 'finished' || quizState == 'quit'" class="flex flex-col items-center">
					<div class="text-4xl">
						<h1 v-if="quizState == 'finished'">quiz finished!</h1>
						<h1 v-else>quiz ended :(</h1>
					</div>
					<h2>category: {{ quizSettings.source }}</h2>

					<!-- GRADE -->
					<div class="flex flex-col mb-8">
						<span class="text-9xl font-extrabold font-sans" v-html="gradeHtml" />
					</div>

					<!-- correct/incorrect breakdown -->
					<div class="flex flex-col">
						<!-- show percentage surrounded by lines -->
						<div class="flex flex-row items-center mb-2">
							<div class="flex-grow h-0.5 bg-black/30 dark:bg-white/30"></div>
							<span class="text-sm mx-4">{{ correctPercentage }}%</span>
							<div class="flex-grow h-0.5 bg-black/30 dark:bg-white/30"></div>
						</div>
						<!-- correct | incorrect | unanswered(optional) -->
						<div class="flex flex-row">
							<QuizScoreElement :score="quizStats.correct" type="correct" color="bg-green-500" />
							<QuizScoreElement :score="quizStats.incorrect" type="incorrect" color="bg-red-600" />
							<QuizScoreElement v-if="quizType.questionsRemaining()" :score="quizType.questionsRemaining()"
								type="unanswered" color="bg-gray-500" />
						</div>
					</div>

					<div class="flex items-center justify-center text-3xl h-16 w-48 mt-8 bg-green-500 rounded-2xl cursor-pointer"
						v-on:click="restartQuiz()">
						new quiz
					</div>
				</div>

				<!--
					Quiz!
				-->
				<div class="w-full" v-else>

					<!--
						Buttons, progress, right/wrong, etc
					-->
					<div class="flex items-start mb-4">
						<!-- quit/cheat buttons -->
						<div class="flex justify-center items-center rounded-lg bg-red-700 w-16 h-8 cursor-pointer text-white"
							v-on:click="finishQuiz(true)">
							quit
						</div>

						<!-- score & progress -->
						<div class="flex flex-grow flex-col items-center justify-center">
							<div class="text-4xl">
								<span class="dark:text-green-400 text-green-500">{{ quizStats.correct }}</span> : <span
									class="dark:text-red-400 text-red-500">{{
										quizStats.incorrect }}</span>
							</div>
							<div class="text-xl" v-if="quizType.progressText() != null">
								{{ quizType.progressText() }}
							</div>

							<!-- progress bar -->
							<div v-if="quizType.progressText() != null" class="w-1/2 h-8 mt-2">
								<div class="w-full h-full bg-gray-300 dark:bg-slate-500 rounded-3xl overflow-clip">
									<div class="flex justify-end items-center h-full bg-blue-400 transition-all duration-300"
										:style="`width: ${quizType.progressValue()}%`">
										<p class="mr-2 text-white transition-all"
											:class="{ ['mr-2']: quizType.progressValue() > 5, ['-mr-6 text-black dark:text-white']: quizType.progressValue() <= 5 }">
											{{ Math.round(quizType.progressValue()) }}%
										</p>
									</div>
								</div>
							</div>
						</div>
						<!-- empty boi same width as quit button to balance out flex growiness -->
						<div class="flex justify-center items-center rounded-lg bg-violet-700 w-16 h-8 cursor-pointer"
							v-on:click="cheat_almostFinished" v-if="cheatingEnabled">
							cheat
						</div>
						<div class="w-16" v-else> </div>
					</div>

					<!--
						Quiz question!
					-->
					<div class="flex items-center flex-col gap-5 w-full overflow-clip" v-if="remainingAnswers != null">
						<!-- Image(s) (including placeholder used for animation) -->
						<div class="flex items-center flex-col w-full">
							<div :style="currentImageStyle">
								<img :src="currentAnswer.imagePath" class="h-48 sm:h-96 pointer-events-none" />
							</div>
							<div :style="lastImageStyle">
								<img :src="lastImage" class="h-48 sm:h-96 pointer-events-none"
									:style="guessAnimationStyle" />
							</div>
						</div>

						<!-- Correct answer display -->
						<div class="text-4xl mt-2 mb-3" v-if="guessState != 'idle'"
							:class="{ ['text-green-500']: guessState == 'correct', ['text-red-600']: guessState == 'incorrect' }">
							<span class="inline-block"
								:class="{ ['animate-spin']: guessState == 'correct', ['animate-ping']: guessState == 'incorrect' }">{{
									answerEmoji }}</span>
							{{ currentAnswer.correctAnswers[0] }}
							<span class="inline-block"
								:class="{ ['animate-spin']: guessState == 'correct', ['animate-ping']: guessState == 'incorrect' }">{{
									answerEmoji }}</span>
						</div>

						<!-- Guess input -->
						<input :style="`${guessState != 'idle' ? 'display:none' : ''}`"
							class="text-2xl sm:text-4xl dark:bg-slate-800 text-center w-1/2 m-2"
							placeholder="type your guess" v-on:keypress="guessPress" type="text" ref="guessInput"
							spellcheck="false" autocapitalize="off" autocomplete="off" autocorrect="off" />
					</div>

					<div v-else>
						loading quiz...
					</div>
				</div>
			</ContentContainer>
		</div>
	</div>
</template>

<script>
export default {
	layout: 'default',
	created() { document.title = 'quizzifier'; },
	data() {
		let availableSources = {
			flags: {
				desc: 'of (UN-defined) countries!',
				path: '/quizzifier/countries.json',
			}
		};

		let availableTypes = {
			infinite: {
				desc: 'random questions forever',
				onAnswer: (answer) => { },
				finished: () => false,
				progressText: () => null,
				progressValue: () => null,
				questionsRemaining: () => 0
			},
			all: {
				desc: 'all questions once',
				onAnswer: (answer) => { delete this.remainingAnswers[answer]; },
				finished: () => this.quizType.questionsRemaining() == 0,
				progressText: () => `${this.answeredCount}/${this.totalAnswersCount}`,
				progressValue: () => (this.answeredCount / this.totalAnswersCount) * 100,
				questionsRemaining: () => Object.keys(this.remainingAnswers).length
			}
		};

		return {
			quizState: 'idle',
			quizSettings: {
				source: '',
				type: ''
			},
			quizStats: {
				correct: 0,
				incorrect: 0
			},

			availableSources: availableSources,
			availableTypes: availableTypes,

			remainingAnswers: null,

			currentAnswer: {
				imagePath: null,
				correctAnswers: [],
				answerKey: ''
			},
			lastImage: '',
			guessState: 'idle'
		};
	},
	mounted() {
		this.quizSettings.source = Object.keys(this.availableSources)[0];
		this.quizSettings.type = Object.keys(this.availableTypes)[0];
	},
	computed: {
		cheatingEnabled() {
			return location.hostname == 'localhost';
		},
		cheat_almostFinished() {
			while (this.quizType.questionsRemaining() > 1) {
				delete this.remainingAnswers[this.currentAnswer.answerKey];
				this.selectNewAnswer();

				if (Math.random() < 0.01)
					this.quizStats.incorrect++;
				else
					this.quizStats.correct++;
			}
		},
		quizSource() {
			return this.availableSources[this.quizSettings.source].path;
		},
		quizType() {
			return this.availableTypes[this.quizSettings.type];
		},
		answeredCount() {
			return this.quizStats.correct + this.quizStats.incorrect;
		},
		totalAnswersCount() {
			return this.quizType.questionsRemaining() + this.answeredCount;
		},
		correctPercentage() {
			if (this.totalAnswersCount == 0)
				return 0;
			return Math.round((this.quizStats.correct / this.totalAnswersCount) * 100);
		},
		letterGrade() {
			let p = this.correctPercentage;

			if (p >= 100) return '✨S✨';
			if (p >= 97) return 'A+';
			if (p >= 93) return 'A';
			if (p >= 90) return 'A-';
			if (p >= 87) return 'B+';
			if (p >= 83) return 'B';
			if (p >= 80) return 'B-';
			if (p >= 77) return 'C+';
			if (p >= 73) return 'C';
			if (p >= 70) return 'C-';
			if (p >= 67) return 'D+';
			if (p >= 63) return 'D';
			if (p >= 60) return 'D-';
			return 'F';
		},
		gradeHtml() {
			let letter = this.letterGrade;
			let p = this.correctPercentage;

			let classes = 'text-red-500';

			if (p >= 100) classes = 'text-yellow-500';
			else if (p >= 90) classes = 'text-green-500';
			else if (p >= 80) classes = 'text-blue-600';
			else if (p >= 70) classes = 'text-yellow-400';
			else if (p >= 60) classes = 'text-orange-600';
			else classes = 'text-red-500';

			return `<span class="${classes}">${letter}</span>`;
		},
		answerEmoji() {
			return this.guessState == 'correct' ? '✨' : '❌';
		},
		lastImageTranslate() {
			return this.guessState == 'idle' ? '-100%' : '0%';
		},
		currentImageTranslate() {
			return this.guessState == 'idle' ? '0%' : '100%';
		},
		imageTransition() {
			let transitionDuration = '0s';

			if (this.guessState == 'idle')
				transitionDuration = '0.5s';

			return `transition-duration: ${transitionDuration};`;
		},

		currentImageStyle() {
			return {
				transform: `translate(${this.guessState == 'idle' ? '0%' : '500%'}, 0%)`,

				'transition-duration': `${this.guessState == 'idle' ? 1 : 0}s`,
			};
		},

		lastImageStyle() {
			return {
				position: 'absolute',
				transform: `translate(${this.guessState == 'idle' ? '-500%' : '0%'}, 0%)`,

				'transition-duration': `${this.guessState == 'idle' ? 1 : 0}s`,
			};
		},

		guessAnimationStyle() {
			let animation = 'none';
			if (this.guessState == 'correct')
				animation = 'squish 0.4s ease-in-out both';
			if (this.guessState == 'incorrect')
				animation = 'shake 0.3s ease-in-out both';

			return { animation: animation }
		}
	},
	methods: {
		startQuiz() {
			this.quizStats.correct = 0;
			this.quizStats.incorrect = 0;

			this.loadQuizDataFromUrl(this.quizSource);
		},
		restartQuiz() {
			this.quizState = 'idle';
		},
		finishQuiz(quit) {
			this.quizState = quit ? 'quit' : 'finished';
		},
		loadQuizDataFromUrl(url) {
			fetch(url)
				.then(response => response.json())
				.then(data => {
					this.remainingAnswers = data;
					this.selectNewAnswer();
					this.quizState = 'running';
				})
				.catch(error => {
					console.log(error);
				});
		},
		selectNewAnswer() {
			let quizKeys = Object.keys(this.remainingAnswers);
			let randomIndex = Math.floor(Math.random() * quizKeys.length);
			let randomKey = quizKeys[randomIndex];
			let newAnswer = this.remainingAnswers[randomKey];

			this.currentAnswer.imagePath = newAnswer.images[Math.floor(Math.random() * newAnswer.images.length)];
			this.currentAnswer.correctAnswers = newAnswer.answers;
			this.currentAnswer.answerKey = randomKey;

			setTimeout(() => {
				this.$refs.guessInput.focus();
			}, 10);
		},
		isCorrectAnswer(guess) {
			let sanitise = function (s) {
				return s.toLowerCase().trim().replace(' ', '');
			};

			let sanitisedCorrectAnswers = this.currentAnswer.correctAnswers.map(sanitise);
			return sanitisedCorrectAnswers.includes(sanitise(guess));
		},

		guessPress(event) {
			if (this.guessState != 'idle') return;

			if (event.key == 'Enter') {
				let guess = event.target.value;

				let isCorrect = this.isCorrectAnswer(guess);
				this.guessState = isCorrect ? 'correct' : 'incorrect';
				event.target.value = '';

				this.lastImage = this.currentAnswer.imagePath;

				this.quizType.onAnswer(this.currentAnswer.answerKey);

				if (isCorrect)
					this.quizStats.correct++;
				else
					this.quizStats.incorrect++;

				setTimeout(() => {
					this.guessState = 'idle';

					if (this.quizType.finished()) {
						this.finishQuiz();
					} else {
						this.selectNewAnswer();
					}
				}, 2000);
			}
		},

		levenshteinDistance(str1, str2) {
			const track = Array(str2.length + 1).fill(null).map(() =>
				Array(str1.length + 1).fill(null));
			for (let i = 0; i <= str1.length; i += 1) {
				track[0][i] = i;
			}
			for (let j = 0; j <= str2.length; j += 1) {
				track[j][0] = j;
			}
			for (let j = 1; j <= str2.length; j += 1) {
				for (let i = 1; i <= str1.length; i += 1) {
					const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
					track[j][i] = Math.min(
						track[j][i - 1] + 1, // deletion
						track[j - 1][i] + 1, // insertion
						track[j - 1][i - 1] + indicator, // substitution
					);
				}
			}
			return track[str2.length][str1.length];
		}
	}
}
</script>

<style>
@keyframes squish {
	0% {
		transform: scale(1);
	}

	10% {
		transform: scale(0.9, 1.1);
	}

	30% {
		transform: scale(1.075, 0.925);
	}

	60% {
		transform: scale(0.975, 1.025);
	}

	100% {
		transform: scale(1);
	}
}


@keyframes shake {
	0% {
		transform: translate(1px, 1px) rotate(0deg);
	}

	10% {
		transform: translate(-1px, -2px) rotate(-1deg);
	}

	20% {
		transform: translate(-3px, 0px) rotate(1deg);
	}

	30% {
		transform: translate(3px, 2px) rotate(0deg);
	}

	40% {
		transform: translate(1px, -1px) rotate(1deg);
	}

	50% {
		transform: translate(-1px, 2px) rotate(-1deg);
	}

	60% {
		transform: translate(-3px, 1px) rotate(0deg);
	}

	70% {
		transform: translate(3px, 1px) rotate(-1deg);
	}

	80% {
		transform: translate(-1px, -1px) rotate(1deg);
	}

	90% {
		transform: translate(1px, 2px) rotate(0deg);
	}

	100% {
		transform: translate(0px, 0px) rotate(0deg);
	}
}</style>