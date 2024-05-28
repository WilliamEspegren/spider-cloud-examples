# The Plan

## Introduction

This is a perplexity clone app made in next.js and is using spider.cloud's api for search and scrape results.

- [On search] The app will make a request to the spider.cloud api and get the top 3-5 search results.
    - We will show the urls gathered from the search (providing feedback to the user, so they can see that it is actually working)
    - Scrape the urls
    - (maybe not needed) Vectorize and chunk the text?
    - Prompt an LLM with the markdown of the urls scraped
    - Stream response to user
