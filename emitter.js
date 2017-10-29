'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
getEmitter.isStar = true;
module.exports = getEmitter;

function eventPath(event) {
    let result = event.split('.').reduce(function (acc, cur) {
        acc.push((acc.length === 0 ? '' : acc[acc.length - 1] + '.') + cur);

        return acc;
    }, []);
    result.reverse();

    return result;
}

function handleSubscriber(event, subscriber, emitter) {
    if (subscriber.nth !== 0) {
        subscriber.happened--;
        if (subscriber.happened === 0) {
            subscriber.handler.call(subscriber.student);
            subscriber.happened = subscriber.nth;
        }
    } else if (subscriber.happened !== 0) {
        subscriber.handler.call(subscriber.student);
        if (subscriber.happened === 1) {
            emitter.off(event, subscriber.student, true);
        } else {
            subscriber.happened--;
        }
    } else {
        subscriber.handler.call(subscriber.student);
    }
}

function add(emitter, event, subscriber) {
    if (emitter.subscribes.hasOwnProperty(event)) {
        emitter.subscribes[event].push(subscriber);
    } else {
        emitter.subscribes[event] = [subscriber];
    }
}

function remove(emitter, event, context) {
    if (emitter.subscribes.hasOwnProperty(event)) {
        emitter.subscribes[event] =
            emitter.subscribes[event].filter(subscribe => subscribe.student !== context);
    }
}

function purge(emitter, event, context) {
    let subclassesRegExp = new RegExp('^' + event + '\\.');
    for (let events in emitter.subscribes) {
        if (events.match(subclassesRegExp) || events === event) {
            emitter.subscribes[events] =
                emitter.subscribes[events].filter(subscribe => subscribe.student !== context);
        }
    }
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    return {
        subscribes: {},

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object}
         */
        on: function (event, context, handler) {
            add(this, event, { student: context, handler, happened: 0, nth: 0 });

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
            var emitter = this;
            eventPath(event).forEach(function (subevent) {
                if (emitter.subscribes.hasOwnProperty(subevent)) {
                    emitter.subscribes[subevent].forEach(subscriber =>
                        handleSubscriber(subevent, subscriber, emitter)
                    );
                }
            });

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
            add(this, event, { student: context, handler, happened: times, nth: 0 });

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
                add(this, event, { student: context, handler, happened: 0, nth: 0 });
            } else {
                add(this, event, { student: context, handler, happened: 1, nth: frequency });
            }

            return this;
        }
    };
}
