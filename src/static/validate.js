/**
 * 验证规则默认提示信息
 * @type {*}
 */
const TYPE_MSG = {
	'require': '{{attribute}}不能为空！',
	'number': '{{attribute}}只能是数字',
	'integer': '{{attribute}}只能是整数',
	'float': '{{attribute}}只能是浮点数',
	'boolean': '{{attribute}}只能是布尔类型',
	'email': '{{attribute}}不是一个有效的邮箱地址',
	'array': '{{attribute}}只能是一个数组',
	'date': '{{attribute}}不是一个有效的日期',
	'alpha': '{{attribute}}只能是字母',
	'alphaNum': '{{attribute}}只能是字母和数字',
	'alphaDash': '{{attribute}}只能是只能是字母、数字和下划线_及破折号-',
	'chs': '{{attribute}}只能是汉字',
	'chsAlpha': '{{attribute}}只能是汉字、字母',
	'chsAlphaNum': '{{attribute}}只能是汉字、字母和数字',
	'chsDash': '{{attribute}}只能是汉字、字母、数字和下划线_及破折号-',
	'url': '{{attribute}}不是一个有效URL地址',
	'ip': '{{attribute}}不是一个有效的IP地址',
	'in': '{{attribute}}必须在{{rule}}范围内',
	'notIn': '{{attribute}}不能在{{rule}}范围内',
	'between': '{{attribute}}只能在{{1}} - {{2}}之间',
	'notBetween': '{{attribute}}不能在{{1}} - {{2}}之间',
	'len': '{{attribute}}长度不符合要求{{rule}}',
	'max': '{{attribute}}长度不能超过{{rule}}',
	'min': '{{attribute}}长度不能小于{{rule}}',
	'after': '{{attribute}}日期不能小于{{rule}}',
	'before': '{{attribute}}日期不能超过{{rule}}',
	'expire': '不在有效期内{{rule}}',
	'confirm': '{{attribute}}和确认字段{{:2}}不一致',
	'different': '{{attribute}}和比较字段{{:2}}不能相同',
	'egt': '{{attribute}}必须大于或等于{{rule}}',
	'gt': '{{attribute}}必须大于{{rule}}',
	'elt': '{{attribute}}必须小于或等于{{rule}}',
	'lt': '{{attribute}}必须小于{{rule}}',
	'eq': '{{attribute}}必须等于{{rule}}',
	'regex': '{{attribute}}不符合指定规则',
};

/**
 * 自定义的验证类型
 * @type {*}
 */
const TYPE = {};

/**
 * 获取数据值
 * @param {*} data 数据
 * @param {string} key 数据标识 支持二维
 * @return {*}
 */
function getDataValue(data, key) {
	let value = null;
	if (!Number.isNaN(parseInt(key))) {
		value = key;
	} else if (key.indexOf('.') !== -1) { // 支持二维数组验证
		let [name1, name2] = key.split('.');
		value = data[name1][name2] || null;
	} else {
		value = data[key] || null;
	}
	return value;
}

/**
 * 字符串转日期
 * @param str
 * @return {Number}
 */
function strtotime(str) {
	return Math.floor(new Date(Date.parse(str.replace(/-/g, '/'))).getTime() / 1000);
}

/**
 * 验证类
 */
export default class Validate {

	/**
	 * 默认构造器
	 * @param {*.} [rules]
	 * @param {*.} [messages]
	 * @param {*.} [fields]
	 */
	constructor(rules, messages, fields) {
		this.rules = rules || {};
		this.messages = messages || {};
		this.fields = fields || {};
		this._error = '';
	}

	/**
	 * 添加字段验证规则
	 * @param {*} name  字段名称或者规则数组
	 * @param {*} [rule]  验证规则
	 * @return {Validate}
	 */
	rule(name, rule) {
		if (typeof name === 'object') {
			Object.assign(this.rules, name);
		} else {
			this.rules[name] = rule;
		}
		return this;
	}

	/**
	 * 设置提示信息
	 * @param {*} name  字段名称
	 * @param {string} [message] 提示信息
	 * @return {Validate}
	 */
	message(name, message = '') {
		if (typeof name === 'object') {
			Object.assign(this.message, name);
		} else {
			this.message[name] = message;
		}
		return this;
	}

	/**
	 * 检查数据源
	 * @param {*} data
	 * @param {boolean} isBatch
	 * @return {boolean}
	 */
	check(data, isBatch = false) {
		this._error = isBatch ? {} : '';
		const fields = Object.keys(this.rules);
		let errorCount = 0;

		for (const field of fields) {
			let rules = this.rules[field],
				value = getDataValue(data, field),
				result = true;

			if (!(rules instanceof Array)) rules = [rules];

			const keys = Object.keys(rules);
			for (const key of keys) {
				let rule = rules[key];
				if (!(rule instanceof Array)) {
					if (typeof rule === 'function') {
						rule = [rule.name, rule];
					} else {
						rule = [rule, ''];
					}
				}

				if (typeof rule[1] === 'function') {
					result = rule[1](value, rule[2], data, field);
				} else if (typeof Validate[rule[0]] === 'function') {
					result = Validate[rule[0]](value, rule[1], data, field);
				} else {
					result = Validate.is(value, rule[0]);
				}

				if (true !== result) {
					if (isBatch) {
						result = false;
						this._error[field] = this._getRuleMsg(field, rule);
						break;
					} else {
						this._error = this._getRuleMsg(field, rule);
						return false;
					}
				}
			}

			if (true !== result) errorCount++;
		}

		return errorCount === 0;
	}

	/**
	 * 获取验证提示信息
	 * @param {string} field
	 * @param {Array.} rule
	 * @return {string}
	 * @private
	 */
	_getRuleMsg(field, rule) {
		let message = this.messages[field + '.' + rule[0]] || TYPE_MSG[rule[0]] || '',
			title = this.fields[field] || field;

		let variable = {'attribute': title, 'rule': rule[1]};
		if (typeof rule[1] === 'string' && rule[1].indexOf(',') !== -1) {
			[variable['1'], variable['2'], variable['3']] = rule[1].split(',', 3);
		}

		return message.replace(/{{([a-zA-Z0-9]+?)}}/g, (_, name) => variable[name]);
	}

	getError() {
		return this._error;
	}
}

/**
 * 注册验证（类型）规则
 * @param {string} type 验证规则类型
 * @param {function} [callback] callback方法(或闭包)
 */
Validate.extend = function (type, callback) {
	if (typeof type === 'object') {
		Object.assign(TYPE, type);
	} else {
		TYPE[type] = callback;
	}
};

/**
 * 设置验证规则的默认提示信息
 * @param {*} type 验证规则类型名称或者数组
 * @param {string} [msg] 验证提示信息
 */
Validate.setTypeMsg = function (type, msg) {
	if (typeof type === 'object') {
		Object.assign(TYPE_MSG, type);
	} else {
		TYPE_MSG[type] = msg;
	}
};

/**
 * 验证是否和某个字段的值一致
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @param {*} [data]  数据
 * @param {string} [field] 字段名
 * @return {boolean}
 */
Validate.confirm = function (value, rule, data, field) {
	field = field || '';
	if ('' === rule) rule = field + '_confirm';
	return getDataValue(data, rule) == value;
};

/**
 * 验证是否和某个字段的值是否不同
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @param {*} data  数据
 * @return {boolean}
 */
Validate.different = function (value, rule, data) {
	return getDataValue(data, rule) != value;
};

/**
 * 验证是否大于等于某个值
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @param {*} data  数据
 * @return {boolean}
 */
Validate.egt = function (value, rule, data) {
	let val = getDataValue(data, rule);
	return val !== null && value >= val;
};

/**
 * 验证是否大于某个值
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @param {*} data  数据
 * @return {boolean}
 */
Validate.gt = function (value, rule, data) {
	let val = getDataValue(data, rule);
	return val !== null && value > val;
};

/**
 * 验证是否小于等于某个值
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @param {*} data  数据
 * @return {boolean}
 */
Validate.elt = function (value, rule, data) {
	let val = getDataValue(data, rule);
	return val !== null && value <= val;
};

/**
 * 验证是否小于某个值
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @param {*} data  数据
 * @return {boolean}
 */
Validate.lt = function (value, rule, data) {
	let val = getDataValue(data, rule);
	return val !== null && value < val;
};

/**
 * 验证是否等于某个值
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @return {boolean}
 */
Validate.eq = function (value, rule) {
	return value == rule;
};

/**
 * 验证字段值是否为有效格式
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @return {boolean}
 */
Validate.is = function (value, rule) {
	let result = true;
	if (rule === 'require') {// 必须
		result = undefined !== value || null !== value || '' !== value;
	} else if (rule === 'date') {// 是否是一个有效日期
		result = !isNaN(strtotime(value));
	} else if (rule === 'alpha') {// 只允许字母
		result = Validate.regex(value, /^[A-Za-z]+$/);
	} else if (rule === 'alphaNum') {// 只允许字母和数字
		result = Validate.regex(value, /^[A-Za-z0-9]+$/);
	} else if (rule === 'alphaDash') {// 只允许字母、数字和下划线 破折号
		result = Validate.regex(value, /^[A-Za-z0-9\-_]+$/);
	} else if (rule === 'chs') {// 只允许汉字
		result = Validate.regex(value, /^[\u4e00-\u9fa5]+$/u);
	} else if (rule === 'chsAlpha') {// 只允许汉字、字母
		result = Validate.regex(value, /^[a-zA-Z\u4e00-\u9fa5]+$/u);
	} else if (rule === 'chsAlphaNum') {// 只允许汉字、字母和数字
		result = Validate.regex(value, /^[a-zA-Z0-9\u4e00-\u9fa5]+$/u);
	} else if (rule === 'chsDash') {// 只允许汉字、字母、数字和下划线_及破折号-
		result = Validate.regex(value, /^[a-zA-Z0-9_\-\u4e00-\u9fa5]+$/u);
	} else if (rule === 'mobile') {//是否为有效手机号
		result = Validate.regex(value, /^[1][0-9]{10}$/);
	} else if (rule === 'tel') {//是否为有效的电话号码
		result = Validate.regex(value, /^(([0+]\d{2,3}-)?(0\d{2,3})-)(\d{7,8})(-(\d{3,}))?$/);
	} else if (rule === 'email') {// 是否为邮箱地址
		result = Validate.regex(value, /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/);
	} else if (rule === 'ip') {// 是否为IP地址
		let regex = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/;
		result = Validate.regex(value, regex);
	} else if (rule === 'url') {// 是否为一个URL地址
		let regex = /(http|ftp|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?/;
		result = Validate.regex(value, regex);
	} else if (rule === 'float') {// 是否为float
		result = !isNaN(parseFloat(value));
	} else if (rule === 'number') {//是否是数字
		result = !isNaN(value);
	} else if (rule === 'integer') {// 是否为整型
		result = Number.isInteger(value);
	} else if (rule === 'boolean') {// 是否为布尔值
		result = [true, false, 0, 1, '0', '1'].indexOf(value) !== false;
	} else if (rule === 'array') {// 是否为数组
		result = value instanceof Array;
	} else {
		if (TYPE[rule]) {// 注册的验证规则
			result = TYPE[rule].call(this, value);
		} else {// 正则验证
			result = Validate.regex(value, rule);
		}
	}
	return result;
};

/**
 * 验证是否有效IP
 * @param {*} value 字段值
 * @return {boolean}
 */
Validate.ip = function (value) {
	return Validate.is(value, 'ip');
};

/**
 * 验证是否在范围内
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @return {boolean}
 */
Validate.in = function (value, rule) {
	if (typeof rule === 'string') rule = rule.split(',');
	return rule.indexOf(value) !== -1;
};

/**
 * 验证是否不在某个范围
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @return {boolean}
 */
Validate.notIn = function (value, rule) {
	if (typeof rule === 'string') rule = rule.split(',');
	return rule.indexOf(value) === -1;
};

/**
 * between验证数据
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @return {boolean}
 */
Validate.between = function (value, rule) {
	if (typeof rule === 'string') rule = rule.split(',', 2);
	let [min, max] = rule;
	return value >= min && value <= max;
};

/**
 * 使用notbetween验证数据
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @return {boolean}
 */
Validate.notBetween = function (value, rule) {
	if (typeof rule === 'string') rule = rule.split(',', 2);
	let [min, max] = rule;
	return value < min || value > max;
};

/**
 * 验证数据长度
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @return {boolean}
 */
Validate.len = function (value, rule) {
	let length = 0;
	if (value instanceof Array) {
		length = value.length;
	} else {
		if (typeof value !== 'string') value = value.toString();
		length = value.length;
	}

	if (typeof rule === 'string' && rule.indexOf(',')) { // 长度区间
		let [min, max] = rule.split(',', 2);
		return length >= min && length <= max;
	} else {
		// 指定长度
		return length == rule;
	}
};

/**
 * 验证数据最大长度
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @return {boolean}
 */
Validate.max = function (value, rule) {
	let length = 0;
	if (value instanceof Array) {
		length = value.length;
	} else {
		if (typeof value !== 'string') value = value.toString();
		length = value.length;
	}
	return length <= rule;
};

/**
 * 验证数据最小长度
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @return {boolean}
 */
Validate.min = function (value, rule) {
	let length = 0;
	if (value instanceof Array) {
		length = value.length;
	} else {
		if (typeof value !== 'string') value = value.toString();
		length = value.length;
	}
	return length >= rule;
};

/**
 * 验证日期
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @return {boolean}
 */
Validate.after = function (value, rule) {
	return strtotime(value) >= strtotime(rule);
};

/**
 * 验证日期
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @return {boolean}
 */
Validate.before = function (value, rule) {
	return strtotime(value) <= strtotime(rule);
};

/**
 * 验证有效期
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @return {boolean}
 */
Validate.expire = function (value, rule) {
	if (typeof rule === 'string') rule = rule.split(',', 2);

	let [start, end] = rule;
	if (isNaN(start)) start = strtotime(start);
	if (isNaN(end)) end = strtotime(end);

	const time = Math.floor(new Date().getTime() / 1000);
	return time >= start && time <= end;
};

/**
 * 使用正则验证数据
 * @param {*} value 字段值
 * @param {*} rule  验证规则
 * @return {boolean}
 */
Validate.regex = function (value, rule) {
	if (!(rule instanceof RegExp)) rule = new RegExp(rule);
	return rule.test(value);
};