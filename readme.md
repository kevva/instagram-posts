# instagram-posts [![Build Status](https://travis-ci.org/kevva/instagram-posts.svg?branch=master)](https://travis-ci.org/kevva/instagram-posts)

> Get Instagram posts from a user


## Install

```
$ npm install instagram-posts
```


## Usage

```js
const instagramPosts = require('instagram-posts');

(async () => {
	console.log(await instagramPosts('cats_of_instagram'));
	/*
	[
		{
			id: 'BRWBBbXjT40',
			username: 'cats_of_instagram',
			time: 1488904930,
			type: 'image',
			likes: 809,
			comments: 10,
			text: 'This is my post',
			media: 'https://instagram.fbma1-1.fna.fbcdn.net/t51.2885-15/s640x640/sh0.08/e35/1231231_123123_1231231.jpg',
			…
		},
		…
	]
	*/
})();
```


## API

### instagramPosts(username, options?)

Returns a `Promise<Object[]>` with the users posts.

#### username

Type: `string`

Username to fetch posts from.

#### options

Type: `Object`

##### count

Type: `number`<br>
Default: `20`

Number of posts to fetch.

##### filter

Type: `Function`

Custom function to filter out posts, e.g:

```js
instagramPosts('cats_of_instagram', {
	filter: data => data.likes > 500
});
```
