'use strict';
const arrify = require('arrify');
const getStream = require('get-stream');
const Instagram = require('instagram-screen-scrape');
const limitSizeStream = require('limit-size-stream');
const streamFilter = require('stream-filter');
const twitterText = require('twitter-text');

module.exports = (user, opts) => {
	opts = Object.assign({count: 20}, opts);

	const stream = limitSizeStream.obj(new Instagram.InstagramPosts({username: user}), opts.count);
	const filter = streamFilter.obj(data => [opts.filter, opts.hashtags, opts.mentions].every((x, i) => {
		if (x && i === 0) {
			return x(data);
		}

		if (x && i === 1) {
			return arrify(x).every(y => twitterText.extractHashtags(data.text).indexOf(y) !== -1);
		}

		if (x && i === 2) {
			return arrify(x).every(y => twitterText.extractMentions(data.text).indexOf(y) !== -1);
		}

		return true;
	}));

	stream.pipe(filter);

	return getStream.array(filter);
};
