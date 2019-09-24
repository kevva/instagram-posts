'use strict';
const got = require('got');
const instagramUser = require('instagram-user');
const {extractHashtags, extractMentions} = require('twitter-text');

const QUERY_HASH = '58b6785bea111c67129decbe6a448951';

const filterPosts = (posts = [], options = {}) => posts.filter(post => {
	let pass = true;

	if (typeof options.filter === 'function') {
		pass = options.filter(post);
	}

	if (pass && Array.isArray(options.hashtags)) {
		pass = options.hashtags.every(hashtag => extractHashtags(post.text).includes(hashtag));
	}

	if (pass && Array.isArray(options.mentions)) {
		pass = options.mentions.every(mention => extractMentions(post.text).includes(mention));
	}

	return pass;
});

const transformPosts = (posts = []) => posts.map(({node}) => ({
	...node,
	comments: node.edge_media_to_comment ? node.edge_media_to_comment.count : 0,
	likes: node.edge_liked_by ? node.edge_liked_by.count : 0,
	media: node.display_url,
	text: node.edge_media_to_caption.edges.map(({node: {text}}) => text).join(''),
	time: node.taken_at_timestamp,
	type: node.is_video ? 'video' : 'image',
	username: node.owner.username
}));

const fetchPosts = async (id, posts = [], cursor, options = {}) => {
	const postsLeft = options.count - posts.length;
	const {
		data: {
			user: {
				edge_owner_to_timeline_media: {
					edges: currentPosts,
					page_info: {end_cursor, has_next_page}
				}
			}
		}
	} = await got('https://www.instagram.com/graphql/query', {
		searchParams: {
			query_hash: QUERY_HASH,
			variables: JSON.stringify({
				after: cursor,
				first: postsLeft,
				id
			})
		}
	}).json();

	const filteredPosts = filterPosts(transformPosts(currentPosts), options);

	if (has_next_page && (posts.length + filteredPosts.length) < options.count) {
		return fetchPosts(
			id,
			posts.concat(filteredPosts),
			end_cursor,
			options
		);
	}

	return posts.concat(filteredPosts.slice(0, postsLeft));
};

module.exports = async (username, options = {}) => {
	options = {count: 20, ...options};

	const {
		edge_owner_to_timeline_media: {
			edges: currentPosts,
			page_info: {end_cursor: endCursor, has_next_page}
		},
		id
	} = await instagramUser(username);

	const filteredPosts = filterPosts(transformPosts(currentPosts), options);

	if (has_next_page && filteredPosts.length < options.count) {
		return fetchPosts(id, filteredPosts, endCursor, options);
	}

	return filteredPosts.slice(0, options.count);
};
