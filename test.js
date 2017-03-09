import test from 'ava';
import m from './';

test('fetch posts', async t => {
	const [post, ...posts] = await m('cats_of_instagram');
	t.is(posts.length, 19);
	t.is(typeof post.likes, 'number');
});

test('count option', async t => {
	const posts = await m('cats_of_instagram', {count: 40});
	t.is(posts.length, 40);
});

test('hashtags option', async t => {
	const posts = await m('cats_of_instagram', {hashtags: ['thishashtagdoesnotexist']});
	t.is(posts.length, 0);
});

test('mentions option', async t => {
	const posts = await m('cats_of_instagram', {mentions: ['thismentiondoesnotexist']});
	t.is(posts.length, 0);
});
