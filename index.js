'use strict';
const got = require('got');
const instagramUser = require('instagram-user');

const QUERY_HASH = '58b6785bea111c67129decbe6a448951';

const transformPosts = (posts = []) => posts.map(({node}) => ({
	...node,
	comments: node.edge_media_to_comment ? node.edge_media_to_comment.count : 0,
	likes: node.edge_liked_by ? node.edge_liked_by.count : 0,
	media: node.display_url,
	text: node.edge_media_to_caption.edges.map(({node: {text}}) => text).join(''),
	time: node.taken_at_timestamp,
	type: node.is_video ? 'video' : 'image',
	url: `https://www.instagram.com/p/${node.shortcode}`,
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

	let newPosts = transformPosts(currentPosts);

	if (typeof options.filter === 'function') {
		newPosts = newPosts.filter(options.filter);
	}

	if (has_next_page && (posts.length + newPosts.length) < options.count) {
		return fetchPosts(
			id,
			posts.concat(newPosts),
			end_cursor,
			options
		);
	}

	return posts.concat(newPosts.slice(0, postsLeft));
};

module.exports = async (username, options = {}) => {
	options = {count: 20, ...options};

	const {
		edge_owner_to_timeline_media: {
			edges: currentPosts,
			page_info: {end_cursor, has_next_page}
		},
		id
	} = await instagramUser(username);

	let newPosts = transformPosts(currentPosts);

	if (typeof options.filter === 'function') {
		newPosts = newPosts.filter(options.filter);
	}

	if (has_next_page && newPosts.length < options.count) {
		return fetchPosts(id, newPosts, end_cursor, options);
	}

	return newPosts.slice(0, options.count);
};
