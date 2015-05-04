#!/usr/bin/env python

import twitter

api = twitter.Api(consumer_key='chIf0rkJhcHeADMsFOlPHFLcj',
		consumer_secret='cL0xX7V7Dw3gHL7fGawpCYpFjth0dQohEeI9ue0LJqEll6dCXv',
		access_token_key='20393025-kjF1f1xM2SnIayozP3wzyMMOPQqd9p7HQqtTkiKTx',
		access_token_secret='kcXAmWrZPASpnURCVEFAuCDHbatERGZazYHUZzcc8vivw')

#print api.VerifyCredentials()

x = 0

f = open('tweets_2015.txt', 'w')

tweets = api.GetSearch(term='rcb OR kkr', until='2015-05-03', count=100, lang='en', result_type='mixed', include_entities=False)
for tweet in tweets:
	f.write(tweet.AsJsonString())
	#print tweet.created_at#, "      ", tweet.text

last_bottom = tweets[99].id
x += 1

print "------------------"

while x < 100:
	tweets = api.GetSearch(term='rcb OR kkr', until='2015-05-03', max_id=last_bottom, count=100, lang='en', result_type='mixed', include_entities=False)

	for tweet in tweets:
		f.write(tweet.AsJsonString())
		#print tweet.created_at, "      ", tweet.text


	last_bottom = tweets[99].id	
	print "-----\nlast ", last_bottom
	x += 1
	print "x ", x


f.close()

