const THEMES_URL = "themes.json";

class Calculator extends HTMLElement {

	constructor() {
		super();
		this.setup();
	}

	async setup() {
		this.themeManager = new ThemeManager(this);
		this.themeManager.loadDefaults();

		//wait for json load
		await new Promise(r => setTimeout(r, 50));

		this.theme = this.themeManager.getPrefferedTheme();

		this.calculatorContainer = document.createElement("div");
		this.calculatorContainer.classList.add("container", ...this.theme.getValue("container"));

		this.calculatorInput = document.createElement("input");
		this.calculatorInput.type = "text";
		this.calculatorInput.classList.add("form-control", ...this.theme.getValue("input"));

		var title = this.getAttribute("title");
		if (title != null) {
			this.titleElement = document.createElement("h5");
			this.titleElement.classList.add(...this.theme.getValue("title"));
			this.titleElement.innerHTML = title;
			this.calculatorContainer.appendChild(this.titleElement);
		}

		this.calculatorContainer.appendChild(this.calculatorInput);
		this.appendChild(this.calculatorContainer);

		this.inputProcessor = new InputProcessor(this);

		this.buttonManager = new ButtonManager(this);
		this.buttonManager.registerDefaults();

		//wait for json load
		await new Promise(r => setTimeout(r, 50));

		this.buttonRenderer = new ButtonRenderer(this);
		this.buttonRenderer.renderButtons();

		this.buttonListeners = new ButtonListeners(this);
		this.buttonListeners.listenDefaults();
		this.buttonListeners.listenInput();	
	
	}

	getTheme() {
		return this.theme;
	}

	getContainer() {
		return this.calculatorContainer;
	}

	getInput() {
		return this.calculatorInput;
	}

	getButtonManager() {
		return this.buttonManager;
	}

	getButtonRenderer() {
		return this.buttonRenderer;
	}

	getInputProcessor() {
		return this.inputProcessor;
	}
}

class CalculatorButton {

	constructor(fun, calculator, theme, animation, key, displayName, extraCSS) {
		this.calculator = calculator;
		this.theme = theme;
		this.animation = animation;
		this.function = fun;
		this.key = key;
		this.displayName = displayName;
		this.extraCSS = extraCSS;
	}

	static fromJson(json, calculator) {

		var displayName = json.displayName;
		var key = json.key;
		var fun = json.fun;
		var styleJson = json.style;
		var animationJson = json.animation;

		var style = styleJson[calculator.getTheme().getType()];

		//apply default style when array is empty
		if (style == null) {
			style = calculator.getTheme().getValue("button");
		}

		var animation = animationJson[calculator.getTheme().getType()];

		//apply default animation when array is empty
		if (animation == null) {
			var animation = calculator.getTheme().getValue("buttonAnimation");
		}

		var button = new CalculatorButton(fun, calculator, style, animation, key, displayName);
		return button;
	}	

	asHtml() {
		this.column = document.createElement("div");
		this.column.classList.add("col");

		this.buttonElement = document.createElement("button");

		this.buttonElement.classList.add(...this.theme, this.extraCSS);
		this.buttonElement.innerHTML = this.displayName;

		this.column.appendChild(this.buttonElement);
		return this.column;
	}

	async playAnimation() {
		var defaultStyle = this.theme;
		var animationStyle = this.animation;

		this.buttonElement.classList.remove(...defaultStyle);
		this.buttonElement.classList.add(...animationStyle);	

		await new Promise(r => setTimeout(r, 150));

		this.buttonElement.classList.remove(...animationStyle);
		this.buttonElement.classList.add(...defaultStyle);
	}

	applyFunction() {;
		eval("this.calculator.getInputProcessor()." + this.function);		
	}

	getElement() {
		return this.buttonElement;
	}

	getFunction() {
		return this.function;
	}

	getCalculator() {
		return this.calculator;
	}

	getKey() {
		return this.key;
	}			

	getDisplayName() {
		return this.displayName;
	}

	getExtraCSS() {
		return this.extraCSS;
	}
}


class ButtonManager {

	constructor(calculator) {
		this.calculator = calculator;
		this.inputProcessor = calculator.getInputProcessor();
		this.byName = new Map();
		this.byKey = new Map();

		this.theme = this.calculator.getTheme().getValue("button");
	}	

	async registerDefaults() {
		var request = new Request("themes.json");
		var response = await fetch(request);
		var jsonObject = await response.json();
		
		var buttonThemesJson = jsonObject.buttons;

		for (var buttonThemeJson of buttonThemesJson) {
			var button = CalculatorButton.fromJson(buttonThemeJson, this.calculator);
			this.byName.set(button.getDisplayName(), button);
			this.byKey.set(button.getKey(), button);
		}
	}

	getByName(buttonName) {
		return this.byName.get(buttonName);
	}

	getByKey(key) {
		return this.byKey.get(key);
	}

	getAll() {
		return this.byName.values();
	}
}

class ButtonListeners {

	constructor(calculator) {
		this.calculator = calculator;
	}

	listenDefaults() {
		this.calculator.getContainer().addEventListener("click", (event) => {

			if (event.target.nodeName != "BUTTON") {
				return;
			}

			var keyCode = event.target.innerHTML;
			var button = this.calculator.getButtonManager().getByName(keyCode);

			button.playAnimation();
			button.applyFunction();
		});
	}

	listenInput() {
		this.calculator.getInput().addEventListener("keydown", (event) => {
			event.preventDefault();

			var key = event.key;
			var button = this.calculator.getButtonManager().getByKey(key);

			if (button == null) {
				return;
			}

			var buttonElement = button.getElement();
			buttonElement.click();				
		});
	}
}


class ButtonRenderer {

	constructor(calculator) {
		this.calculator = calculator;
	}

	//TODO make this responsive
	renderButtons() {
		var buttonContainer = this.calculator.getContainer();

		var buttonManager = this.calculator.getButtonManager();
		var buttonArray = buttonManager.getAll();

		var index = 0;
		var row;
		for (var button of buttonArray) {
			if (index % 4 == 0) {
				row = document.createElement("div");
				row.classList.add("row", "mb-3");
				buttonContainer.appendChild(row);
			}
			row.appendChild(button.asHtml());
			index++;
		}
	}
}

class Theme {

	static TYPE_KEY = "type";

	constructor(type) {
		this.type = type;
		this.properties = new Map();
	}

	static fromJson(json) {
		var theme = new Theme();

		Object.keys(json).forEach(function(key) {
			theme.setValue(key, json[key]);
		});
		return theme;
	}

	getType() {
		return this.getValue(Theme.TYPE_KEY);
	}

	getValue(key) {
		return this.properties.get(key);
	}

	setValue(key, value) {
		this.properties.set(key, value);
	}

	getProperties() {
		return this.properties;
	}
}

class ThemeManager {

	static DEFAULT_THEME_TYPE = "light";

	constructor(calculator) {
		this.calculator = calculator;
		this.themeMap = new Map();
		this.buttonThemeMap = new Map();
	}

	async loadDefaults() {
		var request = new Request(THEMES_URL);
		var response = await fetch(request);
		var jsonObject = await response.json();
		
		var themesJson = jsonObject.themes;

		for (var themeJson of themesJson) {
			var theme = Theme.fromJson(themeJson);
			this.themeMap.set(theme.getType(), theme);
		}
	}

	getPrefferedTheme() {
		var themeType = ThemeManager.DEFAULT_THEME_TYPE;
		var themeAttribute = this.calculator.getAttribute("theme");
		if (themeAttribute != null) {
			themeType = themeAttribute;
		}
		return this.getByType(themeType);

	}

	getByType(type) {
		return this.themeMap.get(type);
	}
}


//REWRITE THIS CLASS
class InputProcessor {

	static NUMBERS = [0,1,2,3,4,5,6,7,8,9];
	static SQRT_CHAR = "√"; 

	constructor(calculator) {
		this.calculator = calculator;
		this.calcInput = calculator.getInput();

		this.expression = "";
		this.displayExpression = "";
		this.sqrtOpened = false;		
	}

	isNumber(text) {
		for (var number of InputProcessor.NUMBERS) {
			if (text.includes(number)) {
				return true;
			}
		}
		return false;
	}

	processInput(text) {
		var mathText = text.replaceAll(" ", "");

		if (text != InputProcessor.SQRT_CHAR) {
			if (this.expression == "" && !this.isNumber(text)) {
				return;
			}
		}

		var lastChar = this.expression.substring(this.expression.length - 1);

		if (!this.isNumber(text) && this.sqrtOpened) {
			this.expression += ")";
			this.sqrtOpened = false;
		}

		if (text != InputProcessor.SQRT_CHAR) {
			if (!this.isNumber(text) && !this.isNumber(lastChar)) {
				this.backspace();
			}
		}

		if (text == InputProcessor.SQRT_CHAR) {
			if (this.expression.length != 0) {
				mathText = "*" + mathText;
			}
			mathText = mathText.replace(InputProcessor.SQRT_CHAR, "Math.sqrt(");
			this.sqrtOpened = true;
		}

		if (mathText == ":") {
			mathText = mathText.replace(":", "/");
		}

		this.expression += mathText;
		console.log(this.expression);
		this.displayExpression += text;
		this.updateInput();
	}	

	backspace() {
		this.expression = this.expression.substring(0, this.expression.length - 1);
		this.displayExpression = this.displayExpression.substring(0, this.displayExpression.length - 3);
		this.updateInput();
	}

	clearInput() {
		this.expression = "";
		this.displayExpression = "";
		this.sqrtOpened = false;

		this.updateInput();
	}


	updateInput() {
		this.calcInput.value = this.displayExpression;
	}

	calc() {
		var result = this.expression;

		if (this.sqrtOpened) {
			result += ")";
			this.sqrtOpened = false;
		}
		result = eval(result);

		this.displayExpression = result + "";
		this.expression = result + "";
		this.updateInput();
	}
}


customElements.define("bs-calculator", Calculator);