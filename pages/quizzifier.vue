<template>
	<div class="container mx-auto flex justify-center">
		<div class="flex flex-col w-full justify-center py-8 gap-y-3">
			<Header title="quizzifier">
			</Header>
			<ContentContainer>
				<div class="flex items-center flex-col gap-5 w-full" v-if="quizData != null">
					<div class="w-fit">
						<img :src="currentAnswer.imagePath" class="h-96" />
					</div>
					<div class="text-4xl p-1" v-if="guessState != 'idle'"
						:class="{ ['text-green-500']: guessState == 'correct', ['text-red-600']: guessState == 'incorrect' }">
						<span class="inline-block" :class="{['animate-spin']: guessState=='correct', ['animate-ping']: guessState=='incorrect'}">{{ answerEmoji }}</span>
						{{ currentAnswer.correctAnswers[0] }}
						<span class="inline-block" :class="{['animate-spin']: guessState=='correct', ['animate-ping']: guessState=='incorrect'}">{{ answerEmoji }}</span>
					</div>
					<input v-if="guessState == 'idle'" class="text-4xl dark:bg-slate-800 text-center w-1/2" placeholder="type your guess"
						v-on:keypress="guessPress" type="text" ref="guessInput" />
				</div>
				<div v-else>
					loading quiz...
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
		return {
			quizData: null,
			currentAnswer: {
				imagePath: null,
				correctAnswers: []
			},
			guessState: 'idle'
		};
	},
	mounted() {
		this.loadQuizDataFromUrl('/quizzifier/countries.json');
	},
	computed: {
		answerEmoji() {
			return this.guessState == 'correct' ? '✨' : '❌';
		}
	},
	methods: {
		loadQuizDataFromUrl(url) {
			fetch(url)
				.then(response => response.json())
				.then(data => {
					this.quizData = data;
					this.selectNewAnswer();
				})
				.catch(error => {
					console.log(error);
				});
		},
		selectNewAnswer() {
			let quizKeys = Object.keys(this.quizData);
			let randomIndex = Math.floor(Math.random() * quizKeys.length);
			let newAnswer = this.quizData[quizKeys[randomIndex]];

			this.currentAnswer.imagePath = newAnswer.images[Math.floor(Math.random() * newAnswer.images.length)];
			this.currentAnswer.correctAnswers = newAnswer.answers;
		
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

				setTimeout(() => {
					this.guessState = 'idle';
					this.selectNewAnswer();
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