import test from 'ava';
import instagramPosts from '.';

test('fetch posts', async t => {
	const [post, ...posts] = await instagramPosts('cats_of_instagram');

	t.is(posts.length, 19);
	t.is(typeof post.likes, 'number');
	t.regex(post.url, /https:\/\/www.instagram.com\/p\/[\w\d]+/);
});

test('count option', async t => {
	t.is((await instagramPosts('cats_of_instagram', {count: 40})).length, 40);
});
