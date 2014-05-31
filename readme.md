Distroweb
=========

##Inspiration##

This is a distributed static web server by [Andree Monette](https://www.github.com/andreecmonette) and myself.

We got the idea after attending a Stallman talk.  One of his points that we agreed with was that, while the internet *as a whole* is designed not to have a single failure point, information published on the web does not have the same resilience.  

If my server goes down, anything I was serving from it becomes inaccessible.  'The Cloud' is not an answer to this - it simply moves the failure point from my basement to some company's server farm.  Furthermore, it is trivially easy for ISPs, governments, or anyone else with control over the infrastructure, to selectively block IPs of which they disapprove.

Apart from technical resilience and politics, there are some interesting economic issues with the current system.  For example, the resources devoted to serving a file bear no direct relation to the demand for that file.  How awful to write an interesting blog post, and then be DDOS'ed by the people who want to hear your ideas!

It also leads to an odd symbiotic arms race between content providers and consumers; the former needs to monetize the latter in order to continue serving them.  The most common answer is advertising, which, in some cases, significantly diminishes the value of the content (consider advertising disguised as content on a review site, or a carefully designed photo essay surrounded by flashy banners).

As we were having this conversation, many of our friends had been working on bittorrent clients.  This got us thinking - the web as it currently works *forces its users to be leeches*.  What if, in the process of downloading a page, our computer transparently became a server for it as well?

##Architecture##

(Note:  This repository is a proof of concept.  Neither of us had used javascript or done any sort of networking before - we got distroweb working just well enough to demo and then moved on to other projects.  So, many things described below are only partially implemented or simply hard-coded.

At the moment, the only relatively easy part to demo is the distributed hash table.  Find 3 computers & follow the instructions in test/readme.)

Each computer that joins the network takes a random id, and accepts responsibility for tracking (not serving) files that hash close to that id.

At the same time, a proxy server starts up to filter browser requests.  Requests of the form distroweb/[hash] are sought on distroweb; all others are sent out to the regular web.  The proxy currently listens on port 1234, though the idea is for it to be usable on port 80 eventually.

So if you run `node distroWeb.js` and then direct your browser to `localhost:1234/www.google.com`, google will be loaded.  
Files on distroweb are identified by their hash.  A request to `localhost:1234/distroweb/ff0033` will initiate a search for a file identified as ff0033.  

1. Track request sent.  Every computer on distroweb is set up to forward tracking requests to the peer whose id has the smallest hamming distance from the file hash.  They will also add their own ip address to the request, allowing a response to be sent back without leaving connections open indefinitely.
2. Track request received.  When a request reaches a computer whose id is 'close enough' that they consider themselves responsible for tracking the file, it will look up its list of peers known to have the file and send this information back down the line.
3. Hosts identified.  Once the original requester knows who is serving the file, they try each peer in turn until one returns the file.  The file is then sent to the browser and displayed as a webpage.

##Remaining work##

There is a *lot* of low hanging fruit - things that would be easy to implement but that would dramatically improve the usability of the project.  Possibilities include using actual hashing to keep track of files; adding tests; destupidfying the internal protocols; adding validation to avoid crashes; and various refactoring.  

If know a little javascript, you're interested in this sort of thing, and you want to learn to contribute to open source projects, feel free to contact me!  I'm happy to work with you on your first pull request :).

