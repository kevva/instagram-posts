'use strict';
const got = require('got');
const twitterText = require('twitter-text');

const QUERY_HASH = '58b6785bea111c67129decbe6a448951';

const filterPosts = (posts, options) => posts.filter(post => {
	let pass = true;

	if (typeof options.filter === 'function') {
		pass = options.filter(post);
	}

	if (pass && Array.isArray(options.hashtags)) {
		pass = options.hashtags.every(hashtag => twitterText.extractHashtags(post.text).indexOf(hashtag) !== -1);
	}

	if (pass && Array.isArray(options.mentions)) {
		pass = options.mentions.every(mention => twitterText.extractMentions(post.text).indexOf(mention) !== -1);
	}

	return pass;
});

const transformPosts = posts => posts.map(post => Object.assign(post.node, {
	comments: post.node.edge_media_to_comment ? post.node.edge_media_to_comment.count : 0,
	likes: post.node.edge_liked_by ? post.node.edge_liked_by.count : 0,
	media: post.node.display_url,
	text: post.node.edge_media_to_caption.edges.map(edge => edge.node.text).join(''),
	time: post.node.taken_at_timestamp,
	type: post.node.is_video ? 'video' : 'image',
	username: post.node.owner.username
}));

const fetchPosts = (id, posts, cursor, options) => {
	const postsLeft = options.count - posts.length;

	return got('https://www.instagram.com/graphql/query', {
		json: true,
		query: {
			query_hash: QUERY_HASH,
			variables: JSON.stringify({
				after: cursor,
				first: postsLeft,
				id
			})
		}
	}).then(response => {
		const currentPosts = response.body.data.user.edge_owner_to_timeline_media.edges;
		const info = response.body.data.user.edge_owner_to_timeline_media.page_info;
		const filteredPosts = filterPosts(transformPosts(currentPosts), options);

		if (info.has_next_page && (posts.length + filteredPosts.length) < options.count) {
			return fetchPosts(
				id,
				posts.concat(filteredPosts),
				info.end_cursor,
				options
			);
		}

		return posts.concat(filteredPosts.slice(0, postsLeft));
	});
};

module.exports = (user, opts) => {
	opts = Object.assign({count: 20}, opts);

	return got(`https://instagram.com/${user}`, {
		json: true,
		query: {__a: 1}
	}).then(response => {
		const currentUser = response.body.graphql.user;
		const currentPosts = currentUser.edge_owner_to_timeline_media.edges;
		const info = currentUser.edge_owner_to_timeline_media.page_info;
		const filteredPosts = filterPosts(transformPosts(currentPosts), opts);

		if (info.has_next_page && filteredPosts.length < opts.count) {
			return fetchPosts(currentUser.id, filteredPosts, info.end_cursor, opts);
		}

		return filteredPosts.slice(0, opts.count);
	});
};
