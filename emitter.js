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

function handleSubscriber(emitter, event, subscriber) {
    if (subscriber.nth !== 0) {
        subscriber.timesHappened--;
        if (subscriber.timesHappened === 0) {
            subscriber.handler.call(subscriber.student);
            subscriber.timesHappened = subscriber.nth;
        }
    } else if (subscriber.timesHappened !== 0) {
        subscriber.handler.call(subscriber.student);
        if (subscriber.timesHappened === 1) {
            emitter.off(event, subscriber.student, true);
        } else {
            subscriber.timesHappened--;
        }
    } else {
        subscriber.handler.call(subscriber.student);
    }
}

function add(emitter, event, subscribtion) {
    var subscriptions = emitter.subscribes;
    if (subscriptions.hasOwnProperty(event)) {
        subscriptions[event].push(subscribtion);
    } else {
        subscriptions[event] = [subscribtion];
    }
}

function remove(emitter, event, student) {
    if (emitter.subscribes.hasOwnProperty(event)) {
        emitter.subscribes[event] =
            emitter.subscribes[event].filter(subscribe => subscribe.student !== student);
    }
}

function purge(emitter, event, student) {
    let subclassesRegExp = new RegExp('^' + event + '(\\.|$)');
    for (let events in emitter.subscribes) {
        if (subclassesRegExp.test(events) || events === event) {
            emitter.subscribes[events] =
                emitter.subscribes[events].filter(subscribe => subscribe.student !== student);
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
        * @typedef {Object} Subscription
        *
        * @property {Object} student - указатель на структуру, представляющую студента,
        *      которая годится в контекст для handler
        * @property {Number} nth - на студента срабатывает каждое nthое событие,
        *     если 0 - то совсем каждое
        * @property {Number} timesHappened - если nth != 0, - спользуется для подсчета
        *    оставшихся до срабатывания событий, иначе же - остаток ограниченной по числу подписки
        */
        subscribes: {},

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object}
         */
        on: function (event, context, handler) {
            add(this, event, { student: context, handler, timesHappened: 0, nth: 0 });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @param {Boolean} notall - если true, то подписка исчерпалась и подклассы удалены не будут
         * @returns {Object}
         */
        off: function (event, context, notall) {
            if (notall === true) {
                remove(this, event, context);
            } else {
                purge(this, event, context);
            }

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            eventNamespaces(event).forEach(function (subevent) {
                if (this.subscribes.hasOwnProperty(subevent)) {
                    this.subscribes[subevent].forEach(subscriber =>
                        handleSubscriber(this, subevent, subscriber)
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
            add(this, event, { student: context, handler, timesHappened: times, nth: 0 });

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
                add(this, event, { student: context, handler, timesHappened: 0, nth: 0 });
            } else {
                add(this, event, { student: context, handler, timesHappened: 1, nth: frequency });
            }

            return this;
        }
    };
}
