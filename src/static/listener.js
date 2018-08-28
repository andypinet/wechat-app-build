//触发器总集合
const LISTENER_MANAGER = [];

function execFunc(listener, param) {
	listener.callback.call(listener.thisArg, param);
}

export default {

	/**
	 * 添加监听器
	 * @param {string} name
	 * @param {Function|*} listener
	 */
	on(name, listener) {
		if (!name || !isNaN(parseInt(name)))
			throw TypeError("监听器名称只能为英文字母以及下划线！");

		//判断当前监听器是否存在，不存在则直接创建一个空数组
		if (LISTENER_MANAGER[name] === undefined)
			LISTENER_MANAGER[name] = [];

		if (typeof listener !== 'object') {
			listener = {callback: listener};
		}

		if (typeof listener.callback !== 'function') {
			throw TypeError("监听器必须是一个function！")
		}

		LISTENER_MANAGER[name].push(listener);
	},

	/**
	 * 添加监听器 - 只执行一次
	 * @param {string} name
	 * @param {Function|*} listener
	 */
	once(name, listener) {
		if (typeof listener !== 'object') {
			listener = {callback: listener};
		}
		listener.once = true;
		this.on(name, listener);
	},

	/**
	 * 移除监听器
	 * @param {string} name
	 * @param {Function} listener
	 */
	off(name, listener) {
		if (typeof listener !== 'function') return;

		//处理器
		const handler = (listeners, listener) => {
			const index = listeners.indexOf(listener);
			if (index !== -1) listeners.splice(index, 1);
		};

		if (!name || !isNaN(parseInt(name))) {
			//所有监听器都移除这个回调函数
			LISTENER_MANAGER.forEach(listeners => handler(listeners, listener));
		} else {
			handler(LISTENER_MANAGER[name] || [], listener);
		}
	},

	/**
	 * 触发监听器
	 * @param {string} name
	 * @param {*} [param]
	 */
	fire(name, param) {
		if (!name || !isNaN(parseInt(name)))
			throw TypeError("监听器名称只能为英文字母以及下划线！");

		const listeners = LISTENER_MANAGER[name] || [];
		for (let i = 0; i < listeners.length; i++) {
			const listener = listeners[i];
			if (listener.once) {
				listeners.splice(i, 1);
				i--;
			}
			execFunc(listener, param);
		}
	}

};