const log = console.log;
const app = new PIXI.Application(1280, 720);

var reels = [];

document.getElementById('container').appendChild(app.view);

const loader = new PIXI.Loader();

var DEBUG = 0;

var BET_STEP = 0, BET_VALUE = [1, 2, 4, 6, 10, 20, 50, 100], BALANCE = 5000;

loader
	.add("bg", "img/bg.png")
	.add("3bar", "img/3bar.png")
	.add("1bar", "img/bar.png")
	.add("2bar", "img/2bar.png")
	.add("seven", "img/7.png")
	.add("cherry", "img/cherry.png")
	.load(onImagesLoaded);


function onImagesLoaded() {
	var slotTextures = [
		PIXI.Texture.from("3bar"),
		PIXI.Texture.from("1bar"),
		PIXI.Texture.from("2bar"),
		PIXI.Texture.from("seven"),
		PIXI.Texture.from("cherry"),
	];

	var REEL_WIDTH = 140;
	var SYMBOL_SIZE = 140;


	// Add bg to container
	var bg = new PIXI.Container();
	var bg_img = new PIXI.Sprite.from("bg");
	bg_img.x = 0;
	bg_img.y = 0;
	bg.addChild(bg_img);


	//Build the reels
	//var reels = [];
	var reelContainer = new PIXI.Container();
	for (var i = 0; i < 3; i++) {
		var rc = new PIXI.Container();
		rc.x = i * REEL_WIDTH;
		reelContainer.addChild(rc);

		var reel = {
			container: rc,
			symbols: [],
			position: 0,
			previousPosition: 0,
			blur: new PIXI.filters.BlurFilter()
		};
		reel.blur.blurX = 0;
		reel.blur.blurY = 0;
		rc.filters = [reel.blur];

		//Build the symbols
		for (var j = 0; j < 5; j++) {
			var symbol = new PIXI.Sprite(slotTextures[j]);
			//Scale the symbol to fit symbol area.
			symbol.y = j * SYMBOL_SIZE;
			symbol.scale.x = symbol.scale.y = Math.min(SYMBOL_SIZE / symbol.width, SYMBOL_SIZE / symbol.height);
			symbol.x = Math.round((SYMBOL_SIZE - symbol.width) / 2);
			reel.symbols.push(symbol);
			rc.addChild(symbol);
		}
		reels.push(reel);
	}
	app.stage.addChild(reelContainer);

	// add background to the stage
	app.stage.addChild(bg);

	// Position of the reel
	var margin = (app.screen.height - SYMBOL_SIZE * 3) / 2;
	reelContainer.y = margin;
	reelContainer.x = Math.round(app.screen.width - REEL_WIDTH * 3) / 2;


	//Set the interactivity.
	document.getElementById('spin').addEventListener("pointerdown", function () {
		startPlay();
	});

	var running = false;

	//Function to start playing.
	function startPlay() {
		if (running) return;
		running = true;

		// check balance
		if (BET_VALUE[BET_STEP] > BALANCE) {
			running = false;
			alert('Need more money');
			return;
		}

		// remove highlights from paytable if present
		let paytable = document.getElementsByClassName("paytable__row");
		Object.keys(paytable).forEach(function (key) {
			if (paytable[key].classList.contains("winning")) {
				paytable[key].classList.remove("winning");
			}

		});

		// update balance and display it
		BALANCE -= BET_VALUE[BET_STEP];
		document.getElementById('balance').innerHTML = BALANCE;


		for (var i = 0; i < reels.length; i++) {
			var r = reels[i];
			// tweenTo(object, property, target, time, easing, onchange, oncomplete)
			var target = targets.generate(i, r.position);
			tweenTo(r, "position", target[i], 2000 + i * 500, ease(0.6), null, i == reels.length - 1 ? reelsComplete : null);
		}
	}


	// Generate reel targets (predefined or random)
	targets = {
		target: [0, 0, 0],
		target_temp: [0, 0 ,0],
		generate: function (reel, reel_pos) {
			if (DEBUG) {
				// 2bar = 0;  1bar = 1; 3bar = 2; Cherry = 3; Seven = 4
				let reel_value = { 'top': -0.5, 'mid': 0, 'bottom': 0.5 };
				let fix_reel = document.querySelector('input[name="fix-win-reel"]:checked').value;
				let fix_payout = document.querySelector('input[name="fix-win-pay"]:checked').value;
				let bar1_value = ["1", "6"];
				let bar2_value = ["0", "5"];
				let bar3_value = ["2", "7"];
				let cherry_value = ["3", "8"];
				let seven_value = ["4", "9"];
				let cherryseven_value = ["3", "4", "8", "9"];
				let barany_value = ["0", "1", "2", "5", "6", "7"];

				let current_pos, target_temp;
				switch (fix_payout) {
					case 'cherry':
						let pickc = 0;
						current_pos = Math.floor(reel_pos);
						target_temp = current_pos + 15 + 5 * reel;
						target_temp = target_temp.toString();
						(Number(target_temp.slice(-1) > 4)) ? pickc = 1 : pickc = 0;
						target_temp = target_temp.substr(0, target_temp.length - 1) + cherry_value[pickc];
						this.target[reel] = Number(target_temp) + reel_value[fix_reel];
						break;
					case 'seven':
						let picks = 0;
						current_pos = Math.floor(reel_pos);
						target_temp = current_pos + 15 + 5 * reel;
						target_temp = target_temp.toString();
						(Number(target_temp.slice(-1) > 4)) ? picks = 1 : picks = 0;
						target_temp = target_temp.substr(0, target_temp.length - 1) + seven_value[picks];
						this.target[reel] = Number(target_temp) + reel_value[fix_reel];
						break;
					case 'cherryseven':
						current_pos = Math.floor(reel_pos);
						target_temp = current_pos + 15 + 5 * reel;
						target_temp = target_temp.toString();
						this.target_temp[reel] = target_temp.substr(0, target_temp.length - 1) + cherryseven_value[getRandom(cherryseven_value.length)];
						if (reel == 2) {
							if(seven_value.includes(this.target_temp[0].slice(-1)) && seven_value.includes(this.target_temp[1].slice(-1)) )	{					
								this.target_temp[reel] = target_temp.substr(0, target_temp.length - 1) + cherry_value[getRandom(cherry_value.length)];
							} else if (cherry_value.includes(this.target_temp[0].slice(-1)) && cherry_value.includes(this.target_temp[1].slice(-1)) )	{					
								this.target_temp[reel] = target_temp.substr(0, target_temp.length - 1) + seven_value[getRandom(seven_value.length)];
							}
						}
						this.target[reel] = Number(this.target_temp[reel]) + reel_value[fix_reel];
						break;
					case '3bar':
						let pick3 = 0;
						current_pos = Math.floor(reel_pos);
						target_temp = current_pos + 15 + 5 * reel;
						target_temp = target_temp.toString();
						(Number(target_temp.slice(-1) > 4)) ? pick3 = 1 : pick3 = 0;
						target_temp = target_temp.substr(0, target_temp.length - 1) + bar3_value[pick3];
						this.target[reel] = Number(target_temp) + reel_value[fix_reel];
						break;
					case '2bar':
						let pick2 = 0;
						current_pos = Math.floor(reel_pos);
						target_temp = current_pos + 15 + 5 * reel;
						target_temp = target_temp.toString();
						(Number(target_temp.slice(-1) > 4)) ? pick2 = 1 : pick2 = 0;
						target_temp = target_temp.substr(0, target_temp.length - 1) + bar2_value[pick2];
						this.target[reel] = Number(target_temp) + reel_value[fix_reel];
						break;
					case '1bar':
						let pick1 = 0;
						current_pos = Math.floor(reel_pos);
						target_temp = current_pos + 15 + 5 * reel;
						target_temp = target_temp.toString();
						(Number(target_temp.slice(-1) > 4)) ? pick1 = 1 : pick1 = 0;
						target_temp = target_temp.substr(0, target_temp.length - 1) + bar1_value[pick1];
						this.target[reel] = Number(target_temp) + reel_value[fix_reel];
						break;
					case 'barany':
						current_pos = Math.floor(reel_pos);
						target_temp = current_pos + 15 + 5 * reel;
						target_temp = target_temp.toString();
						this.target_temp[reel] = target_temp.substr(0, target_temp.length - 1) + barany_value[getRandom(barany_value.length)];
						if (reel == 2) {
							while (this.target_temp[reel].slice(-1)  == this.target_temp[0].slice(-1) || this.target_temp[reel].slice(-1)  == this.target_temp[1].slice(-1) ) {
								this.target_temp[reel] = target_temp.substr(0, target_temp.length - 1) + barany_value[getRandom(barany_value.length)];
							}
						}
						this.target[reel] = Number(this.target_temp[reel]) + reel_value[fix_reel];
						break;
				}

			} else {
				// generate new random position
				this.target[reel] = reel_pos + 10 + 5 * reel + Math.floor(Math.random() * 3) * 0.5;
			}
			return this.target;
		}
	}


	//Reels done handler.
	function reelsComplete() {
		running = false;

		// check wins
		let reels_pos = [reels[0]["position"], reels[1]["position"], reels[2]["position"]];

		// reel symbols
		let reels_symbol = [reels_pos[0] % 5, reels_pos[1] % 5, reels_pos[2] % 5];
		let win = check_win(reels_symbol);

		// check if win present
		if (win) {
			document.getElementById('win-amount').innerHTML = win * BET_VALUE[BET_STEP];
			BALANCE += win * BET_VALUE[BET_STEP];
			document.getElementById('balance').innerHTML = BALANCE;
		} else {
			document.getElementById('win-amount').innerHTML = '';
		}
	}


	// Check win conditions
	function check_win(reels) {
		// 2bar = 0;  1bar = 1; 3bar = 2; Cherry = 3; Seven = 4
		var any_bar = [0, 1, 2], cherrys_sevens = [3, 4], any_bar_top = [-1, 0, 3], cherrys_sevens_top = [2, 3];
		if (reels[0] % 1 == reels[1] % 1 && reels[1] % 1 == reels[2] % 1) {
			// reels are aligned; check further

			if (reels[0] % 1 == 0) {
				// items aligned at mid reel
				let reel0 = reels[0], reel1 = reels[1], reel2 = reels[2];
				if (reel0 == reel1 && reel0 == reel2) {
					// reel has one single item line
					switch (reel0) {
						case 0: // 2bar
							document.getElementById('2bar').classList.add('winning');
							return 20;
							break;
						case 1: // 1bar
							document.getElementById('1bar').classList.add('winning');
							return 10;
							break;
						case 2: // 3bar
							document.getElementById('3bar').classList.add('winning');
							return 50;
							break;
						case 3: // cherry
							document.getElementById('cherry-mid').classList.add('winning');
							return 1000;
							break;
						case 4: // sevens
							document.getElementById('sevens').classList.add('winning');
							return 150;
							break;
					}
				} else if (any_bar.includes(reel0) && any_bar.includes(reel1) && any_bar.includes(reel2)) {
					// any combination of bars
					document.getElementById('any-bar').classList.add('winning');
					return 5;
				} else if (cherrys_sevens.includes(reel0) && cherrys_sevens.includes(reel1) && cherrys_sevens.includes(reel2)) {
					// any combination of cherries and sevens
					document.getElementById('cherry-sevens').classList.add('winning');
					return 75;
				}

			} else {
				// items aligned at first and third reel
				let reel0 = reels[0] - 0.5, reel1 = reels[1] - 0.5, reel2 = reels[2] - 0.5;
				if (reel0 == reel1 && reel0 == reel2) {
					// reel has one single item line
					switch (reel0) {
						case 0: // 2bar bottom, 1bar top
							document.getElementById('2bar').classList.add('winning');
							document.getElementById('1bar').classList.add('winning');
							return 20 + 10;
							break;
						case 1: // 1bar bottom, 3bar top
							document.getElementById('1bar').classList.add('winning');
							document.getElementById('3bar').classList.add('winning');
							return 10 + 50;
							break;
						case 2: // 3bar bottom, cherries top
							document.getElementById('3bar').classList.add('winning');
							document.getElementById('cherry-top').classList.add('winning');
							return 50 + 2000;
							break;
						case 3: // cherry bottom, sevens top
							document.getElementById('cherry-bottom').classList.add('winning');
							document.getElementById('sevens').classList.add('winning');
							return 4000 + 150;
							break;
						case 4: // sevens bottom, 2bar top
							document.getElementById('sevens').classList.add('winning');
							document.getElementById('2bar').classList.add('winning');
							return 150 + 20;
							break;
					}
				} else if (any_bar.includes(reel0) && any_bar.includes(reel1) && any_bar.includes(reel2)) {
					// any combination of bars bottom

					if (any_bar_top.includes(reel0 - 1) && any_bar_top.includes(reel1 - 1) && any_bar_top.includes(reel2 - 1)) {
						// any combination of bars on top as well
						document.getElementById('any-bar').classList.add('winning');
						return 5 + 5;
					}

					document.getElementById('any-bar').classList.add('winning');
					return 5;
				} else if (any_bar_top.includes(reel0 - 1) && any_bar_top.includes(reel1 - 1) && any_bar_top.includes(reel2 - 1)) {
					// any combination of bars only top
					document.getElementById('any-bar').classList.add('winning');
					return 5;
				} else if (cherrys_sevens.includes(reel0) && cherrys_sevens.includes(reel1) && cherrys_sevens.includes(reel2)) {
					// any combination of cherries and sevens bottom
					document.getElementById('cherry-sevens').classList.add('winning');
					return 75;
				} else if (cherrys_sevens_top.includes(reel0) && cherrys_sevens_top.includes(reel1) && cherrys_sevens_top.includes(reel2)) {
					// any combination of cherries and sevens top
					document.getElementById('cherry-sevens').classList.add('winning');
					return 75;
				}
			}
		}
		return false; // reels pos do not match or no win combos, return false
	}

	// Listen for animate update.
	app.ticker.add(function (delta) {
		//Update the slots.
		for (var i = 0; i < reels.length; i++) {
			var r = reels[i];

			// Amount of blur added to scrolling reels
			r.blur.blurY = (r.position - r.previousPosition) * 50;
			r.previousPosition = r.position;

			//Update symbol positions on reel.
			for (var j = 0; j < r.symbols.length; j++) {

				var s = r.symbols[j];
				var prevy = s.y;
				s.y = (r.position + j) % r.symbols.length * (SYMBOL_SIZE + SYMBOL_SIZE * 0.3) - (SYMBOL_SIZE + SYMBOL_SIZE * 0.3);
				if (s.y < 0 && prevy > SYMBOL_SIZE) {
					//Detect going over and looping a texture on the reel
					s.texture = slotTextures[j];
					s.scale.x = s.scale.y = Math.min(SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE / s.texture.height);
					s.x = Math.round((SYMBOL_SIZE - s.width) / 2);
				}
			}
		}
	});
}


var tweening = [];
function tweenTo(object, property, target, time, easing, onchange, oncomplete) {
	var tween = {
		object: object,
		property: property,
		propertyBeginValue: object[property],
		target: target,
		easing: easing,
		time: time,
		change: onchange,
		complete: oncomplete,
		start: Date.now()
	};

	tweening.push(tween);
	return tween;
}

app.ticker.add(function (delta) {
	var now = Date.now();
	var remove = [];
	for (var i = 0; i < tweening.length; i++) {
		var t = tweening[i];
		var phase = Math.min(1, (now - t.start) / t.time);

		t.object[t.property] = lerp(t.propertyBeginValue, t.target, t.easing(phase));
		if (t.change) t.change(t);
		if (phase == 1) {
			t.object[t.property] = t.target;
			if (t.complete)
				t.complete(t);
			remove.push(t);
		}
	}
	for (var i = 0; i < remove.length; i++) {
		tweening.splice(tweening.indexOf(remove[i]), 1);
	}
});

function lerp(a1, a2, t) {
	return a1 * (1 - t) + a2 * t;
}

//scroll easing function
ease = function (amount) {
	return function (t) {
		//return t<.5 ? 2*t*t : -1+(4-2*t)*t;
		//return 1-(--t)*t*t*t;
		return t * (4 - t);
	};
};

function getRandom(x) {
	return Math.floor(Math.random() * x);
}

function betPlus() {
	if (BET_STEP < BET_VALUE.length - 1) {
		BET_STEP++;
		document.getElementById('bet').innerHTML = BET_VALUE[BET_STEP];
	}
}

function betMinus() {
	if (BET_STEP > 0) {
		BET_STEP--;
		document.getElementById('bet').innerHTML = BET_VALUE[BET_STEP];
	}
}

document.getElementById('debug-toggle').addEventListener('click', function () {
	document.getElementsByClassName('debug')[0].classList.toggle('open');
})

document.getElementById('debug-enable').addEventListener('change', debug_enable);

function debug_enable() {
	if (this.checked) {
		document.getElementById('settings').firstElementChild.disabled = false;
		DEBUG = 1;
	} else {
		document.getElementById('settings').firstElementChild.disabled = true;
		DEBUG = 0;
	}
}

function changeBalance() {
	var newBalance = document.getElementById('new-balance-input').value;
	BALANCE = newBalance;
	document.getElementById('balance').innerHTML = BALANCE;
}