// BUDGET CONTROLLER
var budgetController = (function() {
	
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100); 
		} else {
			this.percentage = -1;
		}

	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	calculateTotal = function(type) {
		var sum = 0;
		data.allItems[type].forEach(function(cur) {
			sum += cur.value;
		});
		/*
		0
		[200, 400, 100]
		sum = 0 + 200
		sum = 200 + 400
		sum = 600 + 100 = 700
		*/
		data.totals	[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0, 
		percentage: -1
	}

	return{
		addItem: function(type, des, val) {
			var newItem, ID;

			//[1 2 3 4 5], next Id = 6
			//[1 2 4 6 8], next ID = 9
			// ID = last ID + 1

			// Creat new ID
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length -1].id + 1;
			} else {
				ID = 0;
			}

			//Creat new item based on 'inc or 'exp' type
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}

			// Push it into our data structure
			data.allItems[type].push(newItem);

			// Return the new element
			return newItem;
		},

		calculateBudget: function() {

			// calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// calculate the budget: income - expenses
			data.budget = data.totals.inc - data.totals.exp;

			// calculate the percentage of income that we spent
			if (data.totals.inc > 0) {
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.percentage = -1;
			}
		},

		calculatePercentages: function() {

			/*
			a=20
			b=10
			c=40
			income = 100
			a=20/100=20%
			b=10/100=10%
			c=40/100=40%
			*/

			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.totals.inc);
			});

		},

		getPercentages: function() {
			var allPerc = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPerc; 
		},

		getBudget: function() {
			return{
				budget: data.budget, 
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},

		deleteItem: function(type, id) {
			var theNewBudget, theNewInc, theNewExp;

			if (type === 'inc') {
				deletedItemValue = data.allItems.inc[ID].value;
				data.allItems.inc[ID].value = 0;
				theNewBudget = data.budget - deletedItemValue;
				data.budget = theNewBudget;
				theNewInc = data.totals.inc - deletedItemValue;
				data.totals.inc = theNewInc;
			} else if (type === 'exp') {
				deletedItemValue = data.allItems.exp[ID].value;
				data.allItems.exp[ID].value = 0;
				theNewBudget = data.budget + deletedItemValue;
				data.budget = theNewBudget;
				theNewExp = data.totals.exp - deletedItemValue;
				data.totals.exp = theNewExp;
			}
		}		
	};

})();


// UI CONTROLLER
var UIController = (function() {

	var DOMstrings = {
		inputType: '.add__type',
		inputDes: '.description',
		inputValue: '.value',
		inputBtn: '.done', 
		incomeContainer: '.income',
		expenseContainer: '.expense',
		budgetLabel: '.moneyAv',
		incomeLabel: '.profitNum',
		expenseLabel: '.costNum',
		percentageLabel: '.cost__percent',
		itemValue: '.item__value',
		itemDeleteB: '.item__delete--btn',
		container: '.container',
		expensePercentage: '.item__percent',
		expensesPercLabel: '.item__percent',
		dateLabel: '.budget__title--class',
		fullDateLabel: '.date',
		timeLabel: '.time'
	};

	 var formatNumber = function(num, type) {
			var numSplit, int, dec;

			/*
			+ or - for number 
			exactly 2 decimal points
			comma separating the thousands
			*/

			num = Math.abs(num);
			num = num.toFixed(2);

			numSplit = num.split('.');

			int = numSplit[0];
			if (int.length > 3) {
				int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); // input 2310, output 2,310
			}

			dec = numSplit[1];

			if (type === 'exp' || type === 'inc') {
				return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
			} else{
				return int + '.' + dec;
			}
		};

	var nodeListForEach = function(list, callback) {
		var i;
		for (i = 0; i < list.length; i++){
			callback(list[i], i);
		}
	};

	return {
		getInput: function() {
			return{
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDes).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
		},

		addListItem: function(obj, type) {
			var html, newHtml, element, itemMargin;
			// creat HTML string with placeholder text
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;

				html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description float">%description%</div> <div class="right clearfix"> <div class="item__value float">%value%</div> <div class="item__delete float"> <button class="item__delete--btn"><img class="cross" src="crossI.png"></button> </div> </div> </div>';
			} else if (type === 'exp') {
				element = DOMstrings.expenseContainer;

				html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description float">%description%</div> <div class="right clearfix"> <div class="item__value float">%value%</div> <div class="item__percent float">20%</div> <div class="item__delete float"> <button class="item__delete--btn"><img class="cross" src="crossE.png"></button> </div> </div> </div>';
			}

			// Replace the placeholder text with some actual data

			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			// insert the HTML into the DOM

			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);						
		},

		deleteListItem: function(selectorID) {

			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);

		},

		clearFields: function () {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDes + ', ' + DOMstrings.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(current, index, array) {
				current.value = "";
			});

			fieldsArr[0].focus();
		},

		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			
			if (obj.budget > 0) {
				document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			} else if (obj.budget < 0) {
				document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			} else{
				document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, 'nothing');
			}
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
			

			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
			}
		},

		displayPercentages: function(percentages) {

			var i;
			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			var nodeListForEach = function(list, callback) {
				
				for (i = 0; i < list.length; i++){
					callback(list[i], i);
				}
			};

			nodeListForEach(fields, function(current, index) {

				if (percentages[i] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}

			});

		},

		displayMonth: function() {
 			var now, year, month, months;
			now = new Date();
			//var christmas = new Date(2021, 11 25);

			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			month = now.getMonth();

			year = now.getFullYear();
			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year + ':';

		},

		displayDate: function() {
			var now, month, year, day, time, hours, minutes;

			now = new Date();
			month = now.getMonth();
			year = now.getFullYear();
			day = now.getDate();
			hours = now.getHours();
			minutes = now.getMinutes();
			if (minutes > 9) {
				time = hours + ':' + minutes;
			} else if (minutes < 10) {
				time = hours + ':0' + minutes;
			}			


			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
			month = months[month];

			if (day === 1 || day === 21 || day === 31) {
				document.querySelector(DOMstrings.fullDateLabel).textContent = day + 'st ' + month + ' ' + year;
			} else if (day === 2 || day === 22) {
				document.querySelector(DOMstrings.fullDateLabel).textContent = day + 'nd ' + month + ' ' + year;
			} else if (day === 3 || day === 23) {
				document.querySelector(DOMstrings.fullDateLabel).textContent = day + 'rd ' + month + ' ' + year;
			} else {
				document.querySelector(DOMstrings.fullDateLabel).textContent = day + 'th ' + month + ' ' + year;
			}
			document.querySelector(DOMstrings.timeLabel).textContent = 'You opened this app at ' + time;
			
		},

		changedType: function() {

			var imgSrc = document.querySelector('.pic-done');
			var tickExp = 'file:///D:/Roham\'s%20Works/Java%20Script/Java%20Script%20Course/Part%205%20of%20the%20course/Budgety/tick-exp.png';
			var tick = 'file:///D:/Roham\'s%20Works/Java%20Script/Java%20Script%20Course/Part%205%20of%20the%20course/Budgety/tick.png';
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDes + ',' +
				DOMstrings.inputValue);

			nodeListForEach(fields, function(cur) {
				cur.classList.toggle('red-focus');
			});
			
			if (imgSrc.src === tick) {
				imgSrc.src = tickExp;
			} else if (imgSrc.src === tickExp) {
				imgSrc.src = tick;
			}
			
			

		},

		getDOMstrings: function() {
			return DOMstrings;
		}

	};

})();


// GLOBAL PROGRAM CONTROLLER
var controller = (function(budgetCtrl, UICtrl) {


	var setupEventListeners = function() {

		var DOM = UICtrl.getDOMstrings();

		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

		document.addEventListener('keypress', function(event) {
			if (event.keyCode === 13) {
				
				ctrlAddItem();
				
			}

		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

	};



	var updateBudget = function() {

		// 1. Calculate the budget
		budgetCtrl.calculateBudget();

		// 2. Return the budget
		var budget = budgetCtrl.getBudget();

		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};

	var updatePercentages = function() {
		
		// 1. Calculate percentages
		budgetCtrl.calculatePercentages();

		// 2. Read percentages from the budget controller
		var percentages = budgetCtrl.getPercentages();

		// 3. Update the UI with the new percentages
		UICtrl.displayPercentages(percentages);
	};

	var ctrlAddItem = function() {
		var input, newItem;

		// 1. Get the filed input data
		input = UICtrl.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			// 2. Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);

			// 3. Add the item to the UI
			UICtrl.addListItem(newItem, input.type);

			// 4. Clear the fields
			UICtrl.clearFields();

			// 5. Calculate and update budget
			updateBudget();

			// 6. Calculate and update the percentages
			updatePercentages();
		}
	};

	var ctrlDeleteItem = function(event, obj) {
		var itemID, splitID, type, deletedItemValue, deletedItem;

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		if (itemID) {

			//inc-1
			splitID = itemID.split('-');
			type = splitID[0];
			ID = splitID[1];

			//1. delete the item from the data structure
			budgetCtrl.deleteItem(type, ID);

			//2. delete the item from the UI
			UICtrl.deleteListItem(itemID);

			//3. update and show the new budget
			budgetCtrl.calculateBudget();
			var budget = budgetCtrl.getBudget();
			UICtrl.displayBudget(budget);

			// 4. Calculate and update the percentages
			if (type === 'inc') {
				updatePercentages();
			} else {
				// Nothing should be done here
			}

		}
	};

	return{
		init: function() {
			console.log('Application has started');
			UICtrl.displayMonth();
			UICtrl.displayDate();
			UICtrl.displayBudget({
				budget: 0, 
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();

		}
	};

})(budgetController, UIController);


controller.init();