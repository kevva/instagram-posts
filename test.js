import test from 'ava';
import m from '.';

test('fetch posts', async t => {
	const [post, ...posts] = await m('cats_of_instagram');
	t.is(posts.length, 19);
	t.is(typeof post.likes, 'number');
});

test('count option', async t => {
	t.is((await m('cats_of_instagram', {count: 40})).length, 40);
});
