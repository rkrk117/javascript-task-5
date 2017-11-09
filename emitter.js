'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
getEmitter.isStar = true;
module.exports = getEmitter;

function eventNamespaces(event) {
    var prefix = '';
    function addToPrefix(item) {
        prefix = prefix ? prefix + '.' + item : item;

        return prefix;
    }

    return event
        .split('.')
        .map(addToPrefix)
        .reverse();
}

function handleSubscribtion(emitter, event, subscribtion) {
    if (subscribtion.hasOwnProperty('nth')) {
        subscribtion.i--;
        if (subscribtion.i === 0) {
            subscribtion.handler.call(subscribtion.student);
            subscribtion.i = subscribtion.nth;
        }
    } else if (subscribtion.hasOwnProperty('timesLeft')) {
        subscribtion.handler.call(subscribtion.student);
        subscribtion.timesLeft--;
        if (subscribtion.timesLeft === 0) {
            remove(emitter.subscriptions, event, subscribtion.student);
        }
    } else {
        subscribtion.handler.call(subscribtion.student);
    }
}

function add(subscriptions, event, subscribtion) {
    if (subscriptions.hasOwnProperty(event)) {
        subscriptions[event].push(subscribtion);
    } else {
        subscriptions[event] = [subscribtion];
    }
}

function remove(subscriptions, event, student) {
    if (subscriptions.hasOwnProperty(event)) {
        subscriptions[event] =
            subscriptions[event].filter(subscribe => subscribe.student !== student);
    }
}

function purge(subscriptions, event, student) {
    let subclassesRegExp = new RegExp('^' + event + '(\\.|$)');
    for (let events in subscriptions) {
        if (subclassesRegExp.test(events)) {
            remove(subscriptions, events, student);
        }
    }
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    return {

        /**
         * @typedef Subscription
         * @property {Object} student - студент, являющийся контекстом для вызова handler-а
         * @property {Number} [timesLeft] - используется для подсчета количества событий, которые
         *   будут обработаны
         * @property {Number} [nth] - шаг, с которым срабатывает handler
         * @property {Number} [i] - существует только при периодической подписке - определяет -
         *   сколько событий осталось до того, которое будет обработано.
         */
        /* @type {Object.<String, Subscription[]>} */
        subscriptions: {},

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object}
         */
        on: function (event, context, handler) {
            add(this.subscriptions, event, { student: context, handler });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @param {Boolean} notall - если true, то подписка исчерпалась и подклассы удалены не будут
         * @returns {Object}
         */
        off: function (event, context) {
            purge(this.subscriptions, event, context);

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            eventNamespaces(event).forEach(function (subevent) {
                if (this.subscriptions.hasOwnProperty(subevent)) {
                    this.subscriptions[subevent].forEach(subscribtion =>
                        handleSubscribtion(this, subevent, subscribtion)
                    );
                }
            }, this);

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object}
         */
        several: function (event, context, handler, times) {
            if (times <= 0) {
                this.on(event, context, handler);
            } else {
                add(this.subscriptions, event,
                    { student: context, handler, timesLeft: times });
            }

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object}
         */
        through: function (event, context, handler, frequency) {
            if (frequency <= 0) {
                this.on(event, context, handler);
            } else {
                add(this.subscriptions, event,
                    { student: context, handler, i: 1, nth: frequency });
            }

            return this;
        }
    };
}
