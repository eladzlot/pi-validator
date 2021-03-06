// import $ from 'jquery';
let Pikaday = window.Pikaday;

export let datePicker = (prop, options) => m.component(pikaday, {prop,options});
export let dateRangePicker = args => m.component(pikadayRange, args);

let pikaday = {
	view(ctrl, {prop, options}){
		return m('div', {config: pikaday.config(prop, options)});
	},
	config(prop, options){
		return (element, isInitialized, ctx) => {
			if (!isInitialized){
				ctx.picker = new Pikaday(Object.assign({
					onSelect: prop,
					container: element
				},options));

				element.appendChild(ctx.picker.el);
			}

			ctx.picker.setDate(prop());
		};
	}
};

/**
 * args = {
 * 	startValue: m.prop,
 *  endValue: m.prop,
 *  options: Object // specific daterange plugin options
 * }
 */

let pikadayRange = {
	view: function(ctrl, args){
		return m('.date-range',[
			m('.figure', [
				m('strong','Start Date'),
				m('br'),
				m('.figure', {config:pikadayRange.configStart(args)})
			]),
			m.trust('&nbsp;'),
			m('.figure', [
				m('strong','End Date'),
				m('br'),
				m('.figure', {config:pikadayRange.configEnd(args)})
			])
		]);
	},
	configStart({startDate, endDate}){
		return (element, isInitialized, ctx) => {
			let picker = ctx.picker;

			if (!isInitialized){
				picker = ctx.picker = new Pikaday({
					maxDate: new Date(),
					onSelect: date => startDate(date) && update() || m.redraw()
				});
				element.appendChild(picker.el);

				ctx.onunload = picker.destroy.bind(picker);
				picker.setDate(startDate());
			}

			// resset picker date only if the date has changed externaly
			if (!datesEqual(startDate() ,picker.getDate())){
				picker.setDate(startDate(),true);
				update();
			}

			function update(){
				picker.setStartRange(startDate());
				picker.setEndRange(endDate());
				picker.setMaxDate(endDate());
			}
		};
	},
	configEnd({startDate, endDate}){
		return (element, isInitialized, ctx) => {
			let picker = ctx.picker;

			if (!isInitialized){
				picker = ctx.picker = new Pikaday({
					maxDate: new Date(),
					onSelect: date => endDate(date) && update() || m.redraw()
				});
				element.appendChild(picker.el);

				ctx.onunload = picker.destroy.bind(picker);
				picker.setDate(endDate());
			}

			// resset picker date only if the date has changed externaly
			if (!datesEqual(endDate() ,picker.getDate())){
				picker.setDate(endDate(),true);
				update();
			}

			function update(){
				picker.setStartRange(startDate());
				picker.setEndRange(endDate());
				picker.setMinDate(startDate());
			}
		};
	}
};

let datesEqual = (date1, date2) => date1 instanceof Date && date2 instanceof Date && date1.getTime() === date2.getTime();