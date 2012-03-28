/**
 * Merge object a with object b
 *
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 */
exports.merge = function (a, b) {
	for (var key in b) {
		a[key] = b[key];
	}

	return a;
};
