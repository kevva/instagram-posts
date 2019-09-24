import test from 'ava';
import instagramPosts from '.';

test('fetch posts', async t => {
	const [post, ...posts] = await instagramPosts('cats_of_instagram');

	t.is(posts.length, 19);
	t.is(typeof post.likes, 'number');
});

test('count option', async t => {
	t.is((await instagramPosts('cats_of_instagram', {count: 40})).length, 40);
});
